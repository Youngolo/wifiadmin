<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { message } from "@/utils/message";
import TypeIt from "@/components/ReTypeit";
import { getapi, postapi } from "@/api/user";
import { ElMessageBox } from 'element-plus';
import { getConfig } from "@/config";
defineOptions({
  name: "Band"
});
const info = ref()
const config = ref();
const info_list = ref([]);
const is_r186x = ref(false);
let load_switch = ref(true);//默认加载中
//页面加载完成
onMounted(() => {
  is_r186x.value = getConfig()?.is_r186x ?? false;
  console.log(is_r186x.value);
  if (is_r186x.value == true) {
    r186x_init();
  } else {
    init();
  }
});
//表单
const ruleForm = ref({
  All_4G: '0',
  All_23G: '0'
})
function init() {
  getapi('cmd=set_band_list').then(res => {
    config.value = res.set_band_list.split(',');
    console.log(config.value);
    getapi('cmd=get_support_band').then(res => {
      info.value = res;
      info_list.value = Object.entries(res).map(([name, value], index) => ({
        value: name,
        checked: config.value.includes(name),
        isdisabled: value,
        name: get_name(name),
        type: name.includes("LTEB") ? '4G' : '2/3G'
      }));
      console.log(info_list.value);
      load_switch.value = false;
    }).catch(error => {
      load_switch.value = false;
      console.log('加载失败');
    });
  }).catch(error => {
    load_switch.value = false;
    console.log('加载失败', error);
  });
}
function get_name(e) {
  if (e.includes("LTEB")) {
    return e.replace(/LTEB/g, "LTE Band");
  } else if (e.includes("WB")) {
    return e.replace(/WB/g, "WCDMA BAND");
  } else if (e.includes("WB")) {
    return e.replace(/WB/g, "WCDMA BAND");
  } else {
    return e;
  }
}
function GetList(e) {
  try {
    return info_list.value.filter(item => item.type === e);
  } catch (error) {
    console.log('未加载完成');
    return [];
  }
}
function all4g(e) {
  try {
    info_list.value.forEach(item => {
      if (item.type === '4G' && item.isdisabled === "1") {
        item.checked = e;
      }
    });
  } catch (error) {
    console.log('未加载完成');
  }
}
function all23g(e) {
  try {
    info_list.value.forEach(item => {
      if (item.type === '2/3G' && item.isdisabled === "1") {
        item.checked = e;
      }
    });
  } catch (error) {
    console.log('未加载完成');
  }
}
function set() {
  let checked_list = [];
  for (let index = 0; index < info_list.value.length; index++) {
    const element = info_list.value[index];
    if (element.checked == true) {
      checked_list.push(element.value);
    }
  }
  const post_data = checked_list.join(',');
  console.log(checked_list, post_data);
  ElMessageBox.confirm(
    `该操作会自动重启设备才能完成设置，是否继续执行该操作？`,
    {
      confirmButtonText: '继续',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    load_switch.value = true;
    postapi({
      band_list: post_data,
      goformId: "GOFORM_SET_BAND"
    }).then(res => {
      if (res.result == "success") {
        load_switch.value = false;
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
//表单字段定义
const r186x_ruleForm = reactive({
  lte_band: '',//当前频段
  work_lte_band: '149,0,0,0,160,1,0,0'//选择判断
})
//r186x初始化
function r186x_init() {
  getapi('cmd=lte_band%2Ccell_id%2Cping_google&multi_data=1').then(res => {
    r186x_ruleForm.lte_band = res.lte_band;
    getapi('cmd=work_lte_band&multi_data=1').then(res => {
      r186x_ruleForm.work_lte_band = res.work_lte_band.slice(0, -2);
      load_switch.value = false;
      console.log(res);
    }).catch(error => {
      load_switch.value = false;
      console.log('加载失败');
    });
  }).catch(error => {
    load_switch.value = false;
    console.log('加载失败', error);
  });
}
function r186x_save() {
  ElMessageBox.confirm(
    `该操作会自动重启设备才能完成设置，是否继续执行该操作？`,
    {
      confirmButtonText: '继续',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    load_switch.value = true;
    postapi({
      ping_google: "no",
      goformId: "SET_FREQ_BAND",
      work_lte_band: r186x_ruleForm.work_lte_band
    }).then(res => {
      load_switch.value = false;
      message("成功发送请求", { type: "success" });
    }).catch(error => {
      load_switch.value = false;
      message("成功发送请求", { type: "success" });
    });
  }).catch(() => {
    message("取消应用", { type: "info" });
  })
}
</script>
<template>
  <div>
    <el-row :gutter="24" v-if="is_r186x">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16" class="mb-[5px]" v-motion :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }">
        <el-card shadow="never" v-loading="load_switch">
          <template #header>
            <TypeIt :className="'type-it1'" :values="['频段选择']" :cursor="false" :speed="60" />
          </template>
          <template #default>
            <div class="form-container">
              <el-form ref="ruleFormRef" :model="r186x_ruleForm" status-icon class="demo-ruleForm" label-position="left">
                <el-form-item label="当前频段" prop="lte_band">
                  <el-input v-model="r186x_ruleForm.lte_band" type="text" autocomplete="off" disabled />
                </el-form-item>
                <el-form-item label="选择频段" prop="work_lte_band">
                  <el-select v-model="r186x_ruleForm.work_lte_band" :fit-input-width="true" style="width: 100%;">
                    <el-option value="1,0,0,0,0,0,0,0" label="1" />
                    <el-option value="4,0,0,0,0,0,0,0" label="3" />
                    <el-option value="16,0,0,0,0,0,0,0" label="5" />
                    <el-option value="128,0,0,0,0,0,0,0" label="8" />
                    <el-option value="0,0,0,0,32,0,0,0" label="38" />
                    <el-option value="0,0,0,0,128,0,0,0" label="40" />
                    <el-option value="0,0,0,0,0,1,0,0" label="41" />
                    <el-option value="149,0,0,0,160,1,0,0" label="1/3/5/8/38/40/41" />
                  </el-select>
                </el-form-item>
                <el-form-item class="form-buttons">
                  <el-button type="primary" @click="r186x_save()" style="width: 100%;">应用</el-button>
                </el-form-item>
              </el-form>
            </div>
          </template>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8" class="mb-[5px]" v-motion :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }">
        <el-card shadow="never">
          <template #header>
            <TypeIt :className="'type-it2'" :values="['设置说明']" :cursor="false" :speed="60" />
          </template>
          <template #default>
            此设置用于锁定指定的频段
          </template>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="24" v-else>
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb-[5px]" v-motion :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }">
        <el-card shadow="never" v-loading="load_switch">
          <template #header>
            <div class="card-header">
              <div class="type-it-container">
                <TypeIt :className="'type-it1'" :values="['4G频段选择']" :cursor="false" :speed="60" />
              </div>
              <div class="button-container">
                <el-checkbox v-model="ruleForm.All_4G" @change="all4g" label="4G全选" border />
              </div>
            </div>
          </template>
          <template #default>
            <div class="form-container">
              <el-checkbox style="margin-top: 5px;" v-for="item in GetList('4G')" :key="item.name" v-model="item.checked"
                :label="item.name" size="large" border :disabled="item.isdisabled == '0'" />
            </div>
          </template>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb-[5px]" v-motion :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }">
        <el-card shadow="never" v-loading="load_switch">
          <template #header>
            <div class="card-header">
              <div class="type-it-container">
                <TypeIt :className="'type-it2'" :values="['2/3G频段选择']" :cursor="false" :speed="60" />
              </div>
              <div class="button-container">
                <el-checkbox v-model="ruleForm.All_23G" @change="all23g" label="2/3G全选" border />
              </div>
            </div>
          </template>
          <template #default>
            <div class="form-container">
              <el-checkbox style="margin-top: 5px;" v-for="item in GetList('2/3G')" :key="item.name"
                v-model="item.checked" :label="item.name" size="large" border :disabled="item.isdisabled == '0'" />
            </div>
            <el-button type="primary" style="margin-top: 15px; width: 100%; " @click="set()">应用</el-button>
          </template>
        </el-card>
        <el-tag type="info" style="width: 100%;margin-top: 5px;white-space: normal;" size="large" effect="dark">
          只能选择当前设备支持的频段，不可以选择不支持的频段。
        </el-tag>
      </el-col>
    </el-row>
  </div>
</template>
<style>
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