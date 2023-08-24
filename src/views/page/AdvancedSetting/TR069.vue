<script setup lang="ts">
import { postapi, getapi } from "@/api/user";
import { message } from "@/utils/message";
import { ElMessageBox } from 'element-plus';
import TypeIt from "@/components/ReTypeit";
import { ref, reactive, onMounted } from 'vue';
defineOptions({
  name: "TR069"
});
let load_switch = ref(false);//默认加载中
//表单字段定义
const ruleForm = reactive({
  AcsName: '',
  pwdAcsPassword: '',
  AcsAddress: '',
  tr069Server: '',
  InformEnable: '',
  ReportCycle: '',
  cpeAuthEnable: '',
  CpeName: '',
  pwdCpePassword: ''
})
onMounted(() => {
  init();//初始化
});
function init() {
  getapi('cmd=tr069_enable%2Ctr069_acs_username%2Ctr069_acs_password%2Ctr069_acs_url%2Ctr069_inform_enable%2Ctr069_inform_interval%2Ctr069_cpe_auth_enable%2Ctr069_cpe_username%2Ctr069_cpe_password&multi_data=1', true).then(res => {
    console.log(res);
    ruleForm.AcsName = res.tr069_acs_username;
    ruleForm.pwdAcsPassword = res.tr069_acs_password;
    ruleForm.AcsAddress = res.tr069_acs_url;
    ruleForm.tr069Server = res.tr069_enable == '0' ? '关闭' : '开启';
    ruleForm.InformEnable = res.tr069_inform_enable == '0' ? '关闭' : '开启';
    ruleForm.ReportCycle = res.tr069_inform_interval;
    ruleForm.cpeAuthEnable = res.tr069_cpe_auth_enable == '0' ? '关闭' : '开启';
    ruleForm.CpeName = res.tr069_cpe_username;
    ruleForm.pwdCpePassword = res.tr069_cpe_password;
  });
}
function submitForm() {
  if (ruleForm.AcsAddress == '') {
    return message("ACS地址不能为空", { type: "error" });
  }
  if (ruleForm.InformEnable == '开启' && ruleForm.ReportCycle == '') {
    return message("定期上报周期(s)不能为空", { type: "error" });
  }
  if (ruleForm.InformEnable == '开启' && parseInt(ruleForm.ReportCycle) <= 0) {
    return message("定期上报周期(s)不能小于1", { type: "error" });
  }
  ElMessageBox.confirm(
    `该操作将会重启设备，你确定要继续执行该操作吗？`,
    {
      confirmButtonText: '继续',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    load_switch.value = true;
    postapi({
      'goformId': 'GORORM_SET_TR069',
      'tr069enanble': ruleForm.tr069Server == '开启' ? '1' : '0',
      'tr069AcsName': ruleForm.AcsName,
      'tr069AcsPassword': ruleForm.pwdAcsPassword,
      'tr069AcsAddress': ruleForm.AcsAddress,
      'tr069InformEnable': ruleForm.InformEnable == '开启' ? '1' : '0',
      'tr069InformInterval': ruleForm.ReportCycle,
      'tr069AuthEnable': ruleForm.cpeAuthEnable == '开启' ? '1' : '0',
      'tr069CpeName': ruleForm.CpeName,
      'tr069CpePassword': ruleForm.pwdCpePassword
    }).then(res => {
      if (res.result == "success") {
        load_switch.value = false;
        message("成功发送连接请求", { type: "success" });
      } else {
        load_switch.value = false;
        message("连接失败", { type: "error" });
      }
    }).catch(error => {
      load_switch.value = false;
      message("请求失败", { type: "error" });
    });
  }).catch(() => {
    // console.log('取消');
  })
}
</script>

<template>
  <div>
    <el-row :gutter="24">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16" class="mb-[5px]" v-motion :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }">
        <el-card shadow="never" v-loading="load_switch">
          <template #header>
            <TypeIt :className="'type-it1'" :values="['TR069设置']" :cursor="false" :speed="60" />
          </template>
          <template #default>
            <div class="form-container">
              <el-form ref="ruleFormRef" :model="ruleForm" status-icon label-width="120px" class="demo-ruleForm"
                label-position="left">
                <el-form-item label="TR069">
                  <el-radio-group v-model="ruleForm.tr069Server">
                    <el-radio border label="开启" style="margin-left: 10px;margin-top: 5px;" />
                    <el-radio border label="关闭" style="margin-left: 10px;margin-top: 5px;" />
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="ACS用户名" prop="AcsName">
                  <el-input id="AcsName" v-model="ruleForm.AcsName" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="ACS密码" prop="pwdAcsPassword">
                  <el-input v-model.number="ruleForm.pwdAcsPassword" type="password" :show-password="true" />
                </el-form-item>
                <el-form-item label="ACS地址" prop="AcsAddress">
                  <el-input id="AcsAddress" v-model="ruleForm.AcsAddress" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="定期上报">
                  <el-radio-group v-model="ruleForm.InformEnable">
                    <el-radio border label="开启" style="margin-left: 10px;margin-top: 5px;" />
                    <el-radio border label="关闭" style="margin-left: 10px;margin-top: 5px;" />
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="定期上报周期(s)" prop="ReportCycle">
                  <el-input id="ReportCycle" v-model="ruleForm.ReportCycle" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="连接请求认证">
                  <el-radio-group v-model="ruleForm.cpeAuthEnable">
                    <el-radio border label="开启" style="margin-left: 10px;margin-top: 5px;" />
                    <el-radio border label="关闭" style="margin-left: 10px;margin-top: 5px;" />
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="连接请求用户名" prop="CpeName">
                  <el-input id="CpeName" v-model="ruleForm.CpeName" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="连接请求密码" prop="pwdCpePassword">
                  <el-input v-model.number="ruleForm.pwdCpePassword" type="password" :show-password="true" />
                </el-form-item>
                <el-form-item class="form-buttons">
                  <el-button type="primary" @click="submitForm()">应用</el-button>
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
            <TypeIt :className="'type-it2'" :values="['说明']" :cursor="false" :speed="60" />
          </template>
          <template #default>
            <el-text class="mx-1">TR-069（Technical Report 069）是由Broadband Forum（前身为DSL Forum）定义的一种远程管理协议，也被称为CPE WAN<br>
              Management Protocol（CWMP）。它用于远程管理和配置互联网服务提供商（ISP）提供的网络设备，如路由器、调制解调器和网关。<br>
              TR-069的主要目标是简化和标准化设备的远程管理，提供一种统一的方式来配置、监控和维护这些设备。它允许ISP通过远程连接访问设备，并执行各种管理操作，如配置网络参数、升级固件、收集设备状态和统计信息等。<br>
              TR-069协议基于客户端/服务器模型，其中网络设备作为客户端（也称为CPE，Customer Premises Equipment），而ISP的管理服务器作为服务器（也称为ACS，Auto<br>
              Configuration Server）。ACS可以向CPE发送配置命令和请求，并接收设备的响应和报告。<br>
              使用TR-069协议的好处包括：<br>
              - 远程管理：ISP可以通过网络远程管理设备，无需物理接入设备所在位置。<br>
              - 自动配置：设备可以自动获取和应用来自ACS的配置，简化了设备的部署和维护过程。<br>
              - 远程故障排除和诊断：ISP可以通过TR-069协议监控设备状态和收集日志，以便快速识别和解决问题。<br>
              - 固件升级：ISP可以通过协议向设备推送固件升级，确保设备始终运行最新的软件版本。<br>
              - 统计信息和报告：TR-069允许设备向ACS发送各种统计数据和报告，帮助ISP进行网络性能分析和规划。<br>
              总而言之，TR-069是一种用于远程管理和配置网络设备的协议，它简化了设备管理和维护的过程，并提供了一种标准化的方式来管理大规模的设备部署。</el-text>
          </template>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<style>
.icon-card {
  text-align: center;
}

.icon-container {
  display: inline-block;
}

.centered-icon {
  display: inline-block;
  font-size: 48px;
}
</style>