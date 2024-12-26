<template>
  <div ref="chart" class="chart" :style="style"></div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, getCurrentInstance } from "vue";
import _ from "lodash";
// import * as echarts from 'echarts' // 全局引用，这么写的话之前配置的按需加载文件就没作用了

// 接收值
const props = defineProps({
  option: {
    type: Object,
    default: () => {},
  },
});

// 定义值
const chart = ref();
let myChart: any = null;
const style = reactive({
  width: "100%",
  height: "100%",
});
const instance = getCurrentInstance();
const echarts = instance?.appContext.config.globalProperties.$echarts;

const echartsResize = () => {
  // myChart.setOption(props.option,true)
  myChart.resize();
};
const resizeHandler = _.debounce(echartsResize, 200);

// 定义加载函数
const initCharts = () => {
  if (chart.value) {
    if (myChart) {
      myChart.dispose();
    }
  }
  myChart = echarts.init(chart.value);
  myChart.on("georoam", function (params) {
    var option = myChart.getOption(); //获得option对象
    if (params.zoom != null && params.zoom != undefined) {
      //捕捉到缩放时
      option.geo[0].zoom = option.series[0].zoom; //下层geo的缩放等级跟着上层的geo一起改变
      option.geo[0].center = option.series[0].center; //下层的geo的中心位置随着上层geo一起改变
    } else {
      //捕捉到拖曳时
      option.geo[0].center = option.series[0].center; //下层的geo的中心位置随着上层geo一起改变
    }
    myChart.setOption(option); //设置option
  });
  myChart.setOption(props.option, true);
  // 当窗口大小改变时候，echarts重置大小
  // myChart.resize();
  window.addEventListener("resize", resizeHandler);
};

// 监听当配置项发生变化的时候，调用加载函数
watch(
  () => props.option,
  (val) => {
    if (Object.keys(val)) {
      nextTick(() => {
        if (!echarts) return;
        initCharts();
      });
    }
  },
  { immediate: true }
);
</script>

<style lang="less" scoped></style>
