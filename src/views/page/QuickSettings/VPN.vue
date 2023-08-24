<script setup lang="ts">
import { postapi, getapi } from "@/api/user";
import { message } from "@/utils/message";
import TypeIt from "@/components/ReTypeit";
import { ref, reactive, onMounted, onUnmounted } from 'vue';
defineOptions({
  name: "VPN"
});
let load_switch = ref(false);//默认加载中
//表单字段定义
const ruleForm = reactive({
  vpn_Name: '',
  vpn_Pass: '',
  vpn_Type: 'l2tp',
  vpn_server_ip: ''
})
let intervalId;
onMounted(() => {
  intervalId = setInterval(function () {
    getapi('cmd=vpn_name%2Cvpn_password%2Cvpn_server_ip%2Cvpn_state%2Cvpn_type%2Cvpn_mode%2Cconnect_status%2Cvpn_status&multi_data=1', true).then(res => {
      console.log(res);
      const b = res.vpn_name != '' && res.vpn_password != '' && res.vpn_type != '' && res.vpn_server_ip != '';
      const a = ruleForm.vpn_Name == '' || ruleForm.vpn_Pass == '' || ruleForm.vpn_Type == '' || ruleForm.vpn_server_ip == '';
      if (a && b) {
        ruleForm.vpn_Name = res.vpn_name;
        ruleForm.vpn_Pass = res.vpn_password;
        ruleForm.vpn_Type = res.vpn_type;
        ruleForm.vpn_server_ip = res.vpn_server_ip;
      }
    });
  }, 1000); // 1000毫秒等于1秒
});
//页面卸载
onUnmounted(() => {
  clearInterval(intervalId);
});
function submitForm() {
  if (ruleForm.vpn_server_ip == '') {
    return message("服务器IP不能为空", { type: "error" });
  }
  load_switch.value = true;
  postapi({
    'goformId': 'GOFORM_OPEN_VPN',
    'vpn_name': ruleForm.vpn_Name,
    'vpn_type': ruleForm.vpn_Type,
    'vpn_password': ruleForm.vpn_Pass,
    'vpn_server_ip': ruleForm.vpn_server_ip
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
}
</script>

<template>
  <div>
    <el-row :gutter="24">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16" class="mb-[5px]" v-motion :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }">
        <el-card shadow="never" v-loading="load_switch">
          <template #header>
            <TypeIt :className="'type-it1'" :values="['VPN设置']" :cursor="false" :speed="60" />
          </template>
          <template #default>
            <div class="icon-card" style="margin-top: -15px;">
              <div class="icon-container">
                <div class="centered-icon">
                  <iconify-icon-online style="width: 120px;height: 120px;" icon="carbon:vpn" />
                </div>
              </div>
            </div>
            <div class="form-container">
              <el-form ref="ruleFormRef" :model="ruleForm" status-icon label-width="120px" class="demo-ruleForm"
                label-position="left">
                <el-form-item label="用户名" prop="vpn_Name">
                  <el-input id="vpn_Name" v-model="ruleForm.vpn_Name" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="密码" prop="vpn_Pass">
                  <el-input v-model.number="ruleForm.vpn_Pass" type="password" :show-password="true" />
                </el-form-item>
                <el-form-item label="服务器IP地址" prop="vpn_server_ip">
                  <el-input id="vpn_server_ip" v-model="ruleForm.vpn_server_ip" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="协议类型" prop="vpn_Type">
                  <el-select v-model="ruleForm.vpn_Type" :fit-input-width="true" style="width: 100%;">
                    <el-option label="使用证书的(L2TP)" value="l2tp" />
                    <el-option label="点对点隧道协议(PPTP)" value="pptp" />
                  </el-select>
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
            <el-text class="mx-1"><b>VPN开关按钮颜色信息：</b>：<br></el-text>
            <el-text class="mx-1">灰色：VPN未连接，单击按钮连接<br></el-text>
            <el-text class="mx-1">蓝色：VPN连接正常，单击按钮断开连接<br></el-text>
            <el-text class="mx-1">红色：VPN连接异常，单击按钮重新连接<br></el-text>
            <el-text class="mx-1">闪烁：VPN正在连接，不可操作</el-text>
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