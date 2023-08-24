<script setup lang="ts">
import { message } from "@/utils/message";
import TypeIt from "@/components/ReTypeit";
import { getapi, postapi } from "@/api/user";
import { ElMessageBox } from 'element-plus';
import { ref, onMounted, reactive } from 'vue';
defineOptions({
  name: "WifiBand"
});
const info = ref()
const activeNames = ref(['1']);
let load_switch = ref(true);//默认加载中
//表单字段定义
const ruleForm = reactive({
  wifiMode: '',//网络模式
  wifi_11n_cap: '',//频带宽度
  countryCode: '',//国家地区码
  selectedChannel: '',//信道
  wifi_band: ''
})
//页面加载完成
onMounted(() => {
  init();
});
function init() {
  getapi('multi_data=1&cmd=WirelessMode%2Cwifi_band%2CCountryCode%2CMAX_Access_num%2Cm_MAX_Access_num%2CChannel%2Cwifi_11n_cap%2Cwifi_sta_connection').then(res => {
    console.log(res);
    info.value = res;
    load_switch.value = false;
    ruleForm.wifiMode = info.value.WirelessMode;
    ruleForm.countryCode = info.value.CountryCode;
    ruleForm.selectedChannel = info.value.Channel;
    ruleForm.wifi_11n_cap = info.value.wifi_11n_cap;
    ruleForm.wifi_band = info.value.wifi_band == 'b' ? '2.4G' : info.value.wifi_band;
    console.log(ruleForm);
  }).catch(error => {
    load_switch.value = false;
    console.log('加载失败', error);
  });
}
function submitForm() {
  ElMessageBox.confirm(
    `所有已连接的 Wi-Fi 设备需要重连。您要继续吗？`,
    {
      confirmButtonText: '继续',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    load_switch.value = true;
    postapi({
      wifiMode: ruleForm.wifiMode,
      countryCode: ruleForm.countryCode,
      MAX_Access_num: info.value.MAX_Access_num,
      m_MAX_Access_num: info.value.m_MAX_Access_num,
      wifi_band: ruleForm.wifi_band == '2.4G' ? 'b' : ruleForm.wifi_band,
      selectedChannel: ruleForm.selectedChannel,
      abg_rate: '0',
      wifi_11n_cap: ruleForm.wifi_11n_cap,
      goformId: "SET_WIFI_INFO"
    }).then(res => {
      if (res.result == "success") {
        init();
        message("成功发送请求", { type: "success" });
      } else {
        message("操作失败", { type: "error" });
        load_switch.value = false;
      }
    }).catch(error => {
      message("请求失败", { type: "error" });
      load_switch.value = false;
    });
  }).catch(() => {
    message("取消应用", { type: "info" });
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
            <TypeIt :className="'type-it1'" :values="['Wi-Fi 频段设置']" :cursor="false" :speed="60" />
          </template>
          <template #default>
            <div class="form-container">
              <el-form ref="ruleFormRef" :model="ruleForm" status-icon label-width="120px" class="demo-ruleForm"
                label-position="left">
                <el-form-item label="频段选择">
                  <el-input v-model="ruleForm.wifi_band" type="text" autocomplete="off" disabled />
                </el-form-item>
                <el-form-item label="网络模式" prop="wifiMode">
                  <el-select v-model="ruleForm.wifiMode" :fit-input-width="true" style="width: 100%;">
                    <el-option label="802.11 b/g/n" value="4" />
                    <el-option label="仅 802.11 n" value="2" />
                  </el-select>
                </el-form-item>
                <el-form-item label="频带宽度" prop="wifi_11n_cap">
                  <el-select v-model="ruleForm.wifi_11n_cap" :fit-input-width="true" style="width: 100%;">
                    <el-option label="20MHz" value="0" />
                    <el-option label="20MHz/40MHz" value="1" />
                  </el-select>
                </el-form-item>
                <el-form-item label="国家/地区 码" prop="countryCode">
                  <el-select v-model="ruleForm.countryCode" :fit-input-width="true" style="width: 100%;">
                    <el-option label="中国" value="CN" />
                    <el-option label="台灣" value="TW" />
                    <el-option label="日本" value="JP" />
                    <el-option label="澳門" value="MO" />
                    <el-option label="香港" value="HK" />
                  </el-select>
                </el-form-item>
                <el-form-item label="信道" prop="selectedChannel">
                  <el-select v-model="ruleForm.selectedChannel" :fit-input-width="true" style="width: 100%;">
                    <el-option label="自动" value="0" />
                    <el-option label="2412MHz (频道 1)" data-id="1_2412" value="1" />
                    <el-option label="2417MHz (频道 2)" data-id="2_2417" value="2" />
                    <el-option label="2422MHz (频道 3)" data-id="3_2422" value="3" />
                    <el-option label="2427MHz (频道 4)" data-id="4_2427" value="4" />
                    <el-option label="2432MHz (频道 5)" data-id="5_2432" value="5" />
                    <el-option label="2437MHz (频道 6)" data-id="6_2437" value="6" />
                    <el-option label="2442MHz (频道 7)" data-id="7_2442" value="7" />
                    <el-option label="2447MHz (频道 8)" data-id="8_2447" value="8" />
                    <el-option label="2452MHz (频道 9)" data-id="9_2452" value="9" />
                    <el-option label="2457MHz (频道 10)" data-id="10_2457" value="10" />
                    <el-option label="2462MHz (频道 11)" data-id="11_2462" value="11" />
                    <el-option label="2467MHz (频道 12)" data-id="12_2467" value="12" />
                    <el-option label="2472MHz (频道 13)" data-id="13_2472" value="13" />
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
        <el-card shadow="never" v-loading="load_switch">
          <template #header>
            <TypeIt :className="'type-it2'" :values="['设置说明']" :cursor="false" :speed="60" />
          </template>
          <template #default>
            <el-collapse v-model="activeNames">
              <el-collapse-item title="频段选择" name="1">
                您可以为您的设备选择合适的频段。
              </el-collapse-item>
              <el-collapse-item title="网络模式" name="2">
                选择合适的无线网络模式，该设备的无线性能会提高。
              </el-collapse-item>
              <el-collapse-item title="国家/地区码" name="3">
                您可以为您的设备选择合适的国家/地区码。
              </el-collapse-item>
              <el-collapse-item title="信道" name="4">
                选择合适的频道来优化Wi-Fi网络性能和覆盖范围。
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