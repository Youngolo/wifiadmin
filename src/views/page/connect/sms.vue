<script setup lang="ts">
import { message } from "@/utils/message";
import { postapi, convertToTimeString, asciiToHex, getapi } from "@/api/user";
import { ref, watchEffect, reactive, onMounted } from 'vue';
import { useStore } from 'vuex';
import { tr } from "element-plus/es/locale";

defineOptions({
  name: "sms"
});

const form = reactive({
  text: '',
  number: '',
  content: '',
})
const sms_used = ref(0);
const sms_total = ref(0);
const tableData = ref();
const loading = ref(true);//默认加载中
const store = useStore();
//短信弹窗
const dialogTableVisible = ref(false);
//页面加载
onMounted(() => {
  init()
})
function init() {
  //获取短信信息
  getapi('cmd=sms_capacity_info', true).then(res => {
    // console.log(res, parseInt(res.sms_nv_total));
    sms_total.value = parseInt(res.sms_nv_total);
    sms_used.value = parseInt(res.sms_nv_draftbox_total) + parseInt(res.sms_nv_rev_total) + parseInt(res.sms_nv_send_total);
  });
}
// 监听 signal 变量的变化
watchEffect(() => {
  if (store.state.Messages && store.state.Messages.length > 0 && store.state.Messages[0].id != '' && !store.state.Messages[0].date.includes(";")) {
    init()
    let msg = [];
    for (let index = 0; index < store.state.Messages.length; index++) {
      const element = store.state.Messages[index];
      if (element.number != 'Config') {
        msg.push({
          id: element.id,
          tag: element.tag,
          content: element.content,
          date: element.date,
          number: element.number,
        })
      }
    }
    tableData.value = msg;
    // console.log(tableData.value);
    loading.value = false;
  }
});
function delete_sms(e) {
  loading.value = true;
  postapi({
    'msg_id': e.id + ';',
    'notCallback': 'true',
    'goformId': 'DELETE_SMS'
  }).then(res => {
    if (res.result === "success") {
      loading.value = false;
      message("删除成功", { type: "success" });
    } else {
      loading.value = false;
      message("删除失败", { type: "error" });
    }
  }).catch(error => {
    loading.value = false;
    message("请求失败", { type: "error" });
  });
}
function show(e) {
  form.number = e.number;
  if (e.tag == '4') {
    form.text = '';
    form.content = e.content;
  } else {
    form.content = '';
    form.text = e.content;
  }
  //设置已读
  if (e.tag == '1') {
    postapi({
      'tag': '0',
      'msg_id': e.id + ';',
      'goformId': 'SET_MSG_READ'
    }).then(res => {
      if (res.result === "success") {
        console.log('成功设置已读');
      } else {
        console.log('已读失败');
      }
    }).catch(error => {
      console.log('请求失败');
    });
  }
  dialogTableVisible.value = true;
}
//弹窗关闭，保存草稿
function handleClose() {
  console.log(form);
  if (form.content.length > 0 && form.number.length > 3) {
    dialogTableVisible.value = false;
    loading.value = true;
    postapi({
      'Index': '-1',
      'draft_group_id': '',
      'notCallback': 'true',
      'goformId': 'SAVE_SMS',
      'SMSNumber': form.number,
      'encode_type': 'GSM7_default',
      'sms_time': convertToTimeString(),
      'SMSMessage': asciiToHex(form.content),
    }).then(res => {
      if (res.result === "success") {
        loading.value = false;
        message("保存草稿成功", { type: "success" });
      } else {
        loading.value = false;
        message("保存草稿失败", { type: "error" });
      }
    }).catch(error => {
      loading.value = false;
      message("请求失败", { type: "error" });
    });
  }
  form.text = '';
  form.number = '';
  form.content = '';
}
function send_sms() {
  console.log(form);
  if (form.number.length <= 3) {
    return message("请输入正确的号码", { type: "error" });
  }
  if (form.content.length <= 0) {
    return message("请输入正确的短信内容", { type: "error" });
  }
  if (form.content.length > 0) {
    loading.value = true;
    postapi({
      'ID': '-1',
      'notCallback': 'true',
      'goformId': 'SEND_SMS',
      'SMSNumber': form.number,
      'encode_type': 'GSM7_default',
      'sms_time': convertToTimeString(),
      'SMSMessage': asciiToHex(form.content),
    }).then(res => {
      if (res.result === "success") {
        loading.value = false;
        message("短信发送成功", { type: "success" });
      } else {
        loading.value = false;
        message("短信发送失败", { type: "error" });
      }
    }).catch(error => {
      loading.value = false;
      message("请求失败", { type: "error" });
    });
  }
}
</script>

<template>
  <div>
    <el-row :gutter="24">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb-[5px]" v-motion :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }">
        <el-card shadow="never" v-loading="loading">
          <template #header>
            <div class="card-header">
              <div class="type-it-container">
                短信列表({{ sms_used }}/{{ sms_total }})
              </div>
              <div class="button-container">
                <el-button plain @click="dialogTableVisible = true">发送短信</el-button>
              </div>
            </div>
          </template>
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="id" label="id" width="50" />
            <el-table-column prop="number" label="号码" width="160" show-overflow-tooltip />
            <el-table-column prop="tag" label="类型" width="80">
              <template #default="scope">
                <el-tag class="ml-2" v-if="scope.row.tag == '0'">接收</el-tag>
                <el-tag class="ml-2" v-if="scope.row.tag == '1'" type="success">未读</el-tag>
                <el-tag class="ml-2" v-if="scope.row.tag == '2'" type="warning">发送</el-tag>
                <el-tag class="ml-2" v-if="scope.row.tag == '4'" type="info">草稿</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="内容" show-overflow-tooltip />
            <el-table-column prop="date" label="时间" width="160" />
            <el-table-column fixed="right" label="操作" width="150">
              <template #default="scope">
                <el-button link type="success" size="small" @click="show(scope.row)">查看/发送</el-button>
                <el-button link type="danger" size="small" @click="delete_sms(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog id="YoungTable" v-model="dialogTableVisible" title="短信详细" @close="handleClose" align-center>
      <el-form :model="form" status-icon class="demo-ruleForm" label-position="left">
        <el-form-item label="号码">
          <el-input v-model="form.number" type="number" autocomplete="off" />
        </el-form-item>
        <el-input v-model="form.text" :autosize="{ minRows: 4, maxRows: 8 }" type="textarea" disabled />
        <el-form-item label="短信内容" style="margin-top: 20px;margin-bottom: -20px;">
          <el-input v-model="form.content" :autosize="{ minRows: 4, maxRows: 8 }" type="textarea" maxlength="765"
            show-word-limit placeholder="请输入要发送的内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogTableVisible = false">关闭</el-button>
          <el-button type="primary" @click="send_sms">
            发送
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style>
#YoungTable {
  /* 默认宽度为 50% */
  width: 50%;
}

/* 在手机上应用不同的宽度 */
@media (max-width: 767px) {
  #YoungTable {
    width: 80%;
  }
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-card__header-button {
  margin-left: auto;
}

.button-container {
  height: 0px;
  margin-top: -30px;
}
</style>