<template>
  <div class="chart-box" ref="chartRef"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';

const chartRef = ref(null);
let myChart = null;

onMounted(() => {
  myChart = echarts.init(chartRef.value);
  const option = {
    grid: { top: 30, right: 20, bottom: 30, left: 40 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLabel: { color: '#fff' } // 字体颜色适配深色背景
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#fff' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    series: [
      {
        data: [120, 200, 150, 80, 70, 110, 130],
        type: 'bar',
        itemStyle: { color: '#00d4ff' } // 柱状图颜色
      }
    ]
  };
  myChart.setOption(option);

  // 监听窗口大小变化，重绘图表（注意：外层容器缩放时，ECharts内部也需要感知）
  window.addEventListener('resize', () => myChart && myChart.resize());
});

onUnmounted(() => {
  if (myChart) myChart.dispose();
});
</script>

<style scoped>
.chart-box {
  width: 100%;
  height: 100%;
}
</style>
