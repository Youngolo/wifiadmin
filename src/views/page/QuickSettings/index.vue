<script setup lang="ts">
//下面是监听全局变量
import { useStore } from 'vuex';
import { ref, watchEffect, reactive } from 'vue';
import TypeIt from "@/components/ReTypeit";
// import { useWindowSize } from "@vueuse/core";
import { message } from "@/utils/message";
import { postapi } from "@/api/user";
import type { FormInstance, FormRules } from 'element-plus'

defineOptions({
  name: "QuickSettings"
});
let isload = ref(false);
const ruleFormRef = ref<FormInstance>()
let newinfo = ref({});
let allinfo = ref({});
const store = useStore();
// const { height } = useWindowSize();
let switch_wifi = ref(false);//数据启动/停止
let load_switch = ref(false);//默认加载中
//折叠面板
const activeNames = ref(['1'])
const handleChange = (val: string[]) => {
  console.log(val)
}
//表单字段定义
const ruleForm = reactive({
  ssid: '',
  Pass: '',
  SafeMode: '',
  resource: ''
})
let Old_form = [];
// 监听 signal 变量的变化
watchEffect(() => {
  newinfo.value = store.state.NetWork;
  allinfo.value = store.state.NetInfo;
  switch_wifi.value = store.state.NetWork.wifi_cur_state == '1' ? true : false;
  if (load_switch.value == true && switch_wifi.value == true) load_switch.value = false;
  // console.log(isload.value);
  if (ruleForm && (ruleForm.ssid == '' || ruleForm.Pass == '') && isload.value == false) {
    const zt = store.state.NetInfo.HideSSID ? store.state.NetInfo.HideSSID : store.state.NetInfo.m_HideSSID;
    ruleForm.resource = zt == '1' ? '隐藏' : '广播';
    ruleForm.ssid = store.state.NetWork.SSID1 != '' ? store.state.NetWork.SSID1 : store.state.NetInfo.m_SSID;
    ruleForm.Pass = atob(store.state.NetInfo.WPAPSK1_encode != '' ? store.state.NetInfo.WPAPSK1_encode : store.state.NetInfo.m_WPAPSK1_encode);
    ruleForm.SafeMode = store.state.NetInfo.AuthMode != '' ? store.state.NetInfo.AuthMode : store.state.NetInfo.m_AuthMode != '' ? store.state.NetInfo.m_AuthMode : 'WPA2PSK';
    if (ruleForm.ssid != '' && ruleForm.Pass != '') {
      isload.value = true;
      Old_form.push(ruleForm.ssid);
      Old_form.push(ruleForm.Pass);
      Old_form.push(ruleForm.SafeMode);
      Old_form.push(ruleForm.resource);
    }
  }
});

function setwifi(e) {
  load_switch.value = e;
  postapi({ goformId: "SET_WIFI_INFO", wifiEnabled: e == true ? '1' : '0' }).then(res => {
    if (res.result == "success") {
      message("成功发送请求", { type: "success" });
    } else {
      message("操作失败", { type: "error" });
      load_switch.value = false;
    }
  }).catch(error => {
    message("请求失败", { type: "error" });
    load_switch.value = false;
  });
}

const validatessid = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error('请输入SSID'))
  }
  var pattern = /^[a-zA-Z0-9!#()+\-./%=?@^_{|}~](?:[a-zA-Z0-9!#()+\-./%=?@^_{|}~ ]{0,30}[a-zA-Z0-9!#()+\-./%=?@^_{|}~])?$/;
  if (!pattern.test(value)) {
    callback(new Error('SSID格式错误'))
    activeNames.value = ['1'];
  } else {
    callback()
  }
}

const validatePass = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error('请输入密码'))
  }
  var pattern = /^[0-9a-zA-Z!#()+\-./%=?@^_{|}~]{1,20}$/;
  if (!pattern.test(value)) {
    callback(new Error('密码格式错误'))
    activeNames.value = ['4'];
  } else {
    if (ruleForm.Pass !== '') {
      if (!ruleFormRef.value) return
    }
    callback()
  }
}

const checSafeMode = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请选择安全模式'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules<typeof ruleForm>>({
  ssid: [{ validator: validatessid, trigger: 'blur' }],
  Pass: [{ validator: validatePass, trigger: 'blur' }],
  SafeMode: [{ validator: checSafeMode, trigger: 'blur' }],
})

const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  // 初始化字段信息
  formEl.clearValidate()
  formEl.validate((valid) => {
    if (valid) {
      console.log('提交的内容：', ruleForm)
      // 将字符串进行 Base64 编码
      const encodedpassword = btoa(ruleForm.Pass);
      const post_data = {
        "goformId": "QUICK_SETUP_EX",
        "index": "0", "pdp_type": "IP",
        "apn_mode": "auto",
        "profile_name": "Default",
        "wan_apn": "Default",
        "ppp_auth_mode": "none",
        "ppp_username": "",
        "ppp_passtmp": "",
        "ipv6_ppp_auth_mode": "none",
        "SSID_name": ruleForm.ssid,
        "broadcastSsidEnabled": ruleForm.resource == '广播' ? '0' : '1',
        "SSID_Broadcast": ruleForm.resource == '广播' ? '0' : '1',
        "Encryption_Mode_hid": ruleForm.SafeMode,
        "security_shared_mode": "NONE",
        "WPA_PreShared_Key": encodedpassword,
        "wep_default_key": "0",
        "WPA_ENCRYPTION_hid": "1"
      }
      console.log(Old_form, ruleForm);
      if (ruleForm.ssid == Old_form[0] && ruleForm.Pass == Old_form[1] && ruleForm.SafeMode == Old_form[2] && ruleForm.resource == Old_form[3]) {
        message("未修改内容", { type: "warning" });
        return;
      }
      postapi(post_data).then(res => {
        if (res.result == "success") {
          message("成功发送请求", { type: "success" });
        } else {
          message("操作失败", { type: "error" });
        }
      }).catch(error => {
        message("请求失败", { type: "error" });
      });
    } else {
      message("请检查表单内容", { type: "error" });
      return false
    }
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
            <div class="card-header">
              <div class="type-it-container">
                <TypeIt :className="'type-it1'" :values="['WIFI设置']" :cursor="false" :speed="60" />
              </div>
              <div class="button-container">
                <el-tag class="ml-2">
                  wifi状态：<el-switch size="small" v-model="switch_wifi" @change="setwifi" />
                </el-tag>
              </div>
            </div>
          </template>
          <template #default>
            <div class="form-container">
              <el-form ref="ruleFormRef" :model="ruleForm" status-icon :rules="rules" label-width="120px"
                class="demo-ruleForm" label-position="left">
                <el-form-item label="网络名称(SSID) " prop="ssid">
                  <el-input id="ssid" v-model="ruleForm.ssid" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="SSID 广播">
                  <el-radio-group v-model="ruleForm.resource">
                    <el-radio border label="隐藏" />
                    <el-radio border label="广播" />
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="安全模式" prop="SafeMode">
                  <el-select v-model="ruleForm.SafeMode" :fit-input-width="true" style="width: 100%;">
                    <el-option label="OPEN" value="OPEN" />
                    <el-option label="WPA2(AES)-PSK" value="WPA2PSK" />
                    <el-option label="WPA-PSK/WPA2-PSK" value="WPAPSKWPA2PSK" />
                  </el-select>
                </el-form-item>
                <el-form-item label="密码" prop="Pass">
                  <el-input v-model.number="ruleForm.Pass" type="password" :show-password="true" />
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
            <TypeIt :className="'type-it2'" :values="['格式要求及选项说明']" :cursor="false" :speed="60" />
          </template>
          <template #default>
            <el-collapse v-model="activeNames" @change="handleChange">
              <el-collapse-item title="网络名称(SSID)" name="1">
                <div>
                  SSID可以简单地理解为无线网络的名称。修改SSID时，请在本框中输入一个最多不超过32个字符的字符串，该字符串由数字、字母(a-z、A-Z)、特殊字符(!#()+-./%=?@^_{|}~)和空格，且开头和结尾不能是空格。
                </div>
              </el-collapse-item>
              <el-collapse-item title="SSID 广播" name="2">
                <div>
                  启用后，设备将会广播其无线网络标识(SSID)。这样附近的计算机或其他无线客户端即可搜索到本路由器的无线信号并连接到该设备。
                </div>
              </el-collapse-item>
              <el-collapse-item title="安全模式" name="3">
                <div>
                  <b>OPEN：</b>无数据加密。这可能会导致网络被他人滥用，因此不推荐使用此方式。
                </div>
                <div style="margin-top: 5px;">
                  <b>WPA2(AES)-PSK：</b>WPA2(AES)-PSK 是 Wi-Fi 网络安全存取 (WPA) 的安全保护版本，该版本施行了802.11i 无线安全标准。
                </div>
                <div style="margin-top: 5px;">
                  <b>WPA-PSK/WPA2-PSK：</b>WPA 预共享密钥 (WPA-PSK)。WPA2-PSK 是 Wi-Fi 网络安全存取 (WPA) 的安全保护版本，该版本施行了802.11i 无线安全标准。
                </div>
              </el-collapse-item>
              <el-collapse-item title="密码" name="4">
                <div>
                  密码的有效字符包含：0-9 a-z A-Z ! # ( ) + - . / % = ? @ ^ _ { | } ~
                </div>
              </el-collapse-item>
            </el-collapse>
          </template>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.button-container {
  height: 0px;
  margin-top: -30px;
}

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