<script setup lang="ts">
import { postapi, getapi } from "@/api/user";
import { message } from "@/utils/message";
import TypeIt from "@/components/ReTypeit";
import { ref, reactive, onMounted } from 'vue';
defineOptions({
  name: "DDNS"
});
let load_switch = ref(false);//默认加载中
//表单字段定义
const ruleForm = reactive({
  ddnsSetMode: '',
  mode_select: '',
  ddns_address: '',
  ddns_account: '',
  ddns_passwd: '',
  DDNS: '',
  DDNS_Hash_Value: '',
  DDNS_STATUS: ''
})
onMounted(() => {
  init();//初始化
});
function init() {
  getapi('multi_data=1&cmd=DDNS_Enable%2CDDNS_Mode%2CDDNSProvider%2CDDNSAccount%2CDDNSPassword%2CDDNS%2CDDNS_Hash_Value', true).then(res => {
    console.log(res);
    ruleForm.ddnsSetMode = res.DDNS_Enable == '0' ? '关闭' : '开启';
    ruleForm.mode_select = res.DDNS_Mode == 'auto' ? '自动' : '手动';
    // ruleForm.AcsName = res.tr069_acs_username;
    // ruleForm.pwdAcsPassword = res.tr069_acs_password;
    // ruleForm.AcsAddress = res.tr069_acs_url;
    // ruleForm.ReportCycle = res.tr069_inform_interval;
    // ruleForm.cpeAuthEnable = res.tr069_cpe_auth_enable == '0' ? '关闭' : '开启';
    // ruleForm.CpeName = res.tr069_cpe_username;
    // ruleForm.pwdCpePassword = res.tr069_cpe_password;
  });
}
function submitForm() {
  if (ruleForm.ddns_account == '') {
    return message("用户不能为空", { type: "error" });
  }
  if (ruleForm.ddns_passwd == '') {
    return message("密码不能为空", { type: "error" });
  }
  if (ruleForm.ddns_address == '') {
    return message("域名不能为空", { type: "error" });
  }
  if (ruleForm.ddns_address == 'freedns.afraid.org' && ruleForm.DDNS_Hash_Value == '') {
    return message("Hash 值不能为空", { type: "error" });
  }
  load_switch.value = true;
  postapi({
    'goformId': 'DDNS',
    'DDNS_Enable': ruleForm.ddnsSetMode == '开启' ? '1' : '0',
    'DDNS_Mode': ruleForm.mode_select == '自动' ? 'auto' : 'manual',
    'DDNSProvider': ruleForm.ddns_address,
    'DDNS': ruleForm.DDNS,
    'DDNSPassword': ruleForm.ddns_passwd,
    'DDNSAccount': ruleForm.ddns_account,
    'DDNS_Hash_Value': ruleForm.DDNS_Hash_Value
  }).then(res => {
    if (res.result == "success") {
      load_switch.value = false;
      message("成功发送连接请求", { type: "success" });
    } else {
      load_switch.value = false;
      message("设置失败", { type: "error" });
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
            <TypeIt :className="'type-it1'" :values="['DDNS设置']" :cursor="false" :speed="60" />
          </template>
          <template #default>
            <div class="form-container">
              <el-form ref="ruleFormRef" :model="ruleForm" status-icon label-width="120px" class="demo-ruleForm"
                label-position="left">
                <el-form-item label="DDNS">
                  <el-radio-group v-model="ruleForm.ddnsSetMode">
                    <el-radio border label="开启" style="margin-left: 10px;margin-top: 5px;" />
                    <el-radio border label="关闭" style="margin-left: 10px;margin-top: 5px;" />
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="DDNS模式" prop="mode_select">
                  <el-select v-model="ruleForm.mode_select" :fit-input-width="true" style="width: 100%;">
                    <el-option label="手动" value="manual" />
                    <el-option label="自动" value="auto" />
                  </el-select>
                </el-form-item>
                <el-form-item label="动态DNS服务器" prop="ddns_address">
                  <el-select v-model="ruleForm.ddns_address" :fit-input-width="true" style="width: 100%;">
                    <el-option label="dyndns.org" value="dyndns.org" />
                    <el-option label="freedns.afraid.org" value="freedns.afraid.org" />
                    <el-option label="zoneedit.com" value="zoneedit.com" />
                    <el-option label="no-ip.com" value="no-ip.com" />
                    <el-option label="None" value="" />
                  </el-select>
                </el-form-item>
                <el-form-item label="用户" prop="ddns_account">
                  <el-input id="ddns_account" v-model="ruleForm.ddns_account" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="密码" prop="ddns_passwd">
                  <el-input v-model.number="ruleForm.ddns_passwd" type="password" :show-password="true" />
                </el-form-item>
                <el-form-item label="域名" prop="DDNS">
                  <el-input id="DDNS" v-model="ruleForm.DDNS" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="Hash 值" prop="DDNS_Hash_Value" v-if="ruleForm.ddns_address == 'freedns.afraid.org'">
                  <el-input id="DDNS_Hash_Value" v-model="ruleForm.DDNS_Hash_Value" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="DDNS 状态">
                  <el-input v-model.number="ruleForm.DDNS_STATUS" disabled />
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
            <el-text class="mx-1">您可以设置动态域名服务，为动态WAN IP地址分配一个固定域名。<br></el-text>
            <el-text class="mx-1"><b>动态DNS服务器</b>：设置提供动态域名服务的服务器。<br></el-text>
            <el-text class="mx-1"><b>密码</b>：密码的有效字符包含：0-9 a-z A-Z ! # $ * + , - . % : = ? @ [ ] ^ _ { | } ~<br></el-text>
            <el-text class="mx-1"><b>域名</b>：设置要申请的域名。<br></el-text>
            <el-text class="mx-1"><b>Hash 值</b>：DDNS哈希值，在使用freedns服务器的时候需要。有效字符包含：0-9 a-z A-Z 或 =</el-text>
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