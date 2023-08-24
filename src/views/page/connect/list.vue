<script setup lang="ts">
import TypeIt from "@/components/ReTypeit";
import { getapi } from "@/api/user";
import { ref, onMounted } from 'vue';

defineOptions({
  name: "connect"
});

let tableData = ref();
let loading = ref(true);//默认加载中
onMounted(() => {
  //获取连接列表
  getapi('cmd=station_list', true).then(res => {
    loading.value = false;
    // console.log(res.station_list);
    tableData.value = res.station_list;
  })
});

const handleClick = () => {
  console.log('好像没这功能')
}
</script>

<template>
  <div>
    <el-row :gutter="24">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb-[5px]" v-motion :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }">
        <el-card shadow="never" v-loading="loading">
          <template #header>
            <TypeIt :className="'type-it1'" :values="['WIFI连接列表']" :cursor="false" :speed="60" />
          </template>
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="ip_addr" label="IP地址"/>
            <el-table-column prop="timestamp" label="时间" width="180" />
            <el-table-column prop="hostname" label="主机名" default-value="未知"/>
            <el-table-column prop="mac_addr" label="Mac地址"/>
            <el-table-column prop="duration" label="时长" width="120" />
            <el-table-column prop="rx" label="接收" width="120" />
            <el-table-column prop="tx" label="发送" width="120" />
            <!-- <el-table-column fixed="right" label="操作" width="60">
              <template #default>
                <el-button link type="primary" size="small" @click="handleClick">屏蔽</el-button>
              </template>
            </el-table-column> -->
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
