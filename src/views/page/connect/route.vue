<script setup lang="ts">
//下面是监听全局变量
import { ref, reactive, onMounted } from 'vue';
import TypeIt from "@/components/ReTypeit";
// import { useWindowSize } from "@vueuse/core";
import { message } from "@/utils/message";
import { ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { postapi, getapi } from "@/api/user";

defineOptions({
  name: "route"
});
const activeNames = ref(['1'])
const ruleFormRef = ref<FormInstance>()
let loading = ref(true);//默认加载中
//表单字段定义
const ruleForm = reactive({
  lan_ipaddr: '',
  lan_netmask: '',//子网掩码
  dhcpEnabled: '',
  dhcpStart: '',
  dhcpEnd: '',
  dhcpLease_hour: ''
})
let info = ref();

onMounted(() => {
  //获取设置信息
  getapi('cmd=lan_ipaddr%2Clan_netmask%2Cmac_address%2CdhcpEnabled%2CdhcpStart%2CdhcpEnd%2CdhcpLease_hour&multi_data=1').then(res => {
    info.value = res;
    ruleForm.dhcpEnd = res.dhcpEnd;
    ruleForm.dhcpStart = res.dhcpStart;
    ruleForm.lan_ipaddr = res.lan_ipaddr;
    ruleForm.lan_netmask = res.lan_netmask;
    ruleForm.dhcpLease_hour = res.dhcpLease_hour;
    ruleForm.dhcpEnabled = res.dhcpEnabled == '1' ? '启用' : '关闭';
    loading.value = false;
  })
});
const is_ip = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error('请输入正确的IP'))
  }
  var pattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  const parts = value.split(".");
  for (var i = 0; i < parts.length; i++) {
    const num = parseInt(parts[i], 10);
    if (num < 0 || num > 255) return callback(new Error('请输入正确的IP'));
  }
  if (!pattern.test(value)) {
    callback(new Error('IP格式错误'))
    activeNames.value = ['1'];
  } else {
    return true;
    callback()
  }
}
const rules = reactive<FormRules<typeof ruleForm>>({
  lan_ipaddr: [{ validator: is_ip, trigger: 'blur' }],
  dhcpStart: [{ validator: is_ip, trigger: 'blur' }],
  dhcpEnd: [{ validator: is_ip, trigger: 'blur' }],
  lan_netmask: [{ validator: is_ip, trigger: 'blur' }]
})
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  // 初始化字段信息
  formEl.clearValidate()
  formEl.validate((valid) => {
    if (valid) {
      const isen = ruleForm.dhcpEnabled == '启用' ? '1' : '0';
      if (ruleForm.lan_ipaddr == info.value.lan_ipaddr && ruleForm.lan_netmask == info.value.lan_netmask && isen == info.value.dhcpEnabled
        && ruleForm.dhcpStart == info.value.dhcpStart && ruleForm.dhcpLease_hour == info.value.dhcpLease_hour) {
        message("未修改内容", { type: "warning" });
        return;
      }
      if (!isStartIpLessThanEndIp(ruleForm.dhcpStart, ruleForm.dhcpEnd)) {
        message("开始ip不能大于结束ip", { type: "warning" });
        return;
      }
      if (!isIpInRange(ruleForm.lan_ipaddr, ruleForm.dhcpStart, ruleForm.dhcpEnd, ruleForm.lan_netmask) && isen == '1') {
        console.log(ruleForm.lan_ipaddr, ruleForm.dhcpStart, ruleForm.dhcpEnd);
        message("DHCP地址池不在你设置的IP段里面", { type: "warning" });
        return;
      }
      let post_data;
      if (isen == '0') {
        post_data = {
          'goformId': 'DHCP_SETTING',
          'lanIp': ruleForm.lan_ipaddr,
          'lanNetmask': ruleForm.lan_netmask,
          'lanDhcpType': 'DISABLE',
          'dhcp_reboot_flag': '1',
        }
      } else {
        post_data = {
          'goformId': 'DHCP_SETTING',
          'lanIp': ruleForm.lan_ipaddr,
          'lanNetmask': ruleForm.lan_netmask,
          'lanDhcpType': 'SERVER',
          'dhcpStart': ruleForm.dhcpStart,
          'dhcpEnd': ruleForm.dhcpEnd,
          'dhcpLease': ruleForm.dhcpLease_hour,
          'dhcp_reboot_flag': '1',
        }
      }
      ElMessageBox.confirm(
        `该操作会重启设备，需要继续吗？`,
        {
          confirmButtonText: '继续',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        loading.value = true;
        postapi(post_data).then(res => {
          if (res.result == "success") {
            loading.value = false;
            message("成功发送请求", { type: "success" });
          } else {
            loading.value = false;
            message("操作失败", { type: "error" });
          }
        }).catch(error => {
          loading.value = false;
          message("请求失败", { type: "error" });
        });
      }).catch(() => {
        // console.log('取消');
      })
    } else {
      message("请检查表单内容", { type: "error" });
      return false
    }
  })
}
//判断ip是否在地址段里面
function isIpInRange(ipAddress, startIp, endIp, subnetMask) {
  var ipParts = ipAddress.split(".");
  var startParts = startIp.split(".");
  var endParts = endIp.split(".");
  var maskParts = subnetMask.split(".");

  var ipNum = convertIpToNumber(ipParts);
  var startNum = convertIpToNumber(startParts);
  var endNum = convertIpToNumber(endParts);
  var maskNum = convertIpToNumber(maskParts);

  var networkStart = (startNum & maskNum);
  var networkEnd = (endNum & maskNum);
  var ipNetwork = (ipNum & maskNum);

  if (ipNetwork >= networkStart && ipNetwork <= networkEnd) {
    return true;
  } else {
    return false;
  }
}

function convertIpToNumber(ipParts) {
  var ipNum = 0;

  for (var i = 0; i < 4; i++) {
    ipNum = (ipNum << 8) + parseInt(ipParts[i], 10);
  }

  return ipNum;
}

//判断开始ip是否大于结束ip
function isStartIpLessThanEndIp(startIp, endIp) {
  var startParts = startIp.split(".");
  var endParts = endIp.split(".");
  for (var i = 0; i < 4; i++) {
    var startNum = parseInt(startParts[i], 10);
    var endNum = parseInt(endParts[i], 10);
    if (startNum > endNum) {
      return false;
    }
  }
  return true;
}
</script>

<template>
  <div>
    <el-row :gutter="24">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16" class="mb-[5px]" v-motion :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }">
        <el-card shadow="never" v-loading="loading">
          <template #header>
            <TypeIt :className="'type-it1'" :values="['Wi-Fi 路由设置']" :cursor="false" :speed="60" />
          </template>
          <template #default>
            <div class="form-container">
              <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" status-icon label-width="120px"
                class="demo-ruleForm" label-position="left">
                <el-form-item label="IP地址" prop="lan_ipaddr">
                  <el-input v-model="ruleForm.lan_ipaddr" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="子网掩码" prop="lan_netmask">
                  <el-input v-model="ruleForm.lan_netmask" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="DHCP服务">
                  <el-radio-group v-model="ruleForm.dhcpEnabled">
                    <el-radio border label="启用" />
                    <el-radio border label="关闭" />
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="DHCP IP池-开始" prop="dhcpStart" v-if="ruleForm.dhcpEnabled == '启用'">
                  <el-input v-model="ruleForm.dhcpStart" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="DHCP IP池-结束" prop="dhcpEnd" v-if="ruleForm.dhcpEnabled == '启用'">
                  <el-input v-model="ruleForm.dhcpEnd" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="DHCP租期" prop="dhcp_time" v-if="ruleForm.dhcpEnabled == '启用'">
                  <el-input v-model="ruleForm.dhcpLease_hour" type="number" autocomplete="off">
                    <template #append> 小时 </template>
                  </el-input>
                </el-form-item>
                <el-form-item class="form-buttons">
                  <el-button type="primary" @click="submitForm(ruleFormRef)">应用</el-button>
                </el-form-item>
                <el-button style="visibility: hidden;"></el-button>
              </el-form>
            </div>
          </template>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8" class="mb-[5px]" v-motion :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }">
        <el-card shadow="never">
          <template #header>
            <TypeIt :className="'type-it2'" :values="['Wi-Fi 路由设置帮助']" :cursor="false" :speed="60" />
          </template>
          <template #default>
            <el-collapse v-model="activeNames">
              <el-collapse-item title="IP 地址" name="1">
                路由器局域网的IP地址，使用该IP地址可以通过浏览器管理设备。
              </el-collapse-item>
              <el-collapse-item title="子网掩码" name="2">
                对应 IP 地址的子网掩码
              </el-collapse-item>
              <el-collapse-item title="DHCP服务启用" name="3">
                如果开启DHCP（Dynamic Host Configuration Protocol，动态主机配置协议）服务，设备将会为所连接的客户端自动分配IP地址。
              </el-collapse-item>
              <el-collapse-item title="DHCP服务关闭" name="4">
                如果关闭DHCP服务，设备将不会为连接的客户端自动分配IP地址，客户端必须手动输入IP地址。
              </el-collapse-item>
              <el-collapse-item title="DHCP IP 池" name="5">
                起始IP地址和终止IP地址指定了DHCP服务器分配给接入设备的IP地址范围。这个范围之外的地址不能由DHCP服务器分配。
              </el-collapse-item>
              <el-collapse-item title="DHCP 租期时间" name="6">
                租期时间表示计算机获取IP地址后可以使用这个IP地址的期限，到达租期时间后，如果客户端需要继续使用这个地址，必须在到期前重新发起请求。只有当原来的客户端租期到期并且不再发起续租请求时，这个地址才能分配给其他客户端使用。
              </el-collapse-item>
            </el-collapse>
          </template>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.form-container {
  position: relative;
}

.form-buttons {
  right: 0;
  display: flex;
  position: absolute;
  align-items: flex-end;
  justify-content: flex-end;
}
</style>