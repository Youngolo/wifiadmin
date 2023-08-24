<template>
  <el-config-provider :locale="currentLocale">
    <router-view />
    <ReDialog />
  </el-config-provider>
</template>

<script lang="ts">
import { inject, defineComponent } from "vue";
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/lib/locale/lang/zh-cn";
import { ReDialog } from "@/components/ReDialog";
import { islogin, refreshTokenApi } from "@/api/user";
import { type DataInfo, setToken } from "@/utils/auth";
import { storageSession } from "@pureadmin/utils";
export default defineComponent({
  name: "app",
  components: {
    [ElConfigProvider.name]: ElConfigProvider,
    ReDialog
  },
  computed: {
    currentLocale() {
      return zhCn;
    }
  },
  data() {
    return {
      timer: null, // 计时器实例
    };
  },
  mounted() {
    // 页面加载时执行的操作
    const startTimer = inject('startTimer');
    const roles = storageSession().getItem<DataInfo<number>>("user-info")?.roles ?? [];
    if (roles.length <= 0) {
      islogin().then(data => {
        console.log(data);
        if (data.loginfo == 'ok') {
          if (typeof startTimer === 'function') {
            startTimer();
          }
          setTimeout(() => {
            //设置登录状态
            console.log('已登录，自动跳转');
            setToken(refreshTokenApi());
            location.reload();
          }, 1000); // 延迟1秒启动计时器
        }
      })
    } else {
      //如果是已登录
      if (typeof startTimer === 'function') {
        startTimer();
      }
    }
  },
});
</script>
