<template>
  <ScreenContainer>
    <!-- 1. 整体入场动画：只在加载时播放一次 -->
    <div class="big-screen-layout entry-animation">
      
      <!-- 头部 -->
      <header class="header">
        <h1>数据可视化大屏系统 <span class="live-dot"></span></h1>
      </header>

      <!-- 内容主体 -->
      <main class="main-content">
        <!-- 左侧区域 -->
        <section class="column left">
          <div class="panel">
            <h3>实时流量监控</h3>
            <BarChart />
          </div>
          <div class="panel">
            <h3>用户增长趋势</h3>
            <BarChart />
          </div>
        </section>

        <!-- 中间区域 -->
        <section class="column center">
          <div class="center-panel">
            <h2>核心转化率</h2>
            <!-- 数字滚动动画 -->
            <div class="number" ref="numberRef">0</div>
            <div class="unit">%</div>
          </div>
        </section>

        <!-- 右侧区域 -->
        <section class="column right">
          <div class="panel">
            <h3>设备分布统计</h3>
            <BarChart />
          </div>
          <div class="panel">
            <h3>系统负载状态</h3>
            <BarChart />
          </div>
        </section>
      </main>
    </div>
  </ScreenContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ScreenContainer from '@/components/ScreenContainer.vue';
import BarChart from '@/components/charts/BarChart.vue';

// 数字滚动逻辑 (只执行一次)
const numberRef = ref(null);
const targetNumber = 98.5;

const animateNumber = () => {
  const element = numberRef.value;
  if (!element) return;
  
  let startTimestamp = null;
  const duration = 2000; // 持续时间 2秒

  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    
    // 缓动算法
    const easeOutQuad = 1 - (1 - progress) * (1 - progress);
    
    const currentNum = (easeOutQuad * targetNumber).toFixed(1);
    element.innerText = currentNum;

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.innerText = targetNumber;
    }
  };

  window.requestAnimationFrame(step);
};

onMounted(() => {
  animateNumber();
});
</script>

<style scoped>
/* --- 基础布局 --- */
.big-screen-layout {
  width: 1920px;
  height: 1080px;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  color: #fff;
  /* 深空蓝渐变背景 */
  background: radial-gradient(circle at center, #1b2735 0%, #090a0f 100%);
  overflow: hidden;
}

.header {
  height: 80px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 建议使用切图，这里用CSS模拟一个简单的底部线条 */
  border-bottom: 2px solid rgba(0, 212, 255, 0.3);
  box-shadow: 0 5px 15px rgba(0, 212, 255, 0.1);
  position: relative;
  background: rgba(0, 0, 0, 0.2);
}

.header h1 {
  font-size: 32px;
  letter-spacing: 4px;
  text-shadow: 0 0 10px #00d4ff;
  font-weight: bold;
}

/* 头部状态点：保持呼吸灯效果，因为这是状态指示，通常需要循环 */
.live-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: #ff4d4f;
  border-radius: 50%;
  margin-left: 15px;
  box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7);
  animation: pulse-red 2s infinite;
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.column {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.left, .right { width: 25%; }
.center { width: 48%; display: flex; align-items: center; justify-content: center; }


/* --- 动画与样式 (已优化为非循环) --- */

/* 1. 整体入场动画 (只播放一次) */
.entry-animation {
  animation: zoomInFade 1s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
  opacity: 0; /* 初始隐藏 */
}

@keyframes zoomInFade {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 2. 静态科技感面板 (移除了流光循环动画) */
.panel {
  height: 48%;
  background: rgba(0, 20, 40, 0.6);
  position: relative;
  padding: 15px;
  box-sizing: border-box;
  /* 静态边框：使用 box-shadow 模拟发光，不使用伪元素动画 */
  border: 1px solid rgba(0, 212, 255, 0.3);
  box-shadow: inset 0 0 15px rgba(0, 212, 255, 0.05);
  /* 添加切角效果 (可选) */
  clip-path: polygon(
    0 0, 
    100% 0, 
    100% calc(100% - 20px), 
    calc(100% - 20px) 100%, 
    0 100%
  );
}

/* 面板标题 */
.panel h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #00d4ff;
  border-left: 4px solid #00d4ff;
  padding-left: 10px;
  text-shadow: 0 0 5px rgba(0, 212, 255, 0.5);
}

/* 3. 中间核心数字面板 (移除了旋转虚线) */
.center-panel {
  width: 100%;
  height: 100%;
  border: 2px solid rgba(0, 212, 255, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  /* 静态内发光 */
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.15) inset;
  position: relative;
  /* 简单的装饰性边角 */
}

.center-panel::before, .center-panel::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #00d4ff;
  transition: all 0.5s;
}
.center-panel::before { top: -2px; left: -2px; border-right: none; border-bottom: none; }
.center-panel::after { bottom: -2px; right: -2px; border-left: none; border-top: none; }

.number {
  font-size: 100px;
  font-weight: bold;
  font-family: 'Courier New', Courier, monospace;
  background: linear-gradient(to bottom, #fff, #00d4ff);
  -webkit-background-clip: text;
  color: transparent;
  /* 静态文字发光 */
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
  z-index: 2;
}

.unit {
  font-size: 24px;
  color: #00d4ff;
  margin-top: -10px;
  margin-bottom: 20px;
  letter-spacing: 2px;
}

/* 红色呼吸灯 (保留，因为这是状态指示) */
@keyframes pulse-red {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 77, 79, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0); }
}
</style>