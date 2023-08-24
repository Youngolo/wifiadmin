<script setup lang="ts">
//下面是监听全局变量
import { ref, reactive } from 'vue';
import { postapi } from "@/api/user";
import { message } from "@/utils/message";
import TypeIt from "@/components/ReTypeit";

defineOptions({
  name: "AT"
});
const activeNames = ref(['1']);
let loading = ref(false);//默认加载中
//表单字段定义
const ruleForm = reactive({
  cmd: '',//命令
  result: ''//回复内容
})
function submitForm() {
  loading.value = true;
  if (ruleForm.cmd.length <= 0) {
    message("请输入AT命令", { type: "error" });
  }
  const regex = /AT/;
  if (!regex.test(ruleForm.cmd)) {
    message("AT指令可能不正确", { type: "error" });
  }
  postapi({
    'at_cmd': ruleForm.cmd,
    'goformId': 'EXECUTE_AT_COMMAND'
  }).then(res => {
    loading.value = false;
    ruleForm.result += res.result;
    message("执行成功", { type: "success" });
  }).catch(error => {
    loading.value = false;
    message("请求失败", { type: "error" });
  });
}
</script>

<template>
  <div>
    <el-row :gutter="24">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16" class="mb-[5px]" v-motion :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }">
        <el-card shadow="never" v-loading="loading">
          <template #header>
            <TypeIt :className="'type-it1'" :values="['AT命令']" :cursor="false" :speed="60" />
          </template>
          <template #default>
            <div class="form-container">
              <el-form ref="ruleFormRef" :model="ruleForm" status-icon class="demo-ruleForm" label-position="left">
                <el-form-item label="AT命令" prop="cmd">
                  <el-input v-model="ruleForm.cmd" type="text" autocomplete="off" style="width: calc(100% - 70px);" />
                  <el-button style="margin-left: 10px;width: 50px;" type="primary" @click="submitForm()">应用</el-button>
                </el-form-item>
                <el-form-item label="回复内容" prop="result">
                  <el-input v-model="ruleForm.result" :autosize="{ minRows: 19, maxRows: 200 }" type="textarea"
                    disabled />
                </el-form-item>
                <el-form-item class="form-buttons">
                  <el-button type="warning" @click="ruleForm.result = ''">清空</el-button>
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
              <el-collapse-item title="常用AT指令" name="1">
                <b>AT</b>： 测试设备是否处于响应状态。<br>
                <b>AT+CGMI</b>： 查询设备制造商信息。<br>
                <b>AT+CGSN</b>： 查询设备序列号（IMEI）。<br>
                <b>AT+CSQ</b>： 查询信号强度。<br>
                <b>AT+CGATT</b>： 查询附着（Attach）状态。<br>
                <b>AT+CGACT</b>： 激活或断开移动数据连接。<br>
                <b>AT+COPS</b>： 查询或设置网络运营商。<br>
                <b>AT+CGDCONT</b>： 查询或设置数据连接配置。<br>
                <b>AT+CGPADDR</b>： 查询当前的 IP 地址。<br>
                <b>AT+HTTPGET</b>： 发起 HTTP GET 请求。<br>
                <b>AT+HTTPPOST</b>： 发起 HTTP POST 请求。<br>
              </el-collapse-item>
              <el-collapse-item title="常见AT错误代码" name="2">
                <b>CME ERROR:</b><br>
                CME ERROR: 0 - 操作成功完成<br>
                CME ERROR: 3 - 与设备通信超时<br>
                CME ERROR: 6 - 不支持的操作<br>
                CME ERROR: 10 - SIM 卡不可用<br>
                CME ERROR: 13 - SIM 卡未找到<br>
                CME ERROR: 16 - 网络拒绝<br>
                CME ERROR: 22 - 不正确的参数<br>
                CME ERROR: 27 - 内存短缺<br>
                CME ERROR: 30 - SIM 卡被锁定<br>
                CME ERROR: 42 - 不支持的 SIM 卡<br>
                CME ERROR: 100 - 未指定错误<br>

                <b>CMS ERROR:</b><br>
                CMS ERROR: 300 - ME 处理 SIM 卡失败<br>
                CMS ERROR: 302 - ME SIM 错误<br>
                CMS ERROR: 310 - SIM 卡未插入<br>
                CMS ERROR: 313 - SIM 卡锁定<br>
                CMS ERROR: 316 - SIM 卡错误<br>
                CMS ERROR: 321 - SIM 卡拒绝<br>
                CMS ERROR: 500 - ME 不支持该功能<br>
                CMS ERROR: 515 - ME 内存短缺<br>
                CMS ERROR: 517 - ME 不正确的参数<br>
                CMS ERROR: 600 - ME 未知错误<br>
              </el-collapse-item>
              <el-collapse-item title="温馨提示" name="3">
                输入错误的AT指令可能导致设备一直重启，断电重新插拔就恢复了。
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