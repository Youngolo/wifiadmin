<script setup lang="ts">
import { ref, computed, watch, watchEffect, type Ref } from "vue";
import { useAppStoreHook } from "@/store/modules/app";
import {
  delay,
  useDark,
  useECharts,
  type EchartOptions
} from "@pureadmin/utils";
import { formatBytes, convertToBytes } from "./fun";

const { isDark } = useDark();

const theme: EchartOptions["theme"] = computed(() => {
  return isDark.value ? "dark" : "light";
});

const pieChartRef = ref<HTMLDivElement | null>(null);
const { setOptions, getInstance, resize } = useECharts(
  pieChartRef as Ref<HTMLDivElement>,
  { theme }
);

const props = defineProps<{
  unit: string,//方式
  size: string,//套餐值
  percent: string,//到达百分比提醒
  Enable: string,//是否启用
  Used: string,//已使用流量
  Used_time: string//使用时间
}>();

setOptions(
  {
    tooltip: {
      trigger: "item"
    },
    legend: {
      icon: "circle",
      //@ts-expect-error
      right: true
    },
    series: [
      {
        name: "流量统计",
        type: "pie",
        top: "20%",
        radius: "80%",
        center: ["50%", "50%"],
        color: ["#e6a23c", "#53a7ff", "#f56c6c"],
        data: [
          { value: 0, name: "已使用" },
          { value: 0, name: "未使用" },
          { value: 0, name: "提醒值" }
        ],
        emphasis: {//阴影
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        }
      }
    ]
  },
  {
    name: "click",
    callback: params => {
      console.log("click", params);
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
watchEffect(() => {
  let reminderValue, tx_percent, no_used, y_used;
  let { unit, size, percent, Enable, Used, Used_time } = props;
  if (Enable == '0') {
    return;
  }
  if (unit == 'data') {
    y_used = Used;
    size = convertToBytes(size).toString();
    reminderValue = (parseInt(size) * 0.02).toString();
    tx_percent = (parseInt(size) * (parseInt(percent) / 100)).toString();
    no_used = parseInt(size) - parseInt(y_used);// - parseInt(tx_percent);
  } else {
    y_used = parseInt(Used_time) / 3600;
    reminderValue = (parseInt(size) * 0.02).toString();
    tx_percent = (parseInt(size) * (parseInt(percent) / 100)).toString();
    no_used = parseInt(size) - parseInt(y_used);// - parseInt(tx_percent);
  }
  // console.log(unit, size, percent, Enable, Used, Used_time);
  // 更新图表
  const chartInstance = getInstance();
  // 更新图表的配置
  const options = {
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        // console.log(params);
        var tooltip = `${params.name}`;
        if (unit == 'data') {
          if (params.name === "提醒值") {
            tooltip += `<div style="display: flex; align-items: center;"><div style="width: 10px; height: 10px; background-color: ${params.color}; border-radius: 50%; margin-right: 5px;"></div>`;
            tooltip += `${formatBytes(tx_percent)} (${percent}%)`;
          } else {
            tooltip += `<div style="display: flex; align-items: center;"><div style="width: 10px; height: 10px; background-color: ${params.color}; border-radius: 50%; margin-right: 5px;"></div>`;
            tooltip += `${formatBytes(params.value)} (${params.percent}%)`;
          }
        } else {
          if (params.name === "提醒值") {
            tooltip += `<div style="display: flex; align-items: center;"><div style="width: 10px; height: 10px; background-color: ${params.color}; border-radius: 50%; margin-right: 5px;"></div>`;
            try {
              tooltip += `${parseInt(tx_percent).toFixed(2)}h (${percent}%)`;
            } catch (error) {
              tooltip += `${tx_percent}h (${percent}%)`;
            }
          } else {
            tooltip += `<div style="display: flex; align-items: center;"><div style="width: 10px; height: 10px; background-color: ${params.color}; border-radius: 50%; margin-right: 5px;"></div>`;
            tooltip += `${params.value.toFixed(2)}h (${params.percent.toFixed(2)}%)`;
          }
        }
        return tooltip;
      }
    }, series: [
      {
        data: [
          { value: y_used, name: "已使用" },
          { value: no_used, name: "未使用" },
          { value: reminderValue, name: "提醒值" }
        ]
      }
    ]
  };
  // 通过图表实例的 setOption 方法更新图表配置
  if (chartInstance) {
    chartInstance.setOption(options);
  }
});
</script>

<template>
  <div ref="pieChartRef" style="width: 100%; height: 35vh" />
</template>
