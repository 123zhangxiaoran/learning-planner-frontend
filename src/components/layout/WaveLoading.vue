<template>
  <span class="wave-animation" :key="waveKey">
    {{ text }}<span
      v-for="d in dotItems"
      :key="d.index"
      class="wave-char"
      :style="{ animationDelay: d.delay }"
      @animationend="onDotAnimationEnd"
    >{{ d.char }}</span>
  </span>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

defineProps<{
  text?: string
}>()

const DOT_COUNT = 4

const waveKey = ref(0)
let waveTimer: ReturnType<typeof setTimeout> | null = null
let dotEndCount = 0

const dotItems = computed(() =>
  Array.from({ length: DOT_COUNT }).map((_, index) => ({
    char: '.',
    index,
    delay: `${index * 0.6}s`,
  }))
)

function onDotAnimationEnd(e: AnimationEvent) {
  if (!(e.target as HTMLElement).classList.contains('wave-char')) return
  dotEndCount++
  if (dotEndCount >= DOT_COUNT) {
    dotEndCount = 0
    waveTimer = setTimeout(() => {
      waveKey.value++
    }, 500)
  }
}

onUnmounted(() => {
  if (waveTimer) {
    clearTimeout(waveTimer)
    waveTimer = null
  }
})
</script>

<style scoped>
@keyframes wave-loading-char {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.wave-animation {
  display: inline-block;
}

.wave-char {
  display: inline-block;
  font-weight: 800;
  font-size: 1.3em;
  animation: wave-loading-char 1.4s ease-in-out;
}
</style>
