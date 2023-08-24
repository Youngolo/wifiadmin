<script setup lang="ts">
import Search from "./search/index.vue";
import Notice from "./notice/index.vue";
import mixNav from "./sidebar/mixNav.vue";
import { useNav } from "@/layout/hooks/useNav";
import Breadcrumb from "./sidebar/breadCrumb.vue";
import topCollapse from "./sidebar/topCollapse.vue";
import LogoutCircleRLine from "@iconify-icons/ri/logout-circle-r-line";
import Setting from "@iconify-icons/ri/settings-3-line";
import { watchEffect, ref, reactive, onMounted, onUnmounted } from 'vue';
import { message } from "@/utils/message";
import { postapi } from "@/api/user";
import { useStore } from 'vuex';
import type { FormInstance, FormRules } from 'element-plus'
// import { treeEmits } from "element-plus/es/components/tree-v2/src/virtual-tree";

const {
  layout,
  device,
  logout,
  onPanel,
  pureApp,
  username,
  avatarsStyle,
  toggleSideBar
} = useNav();

const netinfo = ref();
const netname = ref('');
const xinhao = ref('bx:no-signal');
const centerDialogVisible = ref(false);
const ruleFormRef = ref<FormInstance>()

const wifi_icon = ref('logos:wifi');
const battery_icon = ref('fluent:battery-0-24-regular');
let load_switch = ref(false);//默认加载中
//表单字段定义
const ruleForm = reactive({
  old_pass: '',
  new_pass: '',
  new_pass2: ''
})
let timer;
const chushi = ref('0');
const store = useStore();
// 监听 signal 变量的变化
watchEffect(() => {
  netinfo.value = store.state.Signal;
  xinhao.value = getSignalLevel(netinfo.value);
  const str = store.state.NetWork.network_provider;
  wifi_icon.value = store.state.NetWork.wifi_cur_state == '1' ? 'fluent:wifi-1-24-filled' : 'ph:wifi-x-bold';
  if (store.state.NetWork.modem_main_state == 'modem_sim_undetected') {
    netname.value = 'SIM卡无效';
  } else {
    // 将字符串转为小写并去掉空格
    const processedStr = str.toLowerCase().replaceAll(" ", "");
    // 使用正则表达式匹配 chinamobile、chinatelecom、chinaunicom，并进行相应替换
    netname.value = processedStr.replace(/chinamobile|chinatelecom|chinaunicom/g, (match) => {
      switch (match) {
        case 'chinamobile':
          return '中国移动';
        case 'chinatelecom':
          return '中国电信';
        case 'chinaunicom':
          return '中国联通';
        default:
          return str != '' ? str : '服务受限';
      }
    });
  }
  if (netname.value == 'SIM卡无效' || netname.value == '服务受限' || netname.value == '') {
    xinhao.value = 'bx:no-signal';
  }
  //设置电池图标
  if (parseInt(store.state.NetWork.battery_charging) <= 0) {
    if (store.state.NetWork.battery_pers > 0 && store.state.NetWork.battery_pers <= 4) {
      battery_icon.value = 'mingcute:battery-' + store.state.NetWork.battery_pers + '-line';
    } else {
      battery_icon.value = 'fluent:battery-0-24-regular';
    }
  }
});

//如果电池充电
onMounted(() => {
  timer = setInterval(() => {
    if (parseInt(store.state.NetWork.battery_charging) > 0) {
      chushi.value = (parseInt(chushi.value) + 1).toString();
      if (parseInt(chushi.value) >= 5) chushi.value = store.state.NetWork.battery_pers ? store.state.NetWork.battery_pers : '0';
      battery_icon.value = 'mingcute:battery-' + chushi.value + '-line';
      if (battery_icon.value == 'mingcute:battery-0-line') {
        battery_icon.value = 'fluent:battery-0-24-regular';
      }
    }
  }, 500);
});
function stopTimer() {
  clearInterval(timer);
}
onUnmounted(stopTimer);

// 定义一个函数，接收一个对象作为参数
function getSignalLevel(obj) {
  // 定义一个变量，用于存储信号强度
  let signalStrength;
  // 判断网络类型是LTE还是其他
  if (obj.network_type === "LTE") {
    // 如果是LTE，则使用lte_rsrp作为信号强度的指标
    signalStrength = obj.lte_rsrp;
  } else {
    // 否则，使用rssi作为信号强度的指标
    signalStrength = obj.rssi;
  }
  if (signalStrength == '') return 'bx:no-signal';
  // 定义一个变量，用于存储信号格数
  let signalLevel;
  // 根据信号强度的数值范围，划分为五个等级
  if (signalStrength >= -70) {
    // 如果信号强度大于等于-70dBm，则为4格信号
    signalLevel = 'bx:signal-5';
  } else if (signalStrength >= -85) {
    // 如果信号强度在-70dBm到-85dBm之间，则为3格信号
    signalLevel = 'bx:signal-4';
  } else if (signalStrength >= -110) {
    // 如果信号强度在-85dBm到-100dBm之间，则为2格信号
    signalLevel = 'bx:signal-3';
  } else if (signalStrength >= -120) {
    // 如果信号强度在-100dBm到-110dBm之间，则为1格信号
    signalLevel = 'bx:signal-2';
  } else if (signalStrength >= -130) {
    // 如果信号强度在-110dBm到-120dBm之间，则为1格信号
    signalLevel = 'bx:signal-1';
  } else {
    // 如果信号强度小于-120dBm，则为0格信号
    signalLevel = 'bx:no-signal';
  }
  return signalLevel;
}
function handleClose() {
  centerDialogVisible.value = false;
}
const validateOldPass = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error('请输入密码'))
  }
  var pattern = /^[0-9a-zA-Z!#()+\-./%=?@^_{|}~]{1,20}$/;
  if (!pattern.test(value)) {
    callback(new Error('密码格式错误'))
  } else if (value.length < 4) {
    callback(new Error('密码最少需要4个字符'))
  } else {
    if (ruleForm.old_pass !== '') {
      if (!ruleFormRef.value) return
    }
    callback()
  }
}
const validateNewPass = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error('请输入密码'))
  }
  var pattern = /^[0-9a-zA-Z!#()+\-./%=?@^_{|}~]{1,20}$/;
  if (!pattern.test(value)) {
    callback(new Error('密码格式错误'))
  } else if (value.length < 4) {
    callback(new Error('密码最少需要4个字符'))
  } else {
    if (ruleForm.new_pass !== '') {
      if (!ruleFormRef.value) return
    }
    callback()
  }
}
const validateNewPass2 = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error('请输入密码'))
  }
  var pattern = /^[0-9a-zA-Z!#()+\-./%=?@^_{|}~]{1,20}$/;
  if (!pattern.test(value)) {
    callback(new Error('密码格式错误'))
  } else if (value.length < 4) {
    callback(new Error('密码最少需要4个字符'))
  } else if (value != ruleForm.new_pass) {
    callback(new Error('两次输入的密码不一样'))
  } else {
    if (ruleForm.new_pass2 !== '') {
      if (!ruleFormRef.value) return
    }
    callback()
  }
}
const rules = reactive<FormRules<typeof ruleForm>>({
  old_pass: [{ validator: validateOldPass, trigger: 'blur' }],
  new_pass: [{ validator: validateNewPass, trigger: 'blur' }],
  new_pass2: [{ validator: validateNewPass2, trigger: 'blur' }],
})
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  // 初始化字段信息
  formEl.clearValidate()
  formEl.validate((valid) => {
    if (valid) {
      // console.log(ruleForm);
      load_switch.value = true;
      // 将字符串进行 Base64 编码
      const oldp = btoa(ruleForm.old_pass);
      // 将字符串进行 Base64 编码
      const newp = btoa(ruleForm.new_pass);
      postapi({ goformId: "CHANGE_PASSWORD", oldPassword: oldp, newPassword: newp }).then(res => {
        if (res.result == "success") {
          load_switch.value = false;
          message("修改成功", { type: "success" });
        } else {
          message("旧密码不正确", { type: "error" });
          load_switch.value = false;
        }
      }).catch(error => {
        message("请求失败", { type: "error" });
        load_switch.value = false;
      });
    } else {
      if (ruleForm.old_pass.length < 4 || ruleForm.new_pass.length < 4 || ruleForm.new_pass2.length < 4) {
        message("密码最少需要4个字符", { type: "error" });
      } else if (ruleForm.new_pass != ruleForm.new_pass2) {
        message("两次输入的密码不一样", { type: "error" });
      } else {
        message("请检查表单内容", { type: "error" });
      }
      return false
    }
  })
}
</script>

<template>
  <div class="navbar bg-[#fff] shadow-sm shadow-[rgba(0, 21, 41, 0.08)] dark:shadow-[#0d0d0d]">
    <topCollapse v-if="device === 'mobile'" class="hamburger-container" :is-active="pureApp.sidebar.opened"
      @toggleClick="toggleSideBar" />

    <Breadcrumb v-if="layout !== 'mix' && device !== 'mobile'" class="breadcrumb-container" />

    <mixNav v-if="layout === 'mix'" />

    <div v-if="layout === 'vertical'" class="vertical-header-right">
      <!-- 网络类型 -->
      <div id="yOUNGBY2" class="search-container w-auto h-[48px] flex-c cursor-pointer navbar-bg-hover">
        <el-tooltip :content="`网络类型：${netinfo.sub_network_type}`" placement="top">
          <el-text id="yOUNGYYYY" v-if="netname" style="margin: 5px;" :class="{ 'dark:text-white': true }"
            :type="netname === '中国移动' ? 'success' : netname === '中国电信' ? 'primary' : netname === '中国联通' ? 'danger' : ''">
            {{ netname }}
          </el-text>
        </el-tooltip>
      </div>
      <!-- 信号状态 -->
      <div class="search-container w-[30px] h-[48px] flex-c cursor-pointer navbar-bg-hover">
        <el-tooltip :content="`信号强度${netinfo.rssi}dBm`" placement="top">
          <IconifyIconOnline :icon="xinhao" style="margin: 5px" width="60px" height="60px" />
        </el-tooltip>
      </div>
      <!-- WIFI状态 -->
      <div class="search-container w-[30px] h-[48px] flex-c cursor-pointer navbar-bg-hover">
        <el-tooltip :content="`WIFI状态:${store.state.NetWork.wifi_cur_state == '1' ? '开' : '关'}`" placement="top">
          <IconifyIconOnline :icon="wifi_icon" style="margin: 5px" width="60px" height="60px" />
        </el-tooltip>
      </div>
      <!-- 电池状态 -->
      <div v-if="store.state.NetWork.battery_charging != ''"
        class="search-container w-[30px] h-[48px] flex-c cursor-pointer navbar-bg-hover">
        <el-tooltip
          :content="store.state.NetWork.battery_pers > 0 ? `电池电量:${store.state.NetWork.battery_pers}格` : store.state.NetWork.battery_charging == 1 ? '充电中' : '未知'"
          placement="top">
          <IconifyIconOnline :icon="battery_icon" style="margin: 5px" width="60px" height="60px" />
        </el-tooltip>
      </div>
      <!-- 菜单搜索 -->
      <div id="yOUNGBYc">
        <Search />
      </div>
      <!-- 通知 -->
      <Notice id="header-notice" v-if="store.state.NetWork.modem_main_state != 'modem_sim_undetected'" />
      <!-- 退出登录 -->
      <el-dropdown trigger="click">
        <span class="el-dropdown-link navbar-bg-hover select-none">
          <!-- <img src="https://q1.qlogo.cn/g?b=qq&nk=2638710695&s=640" :style="avatarsStyle" /> -->
          <p v-if="username" class="dark:text-white">{{ username }}</p>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="logout">
            <el-dropdown-item @click="centerDialogVisible = true">
              <IconifyIconOnline icon="fluent:password-24-filled" style="margin: 5px" />
              修改密码
            </el-dropdown-item>
            <el-dropdown-item @click="logout">
              <IconifyIconOffline :icon="LogoutCircleRLine" style="margin: 5px" />
              退出系统
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <span class="set-icon navbar-bg-hover" title="打开项目配置" @click="onPanel">
        <IconifyIconOffline :icon="Setting" />
      </span>
    </div>
    <el-dialog id="YoungTable" v-model="centerDialogVisible" title="修改登录密码" align-center @close="handleClose">
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" status-icon class="demo-ruleForm" label-width="80"
        label-position="left" v-loading="load_switch">
        <el-form-item label="旧密码" prop="old_pass">
          <!-- type="password" :show-password="true" -->
          <el-input id="old_pass" v-model="ruleForm.old_pass" />
        </el-form-item>
        <el-form-item label="密码" prop="new_pass">
          <el-input v-model.number="ruleForm.new_pass" />
        </el-form-item>
        <el-form-item label="确认密码" prop="new_pass2">
          <el-input v-model.number="ruleForm.new_pass2" />
        </el-form-item>
      </el-form>
      <el-collapse style="margin-top: -5px;margin-bottom: -25px;">
        <el-collapse-item title="密码格式说明" name="1">
          <div>
            <b>密码只支持数字</b>：0-9<br><b>大小写字母</b>：a-z、A-Z<br><b>特殊字符</b>：! # ( ) + - . / % = ? @ ^ _ { | } ~
          </div>
        </el-collapse-item>
      </el-collapse>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="centerDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="submitForm(ruleFormRef)">
            应用
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
@media (max-width: 400px) {
  #yOUNGBYc {
    display: none;
  }
}

@media (max-width: 330px) {
  #yOUNGBY2 {
    display: none;
  }
}

#yOUNGYYYY {
  white-space: nowrap;
  /* 不换行 */
  overflow: hidden;
  /* 溢出隐藏 */
  text-overflow: ellipsis;
  /* 使用省略号表示溢出部分 */
  max-width: 100%;
  /* 设置最大宽度，以便溢出时生效 */
}

#yOUNGYYYY::after {
  content: attr(data-text);
  /* 通过伪元素展示全部文本内容 */
}

#YoungTable {
  /* 默认宽度为 30% */
  width: 30%;
}

/* 在手机上应用不同的宽度 */
@media (max-width: 767px) {
  #YoungTable {
    width: 80%;
  }
}

.navbar {
  width: 100%;
  height: 48px;
  overflow: hidden;

  .hamburger-container {
    float: left;
    height: 100%;
    line-height: 48px;
    cursor: pointer;
  }

  .vertical-header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 280px;
    height: 48px;
    color: #000000d9;

    .el-dropdown-link {
      display: flex;
      align-items: center;
      justify-content: space-around;
      height: 48px;
      padding: 10px;
      color: #000000d9;
      cursor: pointer;

      p {
        font-size: 14px;
      }

      img {
        width: 22px;
        height: 22px;
        border-radius: 50%;
      }
    }
  }

  .breadcrumb-container {
    float: left;
    margin-left: 16px;
  }
}

.logout {
  max-width: 120px;

  ::v-deep(.el-dropdown-menu__item) {
    display: inline-flex;
    flex-wrap: wrap;
    min-width: 100%;
  }
}
</style>
