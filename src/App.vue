<template>
  <div id="app">
    <!-- 路由视图：渲染当前页面（Home/Game/Login 等） -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 这里暂时不需要写逻辑，路由和状态都由子页面管理
</script>

<style>
/* 全局样式重置，避免浏览器默认样式影响 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
}

#app {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
