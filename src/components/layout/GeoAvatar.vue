<template>
  <svg
    class="avatar-svg"
    :width="size"
    :height="size"
    :viewBox="`0 0 ${viewBoxSize} ${viewBoxSize}`"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- 简笔画风格的书 -->
    <g
      :stroke="strokeColor"
      stroke-width="3"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <!-- 左边书页轮廓 -->
      <path d="M 50 12 Q 25 12 8 18 L 8 88 Q 25 82 50 82 Z" />
      <!-- 右边书页轮廓 -->
      <path d="M 50 12 Q 75 12 92 18 L 92 88 Q 75 82 50 82 Z" />
      <!-- 书脊中心线 -->
      <line x1="50" y1="12" x2="50" y2="82" />
      <!-- 左边书页横线 -->
      <line
        v-for="i in 4"
        :key="'l' + i"
        :x1="15"
        :y1="25 + i * 12"
        :x2="45"
        :y2="25 + i * 12"
        stroke-width="1.5"
      />
      <!-- 右边书页横线 -->
      <line
        v-for="i in 4"
        :key="'r' + i"
        :x1="55"
        :y1="25 + i * 12"
        :x2="85"
        :y2="25 + i * 12"
        stroke-width="1.5"
      />
      <!-- 书本底部弧线 -->
      <path d="M 8 88 Q 25 90 50 82 Q 75 90 92 88" stroke-width="2" />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  userId: number
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 80,
})

const viewBoxSize = 100

// 基于用户ID生成不同的样式
const strokeColor = computed(() => {
  const colors = ['#ff6b35', '#f7c548', '#2ec4b6', '#9ca3af']
  const seed = props.userId || 1
  return colors[seed % colors.length]
})
</script>

<style scoped>
.avatar-svg {
  display: block;
}
</style>
