<script setup lang="ts">
//下面是监听全局变量
import { useStore } from 'vuex';
import { ref, watchEffect, reactive } from 'vue';
import TypeIt from "@/components/ReTypeit";
// import { useWindowSize } from "@vueuse/core";
import { message } from "@/utils/message";
import type { FormInstance } from 'element-plus';
import { postapi } from "@/api/user";

defineOptions({
  name: "NetSwitch"
});
const activeNames = ref(['1'])
const ruleFormRef = ref<FormInstance>()
const store = useStore();
let load_switch = ref(true);//默认加载中
//表单字段定义
const ruleForm = reactive({
  wifi: '',
  sleep: '',
})
let old_wifi = ref('');
let old_sleep = ref('');
// 监听 signal 变量的变化
watchEffect(() => {
  const wc = store.state.NetInfo.wifi_coverage;
  const sel = store.state.NetInfo.Sleep_interval;
  const newwc = wc == 'long_mode' ? '远距离 Wi-Fi 范围' : wc == 'medium_mode' ? '中距离 Wi-Fi 范围' : '近距离 Wi-Fi 范围 - 最佳电池续航';
  // 将字符串转换为小写，并使用正则表达式替换空格为空字符串
  if (sel != '' && wc != '') {
    // console.log(old_sleep.value, old_wifi.value, sel, newwc);
    if (old_sleep.value == sel && load_switch.value == true) load_switch.value = false;
    if (old_wifi.value == newwc && load_switch.value == true) load_switch.value = false;
  }
  if (ruleForm && ruleForm.wifi == '' && ruleForm.sleep == '' && wc != '' && sel != '') {
    // ruleForm.wifi = store.state.NetInfo.wifi_coverage;//近距离：short_mode
    ruleForm.wifi = old_wifi.value = newwc
    ruleForm.sleep = old_sleep.value = sel;
    if (ruleForm.wifi != '' && ruleForm.sleep != '') {
      load_switch.value = false;
    }
  }
});
function getWiFiMode(chinese) {
  switch (chinese) {
    case '远距离 Wi-Fi 范围':
      return 'long_mode';
    case '中距离 Wi-Fi 范围':
      return 'medium_mode';
    case '近距离 Wi-Fi 范围 - 最佳电池续航':
      return 'short_mode';
    default:
      return '';
  }
}
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  // 初始化字段信息
  formEl.clearValidate()
  formEl.validate((valid) => {
    if (valid) {
      if (ruleForm.wifi == old_wifi.value && ruleForm.sleep == old_sleep.value) {
        message("未修改内容", { type: "warning" });
        return;
      }
      if (ruleForm.wifi != old_wifi.value) {
        old_wifi.value = ruleForm.wifi;
        load_switch.value = true;
        postapi({ goformId: "SET_WIFI_COVERAGE", wifi_coverage: getWiFiMode(ruleForm.wifi) }).then(res => {
          store.state.NetInfo.imei = '';
          if (res.result == "success") {
            message("成功发送请求", { type: "success" });
          } else {
            load_switch.value = false;
            message("操作失败", { type: "error" });
          }
        }).catch(error => {
          load_switch.value = false;
          message("请求失败", { type: "error" });
        });
      }
      if (ruleForm.sleep != old_sleep.value) {
        old_sleep.value = ruleForm.sleep;
        load_switch.value = true;
        postapi({ goformId: "SET_WIFI_SLEEP_INFO", sysIdleTimeToSleep: ruleForm.sleep }).then(res => {
          store.state.NetInfo.imei = '';
          if (res.result == "success") {
            message("成功发送请求", { type: "success" });
          } else {
            load_switch.value = false;
            message("操作失败", { type: "error" });
          }
        }).catch(error => {
          load_switch.value = false;
          message("请求失败", { type: "error" });
        });
      }
      console.log('提交的内容：', ruleForm);
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
            <TypeIt :className="'type-it1'" :values="['Wi-Fi 性能设置']" :cursor="false" :speed="60" />
          </template>
          <template #default>
            <div class="form-container">
              <el-form ref="ruleFormRef" :model="ruleForm" status-icon label-width="120px" class="demo-ruleForm"
                label-position="left">
                <el-form-item label="Wi-Fi 覆盖范围">
                  <el-radio-group>
                    <el-row></el-row>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="" label-width="0">
                  <el-radio-group v-model="ruleForm.wifi">
                    <el-row>
                      <el-col>
                        <el-radio border label="近距离 Wi-Fi 范围 - 最佳电池续航" />
                      </el-col>
                      <el-col>
                        <el-radio border label="中距离 Wi-Fi 范围" />
                      </el-col>
                      <el-col>
                        <el-radio border label="远距离 Wi-Fi 范围" />
                      </el-col>
                    </el-row>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="Wi-Fi 休眠时间设置" prop="sleep" label-width="140">
                  <el-select v-model="ruleForm.sleep" :fit-input-width="true" style="width: 100%;">
                    <el-option label="从不休眠" value="-1" />
                    <el-option label="5分钟" value="5" />
                    <el-option label="10分钟" value="10" />
                    <el-option label="20分钟" value="20" />
                    <el-option label="30分钟" value="30" />
                    <el-option label="1小时" value="60" />
                    <el-option label="2小时" value="120" />
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
            <TypeIt :className="'type-it2'" :values="['Wi-Fi 性能设置帮助']" :cursor="false" :speed="60" />
          </template>
          <template #default>
            <el-collapse v-model="activeNames">
              <el-collapse-item title="Wi-Fi 范围" name="1">
                <div>
                  <b>近距离 Wi-Fi 范围</b>：覆盖范围和发射功耗小，是最佳电池续航方案。<br>
                  <b>中距离 Wi-Fi 范围</b>：覆盖范围和发射功耗是设备支持能力的一半，正常耗电。<br>
                  <b>远距离 Wi-Fi 范围</b>：设备最大发射功耗和覆盖范围，如果一直有终端接入，耗电会增加，减少电池续航。
                </div>
              </el-collapse-item>
              <el-collapse-item title="休眠时间" name="2">
                <div>
                  <b>休眠时间</b>：当在指定的时间内无 Wi-Fi 连接时，Wi-Fi 功能将会停用，系统会转入休眠模式以节省电量。
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