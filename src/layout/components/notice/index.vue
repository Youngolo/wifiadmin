<script setup lang="ts">
import { useStore } from 'vuex';
// import { noticesData } from "./data";
import NoticeList from "./noticeList.vue";
import Bell from "@iconify-icons/ep/bell";
import { message } from "@/utils/message";
import { ElMessageBox } from 'element-plus';
import { ref, onMounted, watchEffect } from "vue";
import { formatDataSize, convertToBytes } from "@/views/welcome/components/fun";
import { getmsglist, getapi, setnet, hexToAscii, convertToDateTime, postapi } from "@/api/user";

const noticesNum = ref(0);
const notices = ref([{
  key: "1",
  name: "短信",
  list: []
}, {
  key: "2",
  name: "通知",
  list: []
}]);
const activeKey = ref();
const store = useStore();
// notices.value.map(v => (noticesNum.value += v.list.length));//自动计算通知条数
onMounted(() => {
  getmsglist().then(data => {
    // console.log(data);
    if (data.code == 200) {
      notices.value = data.info;
      activeKey.value = data.info[0].key;
      // notices.value.map(v => (noticesNum.value += v.list.length));//自动计算通知条数
    }
  }).catch(error => {
    notices.value = [{
      key: "1",
      name: "短信",
      list: []
    }, {
      key: "2",
      name: "通知",
      list: []
    }];
    console.log('请求失败');
  });
  //获取设备流量信息
  getapi('cmd=data_volume_alert_percent%2Cdata_volume_limit_size%2Cdata_volume_limit_unit%2Cmonthly_tx_bytes%2Cmonthly_rx_bytes%2Cmonthly_time%2Cppp_status&multi_data=1', true).then(data => {
    let zong, yz, yy;
    if (data.data_volume_limit_unit == 'data') {
      const size = formatDataSize(data.data_volume_limit_size);//总流量
      zong = convertToBytes(size);//总流量
      yz = zong * (data.data_volume_alert_percent / 100);//阈值
      yy = parseInt(data.monthly_tx_bytes) + parseInt(data.monthly_rx_bytes);//已用
    } else {
      zong = data.data_volume_limit_size;//总时间
      yy = (data.monthly_time / 3600).toFixed(2);
      yz = zong * (data.data_volume_alert_percent / 100);//阈值
    }
    // console.log('流量信息：', data, zong, yy, yz);
    if (yy >= yz && data.data_volume_alert_percent > 0 && data.ppp_status == 'ppp_connected') {
      ElMessageBox.confirm(
        `您的流量/时间已经达到 ${data.data_volume_alert_percent}%，要断开网络连接吗？`,
        {
          confirmButtonText: '断开网络',
          cancelButtonText: '不用',
          type: 'warning',
        }
      ).then(() => {
        // console.log('关闭网络');
        setnet('DISCONNECT_NETWORK').then(res => {
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
      }).catch(() => {
        // console.log('取消');
      })
    }
  })
});
//监听短信
watchEffect(() => {
  if (store.state.Messages && store.state.Messages.length > 0 && store.state.Messages[0].id != '') {
    try {
      let info = notices.value;
      if (info.length > 0) {
        let msg_list = [];
        const msg = store.state.Messages;
        //记录相同的草稿
        const seenCombinations = {};
        const idsToDelete = [];
        for (let index = 0; index < msg.length; index++) {
          const element = msg[index];
          element.date = convertToDateTime(element.date);
          element.content = hexToAscii(element.content);
          if (element.tag == '1') {
            msg_list.push({
              "extra": "未读",
              "status": "warning",
              datetime: element.date,
              description: element.content,
              title: '收到[' + element.number + ']的短信',
              "fun": "page",
              "query": "sms"
            });
          }
          if (element.number != 'Config' && element.tag == '4') {
            //下面是准备删除多余的草稿
            const combination = element.number + '-' + element.tag;
            if (!seenCombinations[combination]) {
              seenCombinations[combination] = {
                id: element.id,
                date: element.date
              };
            } else {
              if (element.date > seenCombinations[combination].date) {
                idsToDelete.push(seenCombinations[combination].id);
                seenCombinations[combination].id = element.id;
                seenCombinations[combination].date = element.date;
              } else {
                idsToDelete.push(element.id);
              }
            }
          }
          // console.log(element);
        }
        //准备删除重复的短信
        if (idsToDelete.length > 0) {
          const result = idsToDelete.join(';');
          console.log(result);
          performAsyncOperation(result)
        }
        // 查找目标位置，假设在 jsonArray1 中找到 "name" 为 "消息" 的对象
        const targetObj = info.find(obj => obj.name === "短信");
        // 将 jsonArray2 插入到目标位置的 "list" 数组中
        targetObj.list = msg_list;
        noticesNum.value = msg_list.length + notices.value[notices.value.length - 1].list.length;
      }
    } catch (error) {
      console.error(error);
    }
  }
});
// 异步删除
async function performAsyncOperation(result) {
  try {
    const res = await postapi({
      'msg_id': result,
      'notCallback': 'true',
      'goformId': 'DELETE_SMS'
    });
    if (res.result === "success") {
      console.log('成功删除');
    } else {
      console.log('删除失败');
    }
  } catch (error) {
    console.log('请求失败');
  }
}
</script>

<template>
  <el-dropdown trigger="click" placement="bottom-end">
    <span class="dropdown-badge navbar-bg-hover select-none">
      <el-badge :value="noticesNum" :max="99">
        <span class="header-notice-icon">
          <IconifyIconOffline :icon="Bell" />
        </span>
      </el-badge>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-tabs :stretch="true" v-model="activeKey" class="dropdown-tabs"
          :style="{ width: notices.length === 0 ? '200px' : '330px' }">
          <el-empty v-if="notices.length === 0" description="暂无消息" :image-size="60" />
          <span v-else>
            <template v-for="item in notices" :key="item.key">
              <el-tab-pane :label="`${item.name}(${item.list.length})`" :name="`${item.key}`">
                <el-scrollbar max-height="330px">
                  <div class="noticeList-container">
                    <NoticeList :list="item.list" />
                  </div>
                </el-scrollbar>
              </el-tab-pane>
            </template>
          </span>
        </el-tabs>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style lang="scss" scoped>
.dropdown-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 48px;
  margin-right: 10px;
  cursor: pointer;

  .header-notice-icon {
    font-size: 18px;
  }
}

.dropdown-tabs {
  .noticeList-container {
    padding: 15px 24px 0;
  }

  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav-wrap)::after {
    height: 1px;
  }

  :deep(.el-tabs__nav-wrap) {
    padding: 0 36px;
  }
}
</style>
