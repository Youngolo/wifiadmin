<script setup lang="ts">
//下面是监听全局变量
import { useStore } from 'vuex';
import { ref, watchEffect, reactive } from 'vue';
import TypeIt from "@/components/ReTypeit";
// import { useWindowSize } from "@vueuse/core";
import { message } from "@/utils/message";
import type { FormInstance } from 'element-plus';
import { fm_set_device_parameters, fm_get_device_information } from "@/api/user";
defineOptions({
  name: "NetSwitch"
});
const ruleFormRef = ref<FormInstance>()
let fminfo = ref({});
let table_list_1 = ref([]);//飞猫设备信息，字符串
let table_list_2 = ref([]);//飞猫设备信息，布尔
let old = ref('');
const store = useStore();
let load_switch = ref(true);//默认加载中
//表单字段定义
const ruleForm = reactive({
  resource: ''
})
let is_ok = ref(false);
// 监听 signal 变量的变化
watchEffect(() => {
  // 将字符串转换为小写，并使用正则表达式替换空格为空字符串
  let oldnet, newnet;
  oldnet = old.value.toLowerCase().replace(/\s/g, "");
  newnet = store.state.NetWork.network_provider.toLowerCase().replace(/\s/g, "");
  if (oldnet == newnet && load_switch.value == true) load_switch.value = false;
  if (ruleForm && ruleForm.resource == '' && store.state.NetInfo.lan_ipaddr != '') {
    const str = store.state.NetWork.network_provider;
    // 将字符串转为小写并去掉空格
    const processedStr = str.toLowerCase().replaceAll(" ", "");
    // 使用正则表达式匹配 chinamobile、chinatelecom、chinaunicom，并进行相应替换
    ruleForm.resource = processedStr.replace(/chinamobile|chinatelecom|chinaunicom/g, (match) => {
      switch (match) {
        case 'chinamobile':
          return '中国移动';
        case 'chinatelecom':
          return '中国电信';
        case 'chinaunicom':
          return '中国联通';
        default:
          return '';
      }
    });
    console.log('请求获取信息', ruleForm.resource, store.state.NetInfo.lan_ipaddr);
    if (ruleForm.resource != '' && store.state.NetInfo.lan_ipaddr != '') {
      fm_get_device_information(store.state.NetInfo.lan_ipaddr).then(data => {
        fminfo.value = data;
        table_list_1.value = [
          { name: '协议版本号', date: data.protocol_version },
          { name: '版本代码', date: data.version_code },
          { name: '数据类型', date: data.this_data_type },
          { name: '工厂名', date: data.factory_name },
          { name: '型号名', date: data.model_name },
          { name: 'SIM卡切换', date: data.sim_switch },
          { name: '槽位切换', date: data.slot_switch },
          { name: 'IMEI数据', date: data.imei_data },
          { name: 'ICCID数据', date: data.iccid_data },
          { name: '在线运营商', date: data.online_operator },
          { name: '当前SIM卡槽位', date: data.current_sim_slot },
          { name: '信号强度', date: data.signal_strength },
          { name: '心跳间隔', date: data.heart_beat_intv },
          { name: 'SIM卡状态', date: data.sim_card_state }
        ];
        table_list_2.value = [
          { name: 'SSID名称', date: data.ssid_name },
          { name: 'SSID密码', date: data.ssid_password },
          { name: 'SSID加密模式', date: data.ssid_encryption_mode },
          { name: 'SSID是否激活', date: data.is_ssid_active },
          { name: 'SSID是否隐藏', date: data.is_ssid_hiden },
          { name: '支持SIM卡切换功能', date: (data.function_list.support_switchsim ? '支持' : '不支持') },
          { name: '支持设置无线网络功能', date: (data.function_list.support_setwifi ? '支持' : '不支持') },
          { name: '支持恢复出厂设置功能', date: (data.function_list.support_factory ? '支持' : '不支持') },
          { name: '支持关机功能', date: (data.function_list.support_shutdown ? '支持' : '不支持') },
          { name: '支持重启功能', date: (data.function_list.support_restart ? '支持' : '不支持') }
        ];
        load_switch.value = false;
        is_ok.value = true;
      }).catch(error => {
        is_ok.value = false;
        load_switch.value = false;
        console.log('请求失败', error);
      });
    }
  }
});
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  // 初始化字段信息
  formEl.clearValidate()
  formEl.validate((valid) => {
    if (valid) {
      const yq = ruleForm.resource == '中国移动' ? 'CHINA MOBILE' : ruleForm.resource == '中国电信' ? 'CHINA TELECOM' : ruleForm.resource == '中国联通' ? 'CHINA UNICOM' : '';
      const ip = store.state.NetInfo.lan_ipaddr;
      console.log('提交的内容：', yq, ip, ruleForm);
      if (yq == '') return message("请选择网络运营商", { type: "error" });
      if (ip == '') return message("ip获取失败，请刷新页面再试", { type: "error" });
      if (Object.keys(fminfo.value).length === 0) message("设备信息获取失败，请刷新页面再试", { type: "error" });
      const post_data = {
        protocol_version: fminfo.value.protocol_version,
        this_data_type: fminfo.value.this_data_type,
        imei_data: fminfo.value.imei_data,
        command_list: {
          sim_switch_to: yq
        }
      }
      if (is_ok.value == true) {
        old.value = yq;
        load_switch.value = true;
        fm_set_device_parameters(ip, post_data).then(res => {
          console.log(res);
          if (res.Code == 200) {
            message("成功发送请求", { type: "success" });
          } else {
            load_switch.value = false;
            message("操作失败", { type: "error" });
          }
        }).catch(error => {
          load_switch.value = false;
          message("请求失败", { type: "error" });
        });
      } else {
        old.value = yq;
        load_switch.value = true;
        fm_set_device_parameters(ip, post_data).then(res => {
          console.log(res);
          if (res.Code == 200) {
            message("成功发送请求", { type: "success" });
          } else {
            load_switch.value = false;
            message("操作失败", { type: "error" });
          }
        }).catch(error => {
          load_switch.value = false;
          message("好像是跨域了，不能请求", { type: "error" });
        });
      }
    } else {
      message("请检查表单内容", { type: "error" });
      return false
    }
  })
}
function go_web() {
  window.open('https://blog.csdn.net/tsl_280/article/details/121331300', '_blank');
}
</script>

<template>
  <div>
    <el-row :gutter="24">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb-[5px]" v-motion :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }">
        <el-tag style="width: 100%;margin-bottom: 5px;white-space: normal;" size="large" effect="dark">
          此页面可能只适用于飞猫U3设备，支持查询APP获取到的设备信息及切换飞猫物联网卡的运营商。
        </el-tag>
        <el-card shadow="never" v-loading="load_switch">
          <template #header>
            <div class="card-header">
              <div class="type-it-container">
                <TypeIt :className="'type-it1'" :values="['飞猫物联网卡运营商切换']" :cursor="false" :speed="60" />
              </div>
              <div class="button-container">
                <el-button plain @click="go_web">允许跨域设置</el-button>
              </div>
            </div>
          </template>
          <template #default>
            <div class="form-container">
              <el-form ref="ruleFormRef" :model="ruleForm" status-icon label-width="120px" class="demo-ruleForm"
                label-position="left">
                <el-form-item label="请选择运营商">
                  <el-radio-group v-model="ruleForm.resource">
                    <el-radio border label="中国移动" />
                    <el-radio border label="中国联通" />
                    <el-radio border label="中国电信" />
                  </el-radio-group>
                </el-form-item>
                <el-form-item class="form-buttons">
                  <el-button type="primary" @click="submitForm(ruleFormRef)">应用</el-button>
                </el-form-item>
                <el-button style="visibility: hidden;"></el-button>
              </el-form>
            </div>
            <el-table :data="table_list_2" style="width: 100%" v-if="is_ok">
              <el-table-column prop="name" label="项目" />
              <el-table-column prop="date" label="值" />
            </el-table>
          </template>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb-[5px]" v-motion :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }" v-if="is_ok">
        <el-card shadow="never">
          <template #header>
            <TypeIt :className="'type-it3'" :values="['设备信息']" :cursor="false" :speed="60" />
          </template>
          <template #default>
            <el-table :data="table_list_1" style="width: 100%">
              <el-table-column prop="name" label="项目" />
              <el-table-column prop="date" label="值" />
            </el-table>
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.button-container {
  height: 0px;
  margin-top: -30px;
}
</style>