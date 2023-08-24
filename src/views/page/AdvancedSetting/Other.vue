<script setup lang="ts">
//下面是监听全局变量
import { ref, reactive, onMounted, onBeforeUnmount, watchEffect } from 'vue';
import TypeIt from "@/components/ReTypeit";
import { useStore } from 'vuex';
// import { useWindowSize } from "@vueuse/core";
import { message } from "@/utils/message";
import { ElMessageBox } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { postapi, getapi } from "@/api/user";
// import { fa } from 'element-plus/es/locale';

defineOptions({
  name: "Other"
});
const young_mac = ref('');
const young_imei = ref('');
const pwdinfo = ref({ "current_Password": "", "admin_Password": "", "root_Password": "" });
const activeNames = ref(['1'])
const ruleFormRef = ref<FormInstance>()
let loading = ref(true);//默认加载中
//表单字段定义
const ruleForm = reactive({
  time: '',//当前时间
  datetime: '',
  sntp_time_set_mode: '',//SNTP模式
  sntp_server0: '',
  sntp_server1: '',
  sntp_server2: '',
  sntp_timezone: '',//时区
  sntp_dst_enable: '',
  sntp_year: '',
  sntp_month: '',
  sntp_day: '',
  sntp_hour: '',
  sntp_minute: '',
  sntp_second: '',
  mgmt_quicken_power_on: ''
})
let info = ref();
let timer;
//页面加载
onMounted(() => {
  //获取设置信息
  generateTimeOptions();
  //获取sntp设置信息
  getapi('multi_data=1&cmd=sntp_year%2Csntp_month%2Csntp_day%2Csntp_hour%2Csntp_minute%2Csntp_second%2Csntp_time_set_mode%2Csntp_static_server0%2Csntp_static_server1%2Csntp_static_server2%2Csntp_server0%2Csntp_server1%2Csntp_server2%2Csntp_server3%2Csntp_server4%2Csntp_server5%2Csntp_server6%2Csntp_server7%2Csntp_server8%2Csntp_server9%2Csntp_other_server0%2Csntp_other_server1%2Csntp_other_server2%2Csntp_timezone%2Csntp_timezone_index%2Csntp_dst_enable%2Csntp_process_result').then(res => {
    info.value = res;
    ruleForm.sntp_server0 = res.sntp_server0;
    ruleForm.sntp_server1 = res.sntp_server1;
    ruleForm.sntp_server2 = res.sntp_server2;
    ruleForm.sntp_dst_enable = res.sntp_dst_enable;
    ruleForm.sntp_timezone = res.sntp_timezone + '_' + res.sntp_timezone_index;
    ruleForm.sntp_time_set_mode = res.sntp_time_set_mode == 'auto' ? '自动同步Sntp' : '手动设置时间';
    ruleForm.time = res.sntp_year + '-' + res.sntp_month + '-' + res.sntp_day + ' ' + res.sntp_hour + ':' + res.sntp_minute + ':' + res.sntp_second;
    ruleForm.sntp_year = res.sntp_year;
    ruleForm.sntp_month = res.sntp_month;
    ruleForm.sntp_day = res.sntp_day;
    ruleForm.sntp_hour = res.sntp_hour;
    ruleForm.sntp_minute = res.sntp_minute;
    ruleForm.sntp_second = res.sntp_second;
    timer = setInterval(() => {
      ruleForm.time = addOneSecondOnce(ruleForm.time);
    }, 1000);
    loading.value = false;
  });
  //获取快速开机设置信息
  getapi('cmd=mgmt_quicken_power_on%2Cneed_hard_reboot%2Cneed_sim_pin&multi_data=1').then(res => {
    ruleForm.mgmt_quicken_power_on = res.mgmt_quicken_power_on == '1' ? '开启' : '关闭';
  });
  //获取密码信息
  getapi('cmd=current_Password%2Cadmin_Password%2Croot_Password&multi_data=1').then(res => {
    pwdinfo.value = res;
  });
});
let allinfo = ref({});
const store = useStore();
const oldData = ref(null);
watchEffect(() => {
  allinfo.value = store.state.NetInfo;
  console.log(allinfo.value);
  if (allinfo.value.imei != '') {
    young_imei.value = allinfo.value.imei;
  }
  if (oldData.value !== null && ruleForm.mgmt_quicken_power_on !== oldData.value) {
    loading.value = true;
    postapi({
      'goformId': 'MGMT_CONTROL_POWER_ON_SPEED',
      'mgmt_quicken_power_on': ruleForm.mgmt_quicken_power_on == '开启' ? '1' : '0',
    }).then(res => {
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
  }
  if (ruleForm.mgmt_quicken_power_on != '') oldData.value = ruleForm.mgmt_quicken_power_on;
});
//页面卸载
onBeforeUnmount(() => {
  clearInterval(timer);
});
function addOneSecondOnce(oldtime) {
  const targetDate = new Date(oldtime);
  const newDate = new Date(targetDate.getTime() + 1000);
  const year = newDate.getFullYear();
  const month = String(newDate.getMonth() + 1).padStart(2, '0');
  const day = String(newDate.getDate()).padStart(2, '0');
  const hours = String(newDate.getHours()).padStart(2, '0');
  const minutes = String(newDate.getMinutes()).padStart(2, '0');
  const seconds = String(newDate.getSeconds()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedDate;
}
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  // 初始化字段信息
  formEl.clearValidate()
  formEl.validate((valid) => {
    if (valid) {
      const isen = ruleForm.sntp_time_set_mode == '自动同步Sntp' ? 'auto' : 'manual';
      if (ruleForm.sntp_server1 == info.value.sntp_server1 && ruleForm.sntp_server0 == info.value.sntp_server0 && isen == info.value.sntp_time_set_mode
        && ruleForm.sntp_server2 == info.value.sntp_server2 && ruleForm.sntp_year == info.value.sntp_year && ruleForm.sntp_month == info.value.sntp_month
        && ruleForm.sntp_day == info.value.sntp_day && ruleForm.sntp_hour == info.value.sntp_hour && ruleForm.sntp_minute == info.value.sntp_minute
        && ruleForm.sntp_second == info.value.sntp_second && ruleForm.sntp_dst_enable == info.value.sntp_dst_enable) {
        message("未修改内容", { type: "warning" });
        return;
      }
      const parts = ruleForm.sntp_timezone.split("_");
      let post_data = {
        'goformId': 'SNTP',
        'manualsettime': ruleForm.sntp_time_set_mode == '自动同步Sntp' ? 'auto' : 'manual',
        'sntp_server1_ip': ruleForm.sntp_server0,
        'sntp_server2_ip': ruleForm.sntp_server1,
        'sntp_server3_ip': ruleForm.sntp_server2,
        'sntp_other_server0': '',
        'sntp_other_server1': '',
        'sntp_other_server2': '',
        'timezone': parts[0],
        'sntp_timezone_index': parts[1],
        'DaylightEnabled': ruleForm.sntp_dst_enable,
        'time_year': ruleForm.sntp_year,
        'time_month': ruleForm.sntp_month,
        'time_day': ruleForm.sntp_day,
        'time_hour': ruleForm.sntp_hour,
        'time_minute': ruleForm.sntp_minute,
        'sntp_second': ruleForm.sntp_second,
      }
      loading.value = true;
      // console.log(JSON.stringify(ruleForm), post_data);
      postapi(post_data).then(res => {
        if (res.result == "success") {
          loading.value = false;
          message("成功发送请求，请手动刷新页面查看效果", { type: "success" });
        } else {
          loading.value = false;
          message("操作失败", { type: "error" });
        }
      }).catch(error => {
        loading.value = false;
        message("请求失败", { type: "error" });
      });
    } else {
      message("请检查表单内容", { type: "error" });
      return false
    }
  })
}
// 定义选项数据
const years = ref<string[]>([]);
const months = ref<string[]>([]);
const days = ref<string[]>([]);
const hours = ref<string[]>([]);
const minutes = ref<string[]>([]);
const seconds = ref<string[]>([]);
// 初始化选项数据
const generateTimeOptions = () => {
  const currentYear = new Date().getFullYear();

  for (let year = currentYear - 10; year <= currentYear + 10; year++) {
    years.value.push(year.toString());
  }

  for (let month = 1; month <= 12; month++) {
    months.value.push(month.toString().padStart(2, '0'));
  }

  for (let day = 1; day <= 31; day++) {
    days.value.push(day.toString().padStart(2, '0'));
  }

  for (let hour = 0; hour < 24; hour++) {
    hours.value.push(hour.toString().padStart(2, '0'));
  }

  for (let minute = 0; minute < 60; minute++) {
    minutes.value.push(minute.toString().padStart(2, '0'));
  }

  for (let second = 0; second < 60; second++) {
    seconds.value.push(second.toString().padStart(2, '0'));
  }
};
//发送命令
function sendcmd(cmd, openadb = '') {
  ElMessageBox.confirm(
    `你确定要继续执行该操作吗？`,
    {
      confirmButtonText: '继续',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    loading.value = true;
    let post_date = {
      'goformId': cmd
    };
    if (openadb == 'true' || openadb == 'false') {
      post_date = {
        'goformId': cmd,
        'debug_enable': openadb == 'false' ? '0' : '1'
      }
    }
    postapi(post_date).then(res => {
      if (res.result == "success" || res.result == "set_devicemode successfully!") {
        loading.value = false;
        message("成功发送请求", { type: "success" });
        if (openadb == 'true' || openadb == 'false') {
          ElMessageBox.confirm(
            `该操作需要重启设备才能完成，需要帮你重启设备吗？`,
            {
              confirmButtonText: '需要',
              cancelButtonText: '不需要',
              type: 'warning',
            }
          ).then(() => {
            loading.value = true;
            postapi({ 'goformId': 'REBOOT_DEVICE' }).then(req => {
              loading.value = false;
              if (req.result == "success") {
                message("成功发送请求", { type: "success" });
              }
            }).catch(error => {
              loading.value = false;
              message("请求失败", { type: "error" });
            });
          }).catch(() => {
            message("记得手动重启设备哦~", { type: "info" });
          })
        }
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
}
function upmac() {
  ElMessageBox.confirm(
    `该操作需要重启设备，你确定要继续执行该操作吗？`,
    {
      confirmButtonText: '继续',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    loading.value = true;
    postapi({ 'goformId': 'SET_USB_MAC_ADDRESS', 'mac': young_mac.value }).then(req => {
      loading.value = false;
      if (req.result == "success") {
        message("成功发送请求", { type: "success" });
      } else {
        message("操作失败，mac格式错误或不支持", { type: "error" });
      }
    }).catch(error => {
      loading.value = false;
      message("请求失败", { type: "error" });
    });
  }).catch(() => {
    // console.log('取消');
  })
}
function upimei() {
  ElMessageBox.confirm(
    `该操作需要恢复出厂设置，你确定要继续执行该操作吗？`,
    {
      confirmButtonText: '继续',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    loading.value = true;
    postapi({ 'goformId': 'SET_IMEI_NUM', 'imei': young_imei.value }).then(req => {
      loading.value = false;
      if (req.result == "success") {
        message("成功发送请求", { type: "success" });
      } else {
        message("操作失败", { type: "error" });
      }
    }).catch(error => {
      loading.value = false;
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
        <el-card shadow="never" v-loading="loading">
          <template #header>
            <TypeIt :className="'type-it1'" :values="['其他设置']" :cursor="false" :speed="60" />
          </template>
          <template #default>
            <div class="form-container">
              <el-form ref="ruleFormRef" :model="ruleForm" status-icon label-width="120px" class="demo-ruleForm"
                label-position="left">
                <el-form-item label="" label-width="0">
                  <b>中兴微ADB</b>
                  <el-button type="primary" @click="sendcmd('SET_DEVICE_MODE', 'true')"
                    style="margin-left: 10px;margin-top: 5px;">打开</el-button>
                  <el-button type="primary" @click="sendcmd('SET_DEVICE_MODE', 'false')"
                    style="margin-left: 10px;margin-top: 5px;">关闭</el-button>
                </el-form-item>
                <el-form-item label="" label-width="0">
                  <b>设备基础操作</b>
                  <el-button type="primary" @click="sendcmd('TURN_OFF_DEVICE')"
                    style="margin-left: 10px;margin-top: 5px;">关机</el-button>
                  <el-button type="primary" @click="sendcmd('REBOOT_DEVICE')"
                    style="margin-left: 10px;margin-top: 5px;">重启设备</el-button>
                </el-form-item>
                <el-form-item label="" label-width="0">
                  <b>设备重要操作</b>
                  <el-button type="primary" @click="sendcmd('RESTORE_FACTORY_SETTINGS')"
                    style="margin-left: 10px;margin-top: 5px;">设备恢复出厂设置</el-button>
                </el-form-item>
                <el-form-item label="" label-width="0">
                  <b>快速开机设置</b>
                  <el-radio-group v-model="ruleForm.mgmt_quicken_power_on">
                    <el-radio border label="开启" style="margin-left: 10px;margin-top: 5px;" />
                    <el-radio border label="关闭" style="margin-left: 10px;margin-top: 5px;" />
                  </el-radio-group>
                </el-form-item>
                <b>修改USB虚拟网卡物理地址</b>
                <el-input style="margin-top: 10px;margin-bottom: 10px;" v-model="young_mac" type="text"
                  autocomplete="off">
                  <template #append>
                    <el-button type="primary" @click="upmac">应用</el-button>
                  </template>
                </el-input>
                <b>修改IMEI</b>
                <el-input style="margin-top: 10px;margin-bottom: 10px;" v-model="young_imei" type="text"
                  autocomplete="off">
                  <template #append>
                    <el-button type="primary" @click="upimei">应用</el-button>
                  </template>
                </el-input>
                <b>SNTP</b>
                <el-form-item label="设备当前时间" style="margin-top: 10px;">
                  <el-input v-model="ruleForm.time" type="text" autocomplete="off" disabled />
                </el-form-item>
                <el-form-item label="时间设置模式">
                  <el-radio-group v-model="ruleForm.sntp_time_set_mode">
                    <el-radio border label="自动同步Sntp" />
                    <el-radio border label="手动设置时间" />
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="SNTP 服务器1" prop="sntp_server0" v-if="ruleForm.sntp_time_set_mode == '自动同步Sntp'">
                  <el-input v-model="ruleForm.sntp_server0" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="SNTP 服务器2" prop="sntp_server1" v-if="ruleForm.sntp_time_set_mode == '自动同步Sntp'">
                  <el-input v-model="ruleForm.sntp_server1" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="SNTP 服务器3" prop="sntp_server2" v-if="ruleForm.sntp_time_set_mode == '自动同步Sntp'">
                  <el-input v-model="ruleForm.sntp_server2" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="时区" prop="sntp_timezone" v-if="ruleForm.sntp_time_set_mode == '自动同步Sntp'">
                  <el-select v-model="ruleForm.sntp_timezone" :fit-input-width="true" style="width: 100%;">
                    <el-option value="<-12>12_0" label="(GMT-12:00) 日界线西" />
                    <el-option value="<-12>12_0" label="(GMT-12:00) 日界线西" />
                    <el-option value="SST11_0" label="(GMT-11:00) 中途岛，萨摩亚群岛" />
                    <el-option value="<-10>10_0" label="(GMT-10:00) 夏威夷" />
                    <el-option value="<-09>9_0" label="(GMT-09:00) 阿拉斯加" />
                    <el-option value="PST8PDT,M3.2.0,M11.1.0_0" label="(GMT-08:00) 太平洋时间（美国和加拿大），蒂华纳" />
                    <el-option value="<-07>7_0" label="(GMT-07:00) 山地时间（美国和加拿大）" />
                    <el-option value="<-07>7_1" label="(GMT-07:00) 亚利桑那" />
                    <el-option value="MST7MDT,M4.1.0,M10.5.0_2" label="(GMT-07:00) 奇瓦瓦，拉巴斯，马扎特兰" />
                    <el-option value="<-06>6_0" label="(GMT-06:00) 萨斯喀彻温" />
                    <el-option value="<-06>6_1" label="(GMT-06:00) 中部时间（美国和加拿大）" />
                    <el-option value="<-06>6_2" label="(GMT-06:00) 中美洲" />
                    <el-option value="<-06>6_3" label="(GMT-06:00) 瓜达拉哈拉，墨西哥城，蒙特雷" />
                    <el-option value="<-05>5_0" label="(GMT-05:00) 波哥大，利马，基多" />
                    <el-option value="<-05>5_1" label="(GMT-05:00) 东部时间（美国和加拿大）" />
                    <el-option value="EST5EDT,M3.2.0,M11.1.0_2" label="(GMT-05:00) 印第安纳州（东部）" />
                    <el-option value="AST4ADT,M3.2.0,M11.1.0_0" label="(GMT-04:00) 大西洋时间（加拿大）" />
                    <el-option value="<-04>4_1" label="(GMT-04:00) 加拉加斯，拉巴斯" />
                    <el-option value="<-04>4<-03>,M8.2.6/24,M5.2.6/24_2" label="(GMT-04:00) 圣地亚哥" />
                    <el-option value="NST3:30NDT,M3.2.0,M11.1.0_0" label="(GMT-03:30) 纽芬兰" />
                    <el-option value="<-03>3_0" label="(GMT-03:00) 巴西利亚" />
                    <el-option value="<-03>3_1" label="(GMT-03:00) 布宜诺斯艾利斯，乔治敦" />
                    <el-option value="<-03>3_2" label="(GMT-03:00) 格陵兰" />
                    <el-option value="<-02>2_0" label="(GMT-02:00) 中大西洋" />
                    <el-option value="<-01>1_0" label="(GMT-01:00) 佛得角群岛" />
                    <el-option value="<-01>1<+00>,M3.5.0/0,M10.5.0/1_1" label="(GMT-01:00) 亚速尔群岛" />
                    <el-option value="GMT0IST,M3.5.0/1,M10.5.0_0" label="(GMT) 格林威治标准时间：都柏林，爱丁堡，伦敦，里斯本" />
                    <el-option value="WET0WEST,M3.5.0,M10.5.0/3_1" label="(GMT) 卡萨布兰卡，蒙罗维亚" />
                    <el-option value="CET-1CEST,M3.5.0,M10.5.0/3_0" label="(GMT+01:00) 阿姆斯特丹，柏林，伯尔尼，罗马，斯德哥尔摩，维也纳" />
                    <el-option value="CET-1CEST,M3.5.0,M10.5.0/3_1" label="(GMT+01:00) 贝尔格莱德，布拉迪斯拉发，布达佩斯，卢布尔雅那，布拉格" />
                    <el-option value="CET-1CEST,M3.5.0,M10.5.0/3_2" label="(GMT+01:00) 布鲁塞尔，哥本哈根，马德里，巴黎" />
                    <el-option value="CET-1CEST,M3.5.0,M10.5.0/3_3" label="(GMT+01:00) 萨拉热窝，斯科普里，华沙，萨格勒布" />
                    <el-option value="<+01>-1_4" label="(GMT+01:00) 中非西部" />
                    <el-option value="EET-2EEST,M3.5.0/3,M10.5.0/4_0" label="(GMT+02:00) 布加勒斯特" />
                    <el-option value="CAT-2_1" label="(GMT+02:00) 哈拉雷，比勒陀利亚" />
                    <el-option value="EET-2EEST,M3.5.0/3,M10.5.0/4_2" label="(GMT+02:00) 赫尔辛基，基辅，里加，索非亚，塔林，维尔纽斯" />
                    <el-option value="EET-2_3" label="(GMT+02:00) 开罗" />
                    <el-option value="EET-2EEST,M3.5.0/3,M10.5.0/4_4" label="(GMT+02:00) 雅典，贝鲁特，伊斯坦布尔，明斯克" />
                    <el-option value="IST-2IDT,M3.4.5/02:00:00,M10.5.0/02:00:00_5" label="(GMT+02:00) 耶路撒冷" />
                    <el-option value="<+03>-3_0" label="(GMT+03:00) 巴格达" />
                    <el-option value="<+03>-3_1" label="(GMT+03:00) 科威特，利雅得" />
                    <el-option value="<+03>-3_2" label="(GMT+03:00) 莫斯科，圣彼得堡，伏尔加格勒" />
                    <el-option value="EAT-3_3" label="(GMT+03:00) 内罗毕" />
                    <el-option value="<+0330>-3:30<+0430>,J80/0,J264/0_0" label="(GMT+03:30) 德黑兰" />
                    <el-option value="<+04>-4_0" label="(GMT+04:00) 阿布扎比，马斯喀特" />
                    <el-option value="<+04>-4_1" label="(GMT+04:00) 巴库，第比利斯，埃里温" />
                    <el-option value="<+0430>-4:30_0" label="(GMT+04:30) 喀布尔" />
                    <el-option value="<+05>-5_0" label="(GMT+05:00) 叶卡捷琳堡" />
                    <el-option value="PKT-5_1" label="(GMT+05:00) 伊斯兰堡，卡拉奇，塔什干" />
                    <el-option value="<+0530>-5:30_0" label="(GMT+05:30) 马德拉斯，加尔各答，孟买，新德里" />
                    <el-option value="<+0545>-5:45_0" label="(GMT+05:45) 加德满都" />
                    <el-option value="<+06>-6_0" label="(GMT+06:00) 阿拉木图，新西伯利亚" />
                    <el-option value="<+06>-6_1" label="(GMT+06:00) 阿斯塔纳，达卡" />
                    <el-option value="<+06>-6_2" label="(GMT+06:00) 斯里哈亚华登尼普拉" />
                    <el-option value="<+0630>-6:30_0" label="(GMT+06:30) 仰光" />
                    <el-option value="<+07>-7_0" label="(GMT+07:00) 克拉斯诺亚尔斯克" />
                    <el-option value="<+07>-7_1" label="(GMT+07:00) 曼谷，河内，雅加达" />
                    <el-option value="CST-8_0" label="(GMT+08:00) 北京，重庆，香港特别行政区，乌鲁木齐" />
                    <el-option value="<+08>-8_1" label="(GMT+08:00) 吉隆坡，新加坡" />
                    <el-option value="AWST-8_2" label="(GMT+08:00) 珀斯" />
                    <el-option value="CST-8_3" label="(GMT+08:00) 台北" />
                    <el-option value="<+08>-8_4" label="(GMT+08:00) 伊尔库茨克，乌兰巴图" />
                    <el-option value="JST-9_0" label="(GMT+09:00) 大阪，札幌，东京" />
                    <el-option value="KST-9_1" label="(GMT+09:00) 汉城" />
                    <el-option value="<+09>-9_2" label="(GMT+09:00) 雅库茨克" />
                    <el-option value="ACST-9:30ACDT,M10.1.0,M4.1.0/3_0" label="(GMT+09:30) 阿德莱德" />
                    <el-option value="ACST-9:30_1" label="(GMT+09:30) 达尔文" />
                    <el-option value="AEST-10_0" label="(GMT+10:00) 布里斯班" />
                    <el-option value="<+10>-10_1" label="(GMT+10:00) 弗拉迪沃斯托克" />
                    <el-option value="<+10>-10_2" label="(GMT+10:00) 关岛，莫尔兹比港" />
                    <el-option value="AEST-10AEDT,M10.1.0,M4.1.0/3_3" label="(GMT+10:00) 霍巴特" />
                    <el-option value="AEST-10AEDT,M10.1.0,M4.1.0/3_4" label="(GMT+10:00) 堪培拉，墨尔本，悉尼" />
                    <el-option value="<+11>-11_0" label="(GMT+11:00) 马加丹，所罗门群岛，新喀里多尼亚" />
                    <el-option value="<+12>-12_0" label="(GMT+12:00) 奥克兰，惠灵顿" />
                    <el-option value="<+12>-12_1" label="(GMT+12:00) 斐济，勘察加半岛，马绍尔群岛" />
                    <el-option value="<+13>-13_0" label="(GMT+13:00) 努库阿洛法" />
                  </el-select>
                </el-form-item>
                <el-form-item label="夏时制" prop="sntp_dst_enable" v-if="ruleForm.sntp_time_set_mode == '自动同步Sntp'">
                  <el-select v-model="ruleForm.sntp_dst_enable" :fit-input-width="true" style="width: 100%;">
                    <el-option value="1" label="启用" />
                    <el-option value="0" label="禁用" />
                  </el-select>
                </el-form-item>
                <el-form-item label="手动设置时间" v-if="ruleForm.sntp_time_set_mode == '手动设置时间'">
                  <el-select v-model="ruleForm.sntp_year" placeholder="年" style="width: 100px;">
                    <el-option v-for="year in years" :key="year" :value="year" :label="year"></el-option>
                  </el-select>
                  <el-select v-model="ruleForm.sntp_month" placeholder="月" style="width: 100px;">
                    <el-option v-for="month in months" :key="month" :value="month" :label="month"></el-option>
                  </el-select>
                  <el-select v-model="ruleForm.sntp_day" placeholder="日" style="width: 100px;">
                    <el-option v-for="day in days" :key="day" :value="day" :label="day"></el-option>
                  </el-select>
                  <el-select v-model="ruleForm.sntp_hour" placeholder="时" style="width: 100px;">
                    <el-option v-for="hour in hours" :key="hour" :value="hour" :label="hour"></el-option>
                  </el-select>
                  <el-select v-model="ruleForm.sntp_minute" placeholder="分" style="width: 100px;">
                    <el-option v-for="minute in minutes" :key="minute" :value="minute" :label="minute"></el-option>
                  </el-select>
                  <el-select v-model="ruleForm.sntp_second" placeholder="秒" style="width: 100px;">
                    <el-option v-for="second in seconds" :key="second" :value="second" :label="second"></el-option>
                  </el-select>
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
            <TypeIt :className="'type-it2'" :values="['其他设置说明']" :cursor="false" :speed="60" />
          </template>
          <template #default>
            <el-collapse v-model="activeNames">
              <el-collapse-item title="重启与复位" name="1">
                当重启或复位路由器后，你需要重新登陆
              </el-collapse-item>
              <el-collapse-item title="快速开机设置" name="2">
                如果启用了快速开机功能，设备将花费较短的时间开机。
              </el-collapse-item>
              <el-collapse-item title="可能的密码信息" name="3">
                {{ pwdinfo }}
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