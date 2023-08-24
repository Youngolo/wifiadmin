<script setup lang="ts">
//下面是监听全局变量
import { useStore } from 'vuex';
import { useRouter } from "vue-router";
import { ref, watchEffect, reactive } from 'vue';
import TypeIt from "@/components/ReTypeit";
import { message } from "@/utils/message";
import { postapi } from "@/api/user";
import type { FormInstance, FormRules } from 'element-plus'
import { formatDataSize, formatBytes, convertToBytes, convertDataSize } from "../../welcome/components/fun";

defineOptions({
  name: "DataPlan"
});
const router = useRouter();
let wait = ref(false);
let isload = ref(false);
let isedit = ref(false);
let Old_Array = ref(['', '', '']);
const ruleFormRef = ref<FormInstance>()
let newinfo = ref({});
let allinfo = ref({});
let old_used = ref('');
const store = useStore();
// const { height } = useWindowSize();
let switch_data = ref(false);//数据启动/停止
let load_switch = ref(true);//默认加载中
//表单字段定义
const ruleForm = reactive({
  Used: '',//已使用
  EUsed: '',//已使用，编辑
  residue: '',//剩余
  residuetype: '',//剩余单位
  threshold: '',//阈值
  thresholdType: '%',//阈值单位
  ysy_unit: '',//已使用单位
  editysy_unit: '',//编辑已使用单位
  tc_unit: '',//套餐单位
  Package: '',//套餐大小
  Package_type: ''//套餐方式
})
let Old_ruleForm = [];//使用时间
// 监听 signal 变量的变化
watchEffect(() => {
  newinfo.value = store.state.NetWork;
  allinfo.value = store.state.NetInfo;
  switch_data.value = store.state.NetWork.data_volume_limit_switch == '1' ? true : false;
  if (load_switch.value == true && switch_data.value == true && isload.value == true) {
    isload.value = false;
    load_switch.value = false;
  }
  //填充表单
  const ssndp = store.state.NetWork.data_volume_alert_percent;
  const ssnds = store.state.NetWork.data_volume_limit_size;
  const new_unit = store.state.NetWork.data_volume_limit_unit;
  if ((ruleForm && ruleForm.Package_type == '' && new_unit != '') || wait.value == true) {
    //流量统计变量
    ruleForm.Package_type = new_unit == 'data' ? '流量' : '时间';
    if (ruleForm.Package_type == '流量') {
      const size = formatDataSize(ssnds);
      const cun = parseInt(store.state.NetWork.monthly_tx_bytes) + parseInt(store.state.NetWork.monthly_rx_bytes);
      const array = formatBytes(cun.toString()).split(' ');
      ruleForm.Used = array[0];
      ruleForm.ysy_unit = array[1];
      const sss = convertToBytes(size) - parseInt(cun);
      const array1 = formatBytes(Math.abs(sss).toString()).split(' ');
      ruleForm.residue = array1[0] == 'NaN' ? '0' : array1[0];
      if (sss < 0) ruleForm.residue = '超出：' + ruleForm.residue;
      ruleForm.residuetype = array1[1] == 'undefined' ? 'MB' : array1[1];
      ruleForm.threshold = ssndp;
      const thresholdType = (convertToBytes(size) * (parseInt(ssndp) / 100)).toString();
      ruleForm.thresholdType = '% (' + formatBytes(thresholdType) + ')';
      const array2 = size.match(/[^\d]+|\d+/g);
      ruleForm.Package = array2[0];
      ruleForm.tc_unit = array2[1];
    } else {
      const y_used = parseInt(store.state.NetWork.monthly_time) / 3600;
      const size = ssnds;
      ruleForm.Used = (y_used.toFixed(2)).toString();
      ruleForm.ysy_unit = '小时';
      ruleForm.residue = ((parseInt(size) - parseInt(y_used)).toFixed(2)).toString();
      ruleForm.residuetype = '小时';
      ruleForm.threshold = ssndp;
      const thresholdType = (parseInt(size) * (parseInt(ssndp) / 100)).toString();
      ruleForm.thresholdType = '% (' + parseInt(thresholdType).toFixed(2) + '小时)';
      ruleForm.Package = size;
      ruleForm.tc_unit = '小时';
    }
    Old_ruleForm.push(ruleForm.Package_type);
    Old_ruleForm.push(ruleForm.Used);
    Old_ruleForm.push(ruleForm.ysy_unit);
    Old_ruleForm.push(ruleForm.residue);
    Old_ruleForm.push(ruleForm.residuetype);
    Old_ruleForm.push(ruleForm.threshold);
    Old_ruleForm.push(ruleForm.thresholdType);
    Old_ruleForm.push(ruleForm.Package);
    Old_ruleForm.push(ruleForm.tc_unit);
    const old_is_null = Old_Array.value[0] == '' && Old_Array.value[1] == '' && Old_Array.value[2] == '';
    if (old_is_null || (Old_Array.value[0] == new_unit && Old_Array.value[1] == ssndp && Old_Array.value[2] == ssnds)) {
      if (old_used.value == '') {
        load_switch.value = wait.value = false;
      } else {
        // console.log(old_used.value, formatBytes(store.state.NetWork.monthly_rx_bytes));
        if (old_used.value == formatBytes(store.state.NetWork.monthly_rx_bytes) || ruleForm.Package_type == '时间') {
          setTimeout(function () {
            load_switch.value = wait.value = false;
          }, 1500); // 1000 毫秒等于 1 秒
          old_used.value = '';
        }
      }
    }
  }
});
//开始编辑
function start_edit(e) {
  isedit.value = e;
  if (e == 1) {//同步内容
    ruleForm.EUsed = ruleForm.Used;
    ruleForm.editysy_unit = ruleForm.ysy_unit;
  }
}

function setDtat(e) {
  load_switch.value = e;
  isload.value = true;
  postapi({
    goformId: "DATA_LIMIT_SETTING",
    data_volume_limit_switch: e == true ? '1' : '0',
    data_volume_limit_unit: store.state.NetWork.data_volume_limit_unit,
    data_volume_limit_size: store.state.NetWork.data_volume_limit_size,
    data_volume_alert_percent: store.state.NetWork.data_volume_alert_percent//提醒值
  }).then(res => {
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

const validatethreshold = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error('请输入提醒阈值'))
  }
  if (value <= 0 || value > 100) {
    callback(new Error('请输入正确的百分比'))
  } else {
    callback()
  }
}

const validatethreshold1 = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error('请输入流量套餐'))
  } else {
    callback()
  }
}

function upedit() {
  ruleForm.Used = ruleForm.EUsed;
  ruleForm.ysy_unit = ruleForm.editysy_unit;
  isedit.value = false;
}

function handleRadioChange(e) {
  if (e != Old_ruleForm[0]) {
    if (Old_ruleForm[0] == '时间') {
      const cun = parseInt(store.state.NetWork.monthly_tx_bytes) + parseInt(store.state.NetWork.monthly_rx_bytes);
      const array = formatBytes(cun.toString()).split(' ');
      ruleForm.Used = array[0];
      ruleForm.ysy_unit = array[1];
    } else {
      const y_used = parseInt(store.state.NetWork.monthly_time) / 3600;
      ruleForm.Used = (y_used.toFixed(2)).toString();
      ruleForm.ysy_unit = '小时';
    }
    ruleForm.residue = '';//parseInt(0).toString();
    ruleForm.residuetype = Old_ruleForm[0] == '时间' ? 'MB' : '小时';
    ruleForm.threshold = '';//parseInt(0).toString();
    ruleForm.thresholdType = '%';
    ruleForm.Package = '';//parseInt(0).toString();
    ruleForm.tc_unit = Old_ruleForm[0] == '时间' ? 'MB' : '小时';
  } else {
    ruleForm.Used = Old_ruleForm[1];
    ruleForm.ysy_unit = Old_ruleForm[2];
    ruleForm.residue = Old_ruleForm[3];
    ruleForm.residuetype = Old_ruleForm[4];
    ruleForm.threshold = Old_ruleForm[5];
    ruleForm.thresholdType = Old_ruleForm[6];
    ruleForm.Package = Old_ruleForm[7];
    ruleForm.tc_unit = Old_ruleForm[8];
  }
}

const rules = reactive<FormRules<typeof ruleForm>>({
  threshold: [{ validator: validatethreshold, trigger: 'blur' }],
  Package: [{ validator: validatethreshold1, trigger: 'blur' }],
})

const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  // 初始化字段信息
  formEl.clearValidate()
  formEl.validate((valid) => {
    if (valid) {
      const post_data = {
        "goformId": "DATA_LIMIT_SETTING",
        "data_volume_limit_switch": store.state.NetWork.data_volume_limit_switch,
        "data_volume_limit_unit": ruleForm.Package_type == '流量' ? 'data' : 'time',
        "data_volume_alert_percent": ruleForm.threshold,//提醒值
        "data_volume_limit_size": ruleForm.Package
      }
      if (ruleForm.Package_type == '流量') {
        post_data.data_volume_limit_size = convertDataSize(ruleForm.Package + ruleForm.tc_unit);
      }
      load_switch.value = true;
      Old_Array.value[0] = post_data.data_volume_limit_unit;
      Old_Array.value[1] = post_data.data_volume_alert_percent;
      Old_Array.value[2] = post_data.data_volume_limit_size;
      postapi(post_data).then(res => {
        if (res.result == "success") {
          wait.value = true;
          if (ruleForm.threshold == Old_ruleForm[5] && ruleForm.Package == Old_ruleForm[7] && ruleForm.Package_type == Old_ruleForm[0]) {
            wait.value = false;
            load_switch.value = false;
          }
          let ttt, dddd;
          if (ruleForm.EUsed == '') return;
          load_switch.value = true;
          if (ruleForm.Package_type == '流量') {
            ttt = 0;
            let dw;
            if (ruleForm.editysy_unit == 'MB') dw = '1';
            if (ruleForm.editysy_unit == 'GB') dw = '1024';
            if (ruleForm.editysy_unit == 'TB') dw = '1048576';
            dddd = parseInt(ruleForm.EUsed) * dw;
            old_used.value = parseInt(ruleForm.EUsed) + ' ' + ruleForm.editysy_unit;
          } else {
            dddd = 0;
            ttt = ruleForm.EUsed;
            old_used.value = ruleForm.EUsed;
          }
          const apidata = {
            'goformId': 'FLOW_CALIBRATION_MANUAL',
            'calibration_way': ruleForm.Package_type == '流量' ? 'data' : 'time',
            'time': ttt,
            'data': dddd
          };
          wait.value = true;
          postapi(apidata).then(res => {
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
          message("成功发送请求", { type: "success" });
        } else {
          message("操作失败", { type: "error" });
          load_switch.value = false;
        }
      }).catch(error => {
        message("请求失败", { type: "error" });
        load_switch.value = false;
      });
    } else {
      message("请检查表单内容", { type: "error" });
      return false
    }
  })
}

//内容变化重新计算预警值
function handleSelectChange(e) {
  if (ruleForm.Package_type == '流量') {
    const size = ruleForm.Package + ruleForm.tc_unit;
    // console.log(size);
    const thresholdType = (convertToBytes(size) * (parseInt(ruleForm.threshold) / 100)).toString();
    ruleForm.thresholdType = '% (' + formatBytes(thresholdType) + ')';
  } else {
    const size = ruleForm.Package;
    const thresholdType = (parseInt(size) * (parseInt(ruleForm.threshold) / 100)).toString();
    ruleForm.thresholdType = '% (' + parseInt(thresholdType).toFixed(2) + '小时)';
  }
}
</script>

<template>
  <div>
    <el-row :gutter="24">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16" class="mb-[5px]" v-motion :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }">
        <el-tag style="width: 100%;margin-bottom: 5px;white-space: normal;" size="large" effect="dark">
          您可以在该页面创建流量计划、查询已用流量及剩余流量
        </el-tag>
        <el-card shadow="never" v-loading="load_switch">
          <template #header>
            <div class="card-header">
              <div class="type-it-container">
                <TypeIt :className="'type-it1'" :values="['套餐设置']" :cursor="false" :speed="60" />
              </div>
              <div class="button-container">
                <el-tag class="ml-2">
                  流量管理状态：<el-switch size="small" v-model="switch_data" @change="setDtat" />
                </el-tag>
              </div>
            </div>
          </template>
          <template #default>
            <div class="form-container">
              <el-form ref="ruleFormRef" :model="ruleForm" status-icon :rules="rules" label-width="70px"
                class="demo-ruleForm" label-position="left">
                <el-form-item label="套餐形式">
                  <el-radio-group v-model="ruleForm.Package_type" @change="handleRadioChange">
                    <el-radio border label="流量" />
                    <el-radio border label="时间" />
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="已使用" prop="EUsed" v-if="isedit">
                  <el-input v-model.number="ruleForm.EUsed" style="width: 65%;" type="number">
                    <template #append>
                      <el-select v-model="ruleForm.editysy_unit" placeholder="Select" style="width: 73px">
                        <el-option label="MB" value="MB" v-if="ruleForm.Package_type == '流量'" />
                        <el-option label="GB" value="GB" v-if="ruleForm.Package_type == '流量'" />
                        <el-option label="TB" value="TB" v-if="ruleForm.Package_type == '流量'" />
                        <el-option label="小时" value="小时" v-if="ruleForm.Package_type == '时间'" />
                        <!-- <el-option label="分钟" value="分钟" v-if="ruleForm.Package_type == '时间'" /> -->
                      </el-select>
                    </template>
                  </el-input>
                  <div style="width: 35%;">
                    <el-button style="margin-left: 5px;width: 30px;" @click="upedit">
                      <IconifyIconOnline icon="icon-park-outline:correct" />
                    </el-button>
                    <el-button style="margin-left: 5px;width: 30px;" @click="start_edit(0)">
                      <IconifyIconOnline icon="icon-park-outline:error" />
                    </el-button>
                  </div>
                </el-form-item>
                <el-form-item label="已使用" prop="Used" v-else>
                  <el-input v-model.number="ruleForm.Used" disabled style="width: 70%;">
                    <template #append> {{ ruleForm.ysy_unit }} </template>
                  </el-input>
                  <el-button style="margin-left: 5px;" @click="start_edit(1)">
                    <IconifyIconOnline icon="uil:edit" />
                  </el-button>
                </el-form-item>
                <el-form-item label="剩余" prop="residue">
                  <el-input v-model="ruleForm.residue" disabled>
                    <template #append> {{ ruleForm.residuetype }} </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="提醒阈值" prop="threshold">
                  <el-input id="ssid" v-model.number="ruleForm.threshold" type="number" @change="handleSelectChange">
                    <template #append> {{ ruleForm.thresholdType }} </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="流量套餐" prop="Package">
                  <el-input v-model.number="ruleForm.Package" type="number" @change="handleSelectChange">
                    <template #append>
                      <el-select v-model="ruleForm.tc_unit" placeholder="Select" style="width: 100px"
                        @change="handleSelectChange">
                        <el-option label="MB" value="MB" v-if="ruleForm.Package_type == '流量'" />
                        <el-option label="GB" value="GB" v-if="ruleForm.Package_type == '流量'" />
                        <el-option label="TB" value="TB" v-if="ruleForm.Package_type == '流量'" />
                        <el-option label="小时" value="小时" v-if="ruleForm.Package_type == '时间'" />
                        <!-- <el-option label="分钟" value="分钟" v-if="ruleForm.Package_type == '时间'" /> -->
                      </el-select>
                    </template>
                  </el-input>
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
            <TypeIt :className="'type-it2'" :values="['说明']" :cursor="false" :speed="60" />
          </template>
          <template #default>
            <el-text class="mx-1">支持手动校准流量功能。如果页面流量统计与实际有偏差，您可以修改实际已用流量。<br></el-text>
            <el-text class="mx-1">当已用流量/时间达到设置的百分比时提醒我。<br></el-text>
            <el-text class="mx-1">当流量套餐单位为MB时，已使用流量的统计范围需小于4096TB。</el-text>
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