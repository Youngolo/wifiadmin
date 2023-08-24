<script setup lang="ts">
import { ref, computed, watch, type Ref } from "vue";
import { useAppStoreHook } from "@/store/modules/app";
import {
  delay,
  useDark,
  useECharts,
  type EchartOptions
} from "@pureadmin/utils";

const { isDark } = useDark();

const theme: EchartOptions["theme"] = computed(() => {
  return isDark.value ? "dark" : "default";
});

const lineChartRef = ref<HTMLDivElement | null>(null);
const { setOptions, getInstance, resize } = useECharts(
  lineChartRef as Ref<HTMLDivElement>,
  { theme }
);

const props = defineProps<{
  up: object,
  down: object,
  time: any[]
}>();

let xData = [];
//初始化图表
setOptions(
  {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      },
      formatter: function (params) {
        var tooltip = params[0].name + "<br>";
        params.forEach(function (item) {
          tooltip += item.seriesName + ": " + item.value + " KB<br>";
        });
        return tooltip;
      }
    },
    grid: {
      bottom: "20px",
      right: "10px"
    },
    legend: {
      //@ts-expect-error
      right: true,
      data: ["上传", "下载"]
    },
    calculable: true,
    animation: true, // 启用动画效果
    animationDuration: 1000, // 动画持续时间为1秒
    animationEasing: 'cubicOut', // 缓动效果为加速减速
    animationDelay: 200, // 动画延迟200毫秒开始
    xAxis: [
      {
        triggerEvent: true,
        type: "category",
        splitLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        data: xData
      }
    ],
    yAxis: [
      {
        triggerEvent: true,
        type: "value",
        splitLine: {
          show: false
        },
        axisLabel: {
          margin: 5 // 设置 y 轴标签的边距
          // rotate: -45
        },
        axisLine: {
          show: true
        }
      }
    ],
    dataZoom: [
      {
        type: "slider",
        show: false,
        realtime: true,
        startValue: 0,
        endValue: 24
      }
    ],
    series: [
      {
        name: "上传",
        type: "line",
        symbolSize: 10,
        symbol: "circle",
        color: "#53a7ff",
        smooth: true, // 将折线图设置为平滑曲线
        markPoint: {
          label: {
            color: "#fff"
          },
          data: [
            {
              type: "max",
              name: "最大值"
            },
            {
              type: "min",
              name: "最小值"
            }
          ]
        },
        data: []
      },
      {
        name: "下载",
        type: "line",
        symbolSize: 10,
        symbol: "circle",
        color: "#f56c6c",
        smooth: true, // 将折线图设置为平滑曲线
        markPoint: {
          label: {
            color: "#fff"
          },
          data: [
            {
              type: "max",
              name: "最大值"
            },
            {
              type: "min",
              name: "最小值"
            }
          ]
        },
        data: []
      }
    ],
    addTooltip: true
  },
  {
    name: "click",
    callback: params => {
      console.log("click", params);
    }
  },
  {
    name: "contextmenu",
    callback: params => {
      console.log("contextmenu", params);
    }
  },
  // 点击空白处
  {
    type: "zrender",
    name: "click",
    callback: params => {
      console.log("点击空白处", params);
    }
  }
);

watch(
  () => useAppStoreHook().getSidebarStatus,
  () => {
    delay(600).then(() => resize());
  }
);

// 监听 变量 的变化
watch([props.time, props.up, props.down], (Newdata) => {
  // 获取图表实例
  const chartInstance = getInstance();
  // console.log(Newdata);
  // 更新图表的配置
  const options = {
    xAxis: [{
      data: Newdata[0]
    }],
    series: [
      {
        data: Newdata[1]
      },
      {
        data: Newdata[2]
      }
    ],
  };
  // 通过图表实例的 setOption 方法更新图表配置
  chartInstance.setOption(options);
});
</script>

<template>
  <div ref="lineChartRef" style="width: 100%; height: 35vh" />
</template>
