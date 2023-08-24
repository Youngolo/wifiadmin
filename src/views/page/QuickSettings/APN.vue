<script setup lang="ts">
import { message } from "@/utils/message";
import TypeIt from "@/components/ReTypeit";
import { ElMessageBox } from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { getapi, postapi } from "@/api/user";
// import { fa } from "element-plus/es/locale";
defineOptions({
  name: "APN"
});
const info = ref({
  "APN_config0": "",
  "APN_config1": "",
  "APN_config2": "",
  "APN_config3": "",
  "APN_config4": "",
  "APN_config5": "",
  "APN_config6": "",
  "APN_config7": "",
  "APN_config8": "",
  "APN_config9": "",
  "APN_config10": "",
  "APN_config11": "",
  "APN_config12": "",
  "APN_config13": "",
  "APN_config14": "",
  "APN_config15": "",
  "APN_config16": "",
  "APN_config17": "",
  "APN_config18": "",
  "APN_config19": "",
  "ipv6_APN_config0": "",
  "ipv6_APN_config1": "",
  "ipv6_APN_config2": "",
  "ipv6_APN_config3": "",
  "ipv6_APN_config4": "",
  "ipv6_APN_config5": "",
  "ipv6_APN_config6": "",
  "ipv6_APN_config7": "",
  "ipv6_APN_config8": "",
  "ipv6_APN_config9": "",
  "ipv6_APN_config10": "",
  "ipv6_APN_config11": "",
  "ipv6_APN_config12": "",
  "ipv6_APN_config13": "",
  "ipv6_APN_config14": "",
  "ipv6_APN_config15": "",
  "ipv6_APN_config16": "",
  "ipv6_APN_config17": "",
  "ipv6_APN_config18": "",
  "ipv6_APN_config19": "",
  "m_profile_name": "",
  "profile_name": "",
  "wan_dial": "",
  "pdp_type": "",
  "pdp_select": "",
  "index": "",
  "Current_index": "",
  "apn_auto_config": "",
  "ipv6_apn_auto_config": "",
  "apn_mode": "",
  "wan_apn": "",
  "ppp_auth_mode": "",
  "ppp_username": "",
  "ppp_passwd": "",
  "ipv6_wan_apn": "",
  "ipv6_pdp_type": "",
  "ipv6_ppp_auth_mode": "",
  "ipv6_ppp_username": "",
  "ipv6_ppp_passwd": "",
  "apn_num_preset": ""
});
const configinfo = ref([]);//配置文件列表
const apn_auto_config = ref([]);//配置文件列表
const configlist = ref([]);//配置文件列表
const oldlist = ref([]);//配置文件列表
const is_add = ref(false);
const confindex = ref(0);//全局索引
const load_switch = ref(true);//默认加载中
//表单字段定义
const ruleForm = reactive({
  config: '',//配置文件
  apn_mode: '',
  pdp_type: '',
  profile_name: '',
  apn_ipv4_apn: '',
  ppp_auth_mode: '',
  ppp_username: '',
  ppp_passwd: '',
  wan_dial: '',
})
onMounted(() => {
  init();
});
//获取快速开机设置信息
function init() {
  configinfo.value = [];//配置文件列表
  apn_auto_config.value = [];//配置文件列表
  configlist.value = [];//配置文件列表
  oldlist.value = [];//配置文件列表
  setTimeout(() => {
    getapi('cmd=APN_config0%2CAPN_config1%2CAPN_config2%2CAPN_config3%2CAPN_config4%2CAPN_config5%2CAPN_config6%2CAPN_config7%2CAPN_config8%2CAPN_config9%2CAPN_config10%2CAPN_config11%2CAPN_config12%2CAPN_config13%2CAPN_config14%2CAPN_config15%2CAPN_config16%2CAPN_config17%2CAPN_config18%2CAPN_config19%2Cipv6_APN_config0%2Cipv6_APN_config1%2Cipv6_APN_config2%2Cipv6_APN_config3%2Cipv6_APN_config4%2Cipv6_APN_config5%2Cipv6_APN_config6%2Cipv6_APN_config7%2Cipv6_APN_config8%2Cipv6_APN_config9%2Cipv6_APN_config10%2Cipv6_APN_config11%2Cipv6_APN_config12%2Cipv6_APN_config13%2Cipv6_APN_config14%2Cipv6_APN_config15%2Cipv6_APN_config16%2Cipv6_APN_config17%2Cipv6_APN_config18%2Cipv6_APN_config19%2Cm_profile_name%2Cprofile_name%2Cwan_dial%2Cpdp_type%2Cpdp_select%2Cindex%2CCurrent_index%2Capn_auto_config%2Cipv6_apn_auto_config%2Capn_mode%2Cwan_apn%2Cppp_auth_mode%2Cppp_username%2Cppp_passwd%2Cipv6_wan_apn%2Cipv6_pdp_type%2Cipv6_ppp_auth_mode%2Cipv6_ppp_username%2Cipv6_ppp_passwd%2Capn_num_preset&multi_data=1').then(res => {
      info.value = res;
      console.log(res);
      ruleForm.apn_mode = info.value.apn_mode == 'auto' ? '自动' : '手动';
      for (var i = 0; i <= 19; i++) {
        // if (info.value['APN_config' + i] == '') continue;
        const apn_config = info.value['APN_config' + i].split('($)');
        configinfo.value.push(apn_config);
        if (apn_config[0] != '') {
          oldlist.value.push({
            'id': 'APN_config' + i,
            'value': apn_config[0]
          });
        }
      }
      apn_auto_config.value = info.value['apn_auto_config'].split('($)');
      if (info.value.apn_mode == 'auto') {
        ruleForm.profile_name = apn_auto_config.value[0];
        ruleForm.apn_ipv4_apn = apn_auto_config.value[1];
        ruleForm.wan_dial = apn_auto_config.value[3];
        ruleForm.pdp_type = apn_auto_config.value[7];
        configlist.value = [{
          'id': '0',
          'value': apn_auto_config.value[0]
        }];
        ruleForm.config = apn_auto_config.value[0];
        ruleForm.ppp_auth_mode = apn_auto_config.value[4];
        // console.log(apn_auto_config.value);
      } else {
        confindex.value = 0;
        configlist.value = oldlist.value;
        const apn_config = configinfo.value[0];
        ruleForm.config = apn_config[0];
        ruleForm.profile_name = apn_config[0];
        ruleForm.apn_ipv4_apn = apn_config[1];
        ruleForm.wan_dial = apn_config[3] != '' ? apn_config[3] : apn_auto_config.value[3];
        ruleForm.ppp_auth_mode = apn_config[4];
        ruleForm.ppp_username = apn_config[5];
        // ruleForm.ppp_passwd = apn_config[6];
        ruleForm.pdp_type = apn_config[7];
      }
      load_switch.value = false;
    });
  }, 500);
}
function set(e) {
  if (e == 1) {
    is_add.value = true;
    ruleForm.apn_ipv4_apn = '';
    ruleForm.profile_name = '';
  } else {
    is_add.value = false;
  }
}
function select_config(e) {
  try {
    var match = e.match(/APN_config(\d+)/);
    confindex.value = parseInt(match[1]);
    console.log(e, confindex.value);
    const apn_config = info.value[e].split('($)');
    ruleForm.config = apn_config[0];
    ruleForm.profile_name = apn_config[0];
    ruleForm.apn_ipv4_apn = apn_config[1];
    ruleForm.wan_dial = apn_config[3] != '' ? apn_config[3] : apn_auto_config.value[3];
    ruleForm.ppp_auth_mode = apn_config[4];
    ruleForm.ppp_username = apn_config[5];
    // ruleForm.ppp_passwd = apn_config[6];
    ruleForm.pdp_type = apn_config[7];
    // console.log(apn_config, ruleForm.ppp_auth_mode);
  } catch (error) {
    return;
  }
}
function mod_qie(e) {
  if (e == '手动') {
    confindex.value = 0;
    configlist.value = oldlist.value;
    const apn_config = configinfo.value[0];
    ruleForm.config = oldlist.value[0].value;
    // console.log(ruleForm.config, apn_config);
    ruleForm.profile_name = apn_config[0];
    ruleForm.apn_ipv4_apn = apn_config[1];
    ruleForm.wan_dial = apn_config[3] != '' ? apn_config[3] : apn_auto_config.value[3];
    ruleForm.ppp_auth_mode = apn_config[4];
    ruleForm.pdp_type = apn_config[7];
    // console.log(apn_config, ruleForm.ppp_auth_mode);
  } else {
    set(0);
    ruleForm.config = oldlist.value[0];
    ruleForm.config = apn_auto_config.value[0];
    configlist.value = [apn_auto_config.value[0]];
    ruleForm.profile_name = apn_auto_config.value[0];
    ruleForm.apn_ipv4_apn = apn_auto_config.value[1];
    ruleForm.wan_dial = apn_auto_config.value[3];
    ruleForm.ppp_auth_mode = apn_auto_config.value[4];
    ruleForm.pdp_type = apn_auto_config.value[7];
    // console.log(apn_auto_config.value, ruleForm.ppp_auth_mode);
  }
}
function apple() {
  load_switch.value = true;
  const apn_config = configinfo.value[confindex.value];
  ElMessageBox.confirm(
    `该操作将会断开网络，你确定要继续执行该操作吗？`,
    {
      confirmButtonText: '继续',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    postapi({
      goformId: "DISCONNECT_NETWORK",
      notCallback: 'DISCONNECT_NETWORK'
    }).then(res => {
      if (res.result == "success") {
        message("断开数据漫游", { type: "success" });
        postapi({
          goformId: "APN_PROC_EX",
          apn_action: "set_default",
          apn_mode: "manual",
          set_default_flag: "manual",
          pdp_type: apn_config[7],
          index: confindex.value,
        }).then(res => {
          if (res.result == "success") {
            setTimeout(() => {
              postapi({
                goformId: "CONNECT_NETWORK",
                notCallback: 'true'
              }).then(res => {
                message("打开数据漫游", { type: "success" });
                init();//重新初始化获取数据
              }).catch(error => {
                message("请求失败", { type: "error" });
                load_switch.value = false;
              });
            }, 1500);
            message("应用APN", { type: "success" });
          } else {
            message("操作失败", { type: "error" });
            load_switch.value = false;
          }
        }).catch(error => {
          message("请求失败", { type: "error" });
          load_switch.value = false;
        });
      } else {
        message("操作失败", { type: "error" });
        load_switch.value = false;
      }
    }).catch(error => {
      message("请求失败", { type: "error" });
      load_switch.value = false;
    });
  }).catch(() => {
    load_switch.value = false;
    // console.log('取消');
  })
}
//添加配置文件
function add_config() {
  if (ruleForm.profile_name == '' || ruleForm.profile_name == 'Default') {
    return message("配置文件名称不能为空，且不能为默认", { type: "error" });
  }
  if (ruleForm.apn_ipv4_apn == '' || ruleForm.apn_ipv4_apn == 'Default') {
    return message("APN不能为空，且不能为默认", { type: "error" });
  }
  if (configlist.value.indexOf(ruleForm.profile_name) != -1) {
    return message("配置文件名称不能重复", { type: "error" });
  }
  load_switch.value = true;
  let post_data;
  if (ruleForm.pdp_type == 'IP') {
    post_data = {
      goformId: "APN_PROC_EX",
      apn_action: "save",
      apn_mode: "manual",
      profile_name: ruleForm.profile_name,
      wan_dial: ruleForm.wan_dial != "" ? ruleForm.wan_dial : "*99#",
      pdp_type: ruleForm.pdp_type,
      pdp_select: "auto",
      index: oldlist.value.length + 1,
      wan_apn: ruleForm.apn_ipv4_apn,
      ppp_auth_mode: ruleForm.pdp_type != '' ? ruleForm.pdp_type : "none",
      ppp_username: ruleForm.ppp_username,
      ppp_passwd: ruleForm.ppp_passwd
    }
  } else if (ruleForm.pdp_type == 'IPv6') {
    post_data = {
      goformId: "APN_PROC_EX",
      apn_action: "save",
      apn_mode: "manual",
      profile_name: ruleForm.profile_name,
      wan_dial: ruleForm.wan_dial != "" ? ruleForm.wan_dial : "*99#",
      pdp_type: ruleForm.pdp_type,
      pdp_select: "auto",
      index: oldlist.value.length + 1,
      ipv6_wan_apn: ruleForm.apn_ipv4_apn,
      ipv6_ppp_auth_mode: ruleForm.pdp_type != '' ? ruleForm.pdp_type : "none",
      ipv6_ppp_username: ruleForm.ppp_username,
      ipv6_ppp_passwd: ruleForm.ppp_passwd
    }
  } else if (ruleForm.pdp_type == 'IPv4v6') {
    post_data = {
      goformId: "APN_PROC_EX",
      apn_action: "save",
      apn_mode: "manual",
      profile_name: ruleForm.profile_name,
      wan_dial: ruleForm.wan_dial != "" ? ruleForm.wan_dial : "*99#",
      pdp_type: ruleForm.pdp_type,
      pdp_select: "auto",
      index: oldlist.value.length + 1,
      wan_apn: ruleForm.apn_ipv4_apn,
      ppp_auth_mode: ruleForm.pdp_type != '' ? ruleForm.pdp_type : "none",
      ppp_username: ruleForm.ppp_username,
      ppp_passwd: ruleForm.ppp_passwd,
      ipv6_wan_apn: ruleForm.apn_ipv4_apn,
      ipv6_ppp_auth_mode: ruleForm.pdp_type != '' ? ruleForm.pdp_type : "none",
      ipv6_ppp_username: ruleForm.ppp_username,
      ipv6_ppp_passwd: ruleForm.ppp_passwd
    }
  }
  postapi(post_data).then(res => {
    if (res.result == "success") {
      init();//重新初始化获取数据
      is_add.value = false;
      message("添加APN", { type: "success" });
    } else {
      message("操作失败", { type: "error" });
      load_switch.value = false;
    }
  }).catch(error => {
    message("请求失败", { type: "error" });
    load_switch.value = false;
  });
}
//删除配置文件
function delete_config() {
  load_switch.value = true;
  postapi({
    goformId: "APN_PROC_EX",
    apn_action: 'delete',
    index: confindex.value,
    apn_mode: 'manual'
  }).then(res => {
    if (res.result == "success") {
      init();//重新初始化获取数据
      message("删除APN", { type: "success" });
    } else {
      message("操作失败", { type: "error" });
      load_switch.value = false;
    }
  }).catch(error => {
    message("请求失败", { type: "error" });
    load_switch.value = false;
  });
}

function submitForm() {
  ruleForm.apn_mode = ruleForm.apn_mode == '自动' ? 'auto' : 'manual';
  if (ruleForm.apn_mode == 'auto') {
    load_switch.value = true;
    postapi({
      goformId: "APN_PROC_EX",
      apn_mode: 'auto'
    }).then(res => {
      if (res.result == "success") {
        init();//重新初始化获取数据
        message("APN设置自动", { type: "success" });
      } else {
        message("操作失败", { type: "error" });
        load_switch.value = false;
      }
    }).catch(error => {
      message("请求失败", { type: "error" });
      load_switch.value = false;
    });
  } else {
    apple();
  }
}
</script>

<template>
  <div>
    <el-row :gutter="24">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16" class="mb-[5px]" v-motion :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }">
        <el-tag style="width: 100%;margin-bottom: 5px;white-space: normal;" size="large" effect="dark">
          当前APN：{{ info.m_profile_name }}
        </el-tag>
        <el-card shadow="never" v-loading="load_switch">
          <template #header>
            <TypeIt :className="'type-it1'" :values="['APN设置']" :cursor="false" :speed="60" />
          </template>
          <template #default>
            <el-form :model="ruleForm" status-icon label-width="120px" class="demo-ruleForm" label-position="left">
              <el-form-item label="模式">
                <el-radio-group v-model="ruleForm.apn_mode" @change="mod_qie">
                  <el-radio border label="自动" />
                  <el-radio border label="手动" />
                </el-radio-group>
              </el-form-item>
              <el-form-item label="配置文件" prop="config">
                <el-select v-model="ruleForm.config" :fit-input-width="true" style="width: 85%;" :disabled="is_add"
                  @change="select_config">
                  <el-option v-for="option in configlist" :key="option" :label="option.value" :value="option.id"
                    v-show="option != ''" />
                </el-select>
                <el-button v-if="ruleForm.apn_mode == '手动' && is_add == true" style="margin-left: 5px;" type="danger"
                  @click="set(0)">取消</el-button>
                <el-button v-if="ruleForm.apn_mode == '手动' && is_add == false" style="margin-left: 5px;" type="primary"
                  @click="set(1)">新增</el-button>
              </el-form-item>
              <el-form-item label="PDP类型" prop="pdp_type">
                <el-select v-model="ruleForm.pdp_type" :fit-input-width="true" style="width: 100%;"
                  :disabled="(ruleForm.apn_mode == '自动' || confindex == 0) && is_add == false">
                  <el-option label="IPv4" value="IP" />
                  <el-option label="IPv6" value="IPv6" />
                  <el-option label="IPv4v6" value="IPv4v6" />
                </el-select>
              </el-form-item>
              <el-form-item label="配置文件名称" prop="profile_name">
                <el-input id="profile_name" v-model.number="ruleForm.profile_name"
                  :disabled="(ruleForm.apn_mode == '自动' || confindex == 0) && is_add == false" />
              </el-form-item>
              <el-form-item label="APN" prop="apn_ipv4_apn">
                <el-input id="apn_ipv4_apn" v-model.number="ruleForm.apn_ipv4_apn"
                  :disabled="(ruleForm.apn_mode == '自动' || confindex == 0) && is_add == false" />
              </el-form-item>
              <el-form-item label="鉴权方式" prop="ppp_auth_mode">
                <el-select v-model="ruleForm.ppp_auth_mode" :fit-input-width="true" style="width: 100%;"
                  :disabled="(ruleForm.apn_mode == '自动' || confindex == 0) && is_add == false">
                  <el-option label="NONE" value="" />
                  <el-option label="CHAP" value="chap" />
                  <el-option label="PAP" value="pap" />
                  <el-option label="PAP_CHAP" value="pap_chap" />
                </el-select>
              </el-form-item>
              <el-form-item label="用户名" prop="ppp_username">
                <el-input id="ppp_username" v-model.number="ruleForm.ppp_username"
                  :disabled="(ruleForm.apn_mode == '自动' || confindex == 0) && is_add == false" />
              </el-form-item>
              <el-form-item label="密码" prop="ppp_passwd">
                <el-input id="ppp_passwd" v-model.number="ruleForm.ppp_passwd"
                  :disabled="(ruleForm.apn_mode == '自动' || confindex == 0) && is_add == false" />
              </el-form-item>
              <el-form-item label="拨号号码" prop="wan_dial">
                <el-input id="wan_dial" v-model.number="ruleForm.wan_dial" disabled />
              </el-form-item>
              <el-form-item class="form-buttons">
                <el-button type="success" v-if="is_add" @click="add_config">添加</el-button>
                <el-button type="primary" @click="submitForm()">应用</el-button>
                <el-button type="danger" v-if="confindex != 0 && ruleForm.apn_mode == '手动'"
                  @click="delete_config">删除</el-button>
              </el-form-item>
              <el-button style="visibility: hidden;"></el-button>
            </el-form>
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
            <el-text class="mx-1"><b>模式</b>：如果您的服务提供商向您提供了固定的 APN，请选择“手动 APN”。如果没有提供，请选择“自动
              APN”，该设备将会自动获取参数。<br></el-text>
            <el-text class="mx-1"><b>配置文件</b>：包含了一个或多个配置文件名称。<br></el-text>
            <el-text class="mx-1"><b>PDP 类型</b>：IPv4/IPv6/IPv4&IPv6。<br></el-text>
            <el-text class="mx-1"><b>配置文件名称</b>：有关您指定的新的配置文件的名称。<br></el-text>
            <el-text class="mx-1"><b>APN</b>：接入点名称。有效字符包含：0-9 a-z A-Z . - 且开头和结尾不能是 . 或者 - 。<br></el-text>
            <el-text class="mx-1"><b>鉴权方式</b>：由您的互联网服务提供商 (ISP) 来提供。密码验证协议 (PAP)
              不用加密就可以通过两次握手建立对端的身份。询问握手认证协议（CHAP）通过三次握手周期性的校验对端的身份。<br></el-text>
            <el-text class="mx-1"><b>用户名</b>：用于建立连接时，从互联网服务提供商处获取验证。<br></el-text>
            <el-text class="mx-1"><b>密码</b>：用于建立连接时，从互联网服务提供商处获取验证。<br></el-text>
            <el-text class="mx-1">点击“设为默认”以将该配置文件设置为默认配置文件。</el-text>
          </template>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>