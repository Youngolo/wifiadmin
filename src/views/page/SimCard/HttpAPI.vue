<script setup lang="ts">
import { message } from "@/utils/message";
import TypeIt from "@/components/ReTypeit";
import { ref, reactive, onMounted } from 'vue';
import { getapi, postapi, httpapi, hexToAscii, convertToTimeString, asciiToHex } from "@/api/user";
defineOptions({
  name: "HttpAPI"
});
//折叠面板
const activeNames = ref(['1'])
const handleChange = (val: string[]) => {
  console.log(val)
}
const info = ref({
  id: '',
  api_url: '',//API接口
  http_type: '',//请求方式
  http_head: '',
  http_body: '',
  js_code: '',//解析代码
});
const http_res = ref('');
const load_switch = ref(true);//默认加载中
const table_list = ref([{ name: '', data: '' }]);
//表单字段定义
const ruleForm = reactive({
  api_url: '',//API接口
  http_type: 'POST',//请求方式
  http_head: '',
  http_body: '',
  js_code: '',//解析代码
})
//页面加载完成
onMounted(() => {
  init();
});
function init() {
  getapi('cmd=sms_data_total&page=0&data_per_page=500&mem_store=1&tags=4&number=Config&order_by=order+by+id+desc').then(res => {
    let config = null, del = '';
    for (let index = 0; index < res.messages.length; index++) {
      const element = res.messages[index];
      if (element.number === 'Config' && config == null) {
        config = element;
      } else if (element.number === 'Config') {
        del = del + element.id + ';';
      }
      console.log(element);
    }
    console.log(del);
    if (del.length > 1) {
      postapi({
        'msg_id': del,
        'notCallback': 'true',
        'goformId': 'DELETE_SMS'
      }).then(res => {
        if (res.result === "success") {
          console.log('成功删除');
          setTimeout(() => {
            init()
          }, 1000);
        } else {
          console.log('删除失败');
        }
      }).catch(error => {
        console.log('请求失败');
      });
    } else {
      console.log('无需删除');
      get_data(config);
    }
  });
}
function get_data(config) {
  try {
    if (config == null) throw new Error('内容为空');
    const text = hexToAscii(config.content);
    const obj = JSON.parse(text);
    info.value = obj;
    info.value.id = config.id;
    ruleForm.api_url = info.value.api_url;
    ruleForm.http_type = info.value.http_type;
    ruleForm.http_head = info.value.http_head;
    ruleForm.http_body = info.value.http_body;
    ruleForm.js_code = info.value.js_code;
    console.log(info.value);
    load_switch.value = false;
  } catch (error) {
    console.log('解析错误,请刷新页面试试');
    ruleForm.api_url = '';
    ruleForm.http_type = 'POST';
    ruleForm.http_head = '';
    ruleForm.http_body = '';
    ruleForm.js_code = '';
    load_switch.value = false;
  }
}
function isURL(str) {
  // 匹配URL的正则表达式
  var pattern = new RegExp('^(https?:\\/\\/)?' +
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
    '((\\d{1,3}\\.){3}\\d{1,3}))' +
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
    '(\\?[;&amp;a-z\\d%_.~+=-]*)?' +
    '(\\#[-a-z\\d_]*)?$', 'i');
  return pattern.test(str);
}
function save() {
  //考虑使用短信进行保存配置
  if (!isURL(ruleForm.api_url)) {
    return message("请确认API的URL是否正确", { type: "error" });
  }
  if (ruleForm.js_code.length > 0 && !ruleForm.js_code.includes("table=")) {
    return message("请将结果赋值给table，提交前请压缩代码", { type: "error" });
  }
  const sms_time = convertToTimeString();
  load_switch.value = true;
  const jsonString = JSON.stringify(ruleForm);
  const compressedData = jsonString.replace(/\s/g, '');
  postapi({
    'Index': '-1',
    'sms_time': sms_time,
    'draft_group_id': '',
    'notCallback': 'true',
    'goformId': 'SAVE_SMS',
    'SMSNumber': 'Config;',
    'encode_type': 'UNICODE',
    'SMSMessage': asciiToHex(compressedData),
  }).then(res => {
    if (res.result == "success") {
      setTimeout(() => {
        init();//重新初始化获取数据
      }, 1000);
      message("保存成功", { type: "success" });
    } else {
      message("保存失败", { type: "error" });
      load_switch.value = false;
    }
  }).catch(error => {
    message("请求失败", { type: "error" });
    load_switch.value = false;
  });
}
function test() {
  try {
    load_switch.value = true;
    httpapi(ruleForm.http_type, ruleForm.api_url, ruleForm.http_head, ruleForm.http_body).then(res => {
      console.log(res);
      http_res.value = res;
      load_switch.value = false;
      //对响应内容进行解析
      try {
        let table = '';
        eval(ruleForm.js_code + "\n function Data2Auto(size,inputUnit='B',outputUnit){const units={B:1,KB:1024,MB:1024*1024,GB:1024*1024*1024,TB:1024*1024*1024*1024,};if(!(inputUnit in units)){console.log('Invalid input unit.');return}let outputFactor=1;if(!outputUnit||!(outputUnit in units)){const keys=Object.keys(units);const index=keys.indexOf(inputUnit);if(index!==-1&&index<keys.length-1){outputUnit=keys[index+1];outputFactor=units[outputUnit]}else{console.log('Invalid output unit.');return}}else{outputFactor=units[outputUnit]}const convertedSize=(size*units[inputUnit])/outputFactor;return convertedSize.toFixed(2)+' '+outputUnit}");
        table_list.value = table;
        console.log(table, ruleForm.js_code);
      } catch (error) {
        table_list.value = [{ name: '解析失败', data: error }];
      }
    }).catch(error => {
      console.log(error);
      load_switch.value = false;
      message("请求失败，请检查是否跨域", { type: "error" });
    });
  } catch (error) {
    console.log(error);
    load_switch.value = false;
    const err = error.message.split(": ");
    message(err[0], { type: "error" });
  }
}
</script>
<template>
  <div>
    <el-row :gutter="24">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16" class="mb-[5px]" v-motion :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }">
        <el-card shadow="never" v-loading="load_switch">
          <template #header>
            <TypeIt :className="'type-it1'" :values="['三方API设置']" :cursor="false" :speed="60" />
          </template>
          <template #default>
            <el-form :model="ruleForm" status-icon label-width="120px" class="demo-ruleForm" label-position="left">
              <el-form-item label="API接口" prop="api_url">
                <el-input id="api_url" v-model.number="ruleForm.api_url" placeholder="请输入http接口" />
              </el-form-item>
              <el-form-item label="请求方式" prop="http_type">
                <el-select v-model="ruleForm.http_type" :fit-input-width="true" style="width: 100%;">
                  <el-option label="GET" value="GET" />
                  <el-option label="PUT" value="PUT" />
                  <el-option label="POST" value="POST" />
                  <el-option label="DELETE" value="DELETE" />
                </el-select>
              </el-form-item>
              <el-form-item label="请求头" prop="http_head">
                <el-input v-model="ruleForm.http_head" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea"
                  placeholder="请输入请求头，仅支持a:b<换行>c:d的格式" />
              </el-form-item>
              <el-form-item label="请求体" prop="http_body">
                <el-input v-model="ruleForm.http_body" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea"
                  placeholder="请输入请求体，如果是json就提交json，其他就是按照原样提交" />
              </el-form-item>
              <el-form-item label="js内容解析代码" style="margin-top: 20px;margin-bottom: -20px;">
                <el-input v-model="ruleForm.js_code" :autosize="{ minRows: 4, maxRows: 8 }" type="textarea"
                  placeholder="请输入js代码对内容进行解析成一个数组然后赋值给table，如：table=[{name:'流量',data:JSON.stringify(res)}]" />
              </el-form-item>
              <el-button style="visibility: hidden;"></el-button>
              <el-form-item class="form-buttons">
                <el-button type="primary" @click="save">保存</el-button>
                <el-button type="success" @click="test">测试</el-button>
              </el-form-item>
            </el-form>
          </template>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8" class="mb-[5px]" v-motion :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }">
        <el-card shadow="never">
          <template #header>
            <TypeIt :className="'type-it2'" :values="['响应内容']" :cursor="false" :speed="60" />
          </template>
          <template #default>
            <el-collapse v-model="activeNames" @change="handleChange">
              <el-collapse-item title="解析内容" name="1">
                <div>
                  <el-table :data="table_list" style="width: 100%">
                    <el-table-column prop="name" label="项目" />
                    <el-table-column prop="data" label="值" />
                  </el-table>
                </div>
              </el-collapse-item>
              <el-collapse-item title="原始内容" name="2">
                <div>
                  <el-text class="mx-1">{{ http_res }}</el-text>
                </div>
              </el-collapse-item>
              <el-collapse-item title="支持的函数" name="3">
                <div>
                  <el-text class="mx-1"><b>Data2Auto(number,string)</b>：流量自适应转换，如：Data2Auto(1200,'KB')则输出1.17 MB</el-text>
                </div>
              </el-collapse-item>
            </el-collapse>
          </template>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>