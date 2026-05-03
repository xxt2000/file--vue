<template>
  <div class="screen-container" ref="screenRef">
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const screenRef = ref(null);
// 设计稿尺寸，通常是 1920x1080
const designWidth = 1920;
const designHeight = 1080;

const getScale = (width, height) => {
  const ww = window.innerWidth / designWidth;
  const hh = window.innerHeight / designHeight;
  // 保持比例：取宽和高中缩放比例较小的值，保证内容全部显示
   let scale = ww < hh ? ww : hh;
  
  // 2. 乘以一个系数，例如 0.9 (表示缩小到原来的 90%)
  // 您可以修改这个数字，0.9 比较适中，如果还想小可以改成 0.85
  scale = scale * 0.3; 

  return scale;
};

const resize = () => {
  if (screenRef.value) {
    screenRef.value.style.transform = `scale(${getScale()}) translate(-50%, -50%)`;
    // 设置 transform-origin 为左上角，并绝对定位居中
    screenRef.value.style.width = `${designWidth}px`;
    screenRef.value.style.height = `${designHeight}px`;
  }
};

onMounted(() => {
  if (screenRef.value) {
    // 初始化样式
    screenRef.value.style.transformOrigin = 'left top';
    screenRef.value.style.position = 'absolute';
    screenRef.value.style.left = '50%';
    screenRef.value.style.top = '50%';
    screenRef.value.style.transition = 'all 0.3s';
  }
  resize();
  window.addEventListener('resize', resize);
});

onUnmounted(() => {
  window.removeEventListener('resize', resize);
});
</script>

<style scoped>
.screen-container {
  overflow: hidden;
  background-color: #0f0c29; /* 深色背景 */
  /* 可以在这里设置背景图 */
}
.content {
  width: 100%;
  height: 100%;
}
</style>
