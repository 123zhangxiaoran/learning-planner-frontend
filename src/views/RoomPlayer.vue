<template>
  <div>
    <!-- 直接展示数据 -->
    <p>欢迎：{{ playerStore.playerInfo?.nickname }}</p>
    <p>UID：{{ playerStore.playerInfo?.id }}</p>
  </div>
</template>

<script setup lang="ts">
// 1. 引入 Store
import { usePlayerStore } from '@/stores/user'

// 2. 实例化 Store
const playerStore = usePlayerStore()
</script>
