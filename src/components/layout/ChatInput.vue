<template>
  <div class="chat-input-container">
    <div class="chat-input-wrapper">
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :placeholder="isLoading ? '点击右边可以取消查询' : placeholder"
        class="chat-input"
        :disabled="isLoading"
        @keyup.enter="isLoading ? undefined : handleSend()"
      />
      <span v-if="isLoading" class="loading-hint"><b>➜</b></span>
      <button
        type="button"
        @click="handleSend"
        class="send-button"
        :class="{ active: modelValue?.trim() || isLoading, loading: isLoading }"
        :disabled="!isLoading && !modelValue?.trim()"
      >
        <!-- 发送图标 -->
        <svg
          v-if="!isLoading"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <!-- 加载中正方形 -->
        <div v-else class="loading-square"></div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue?: string
  placeholder?: string
  isLoading?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'send', value: string): void
  (e: 'cancel'): void
}>()

const handleSend = () => {
  if (props.isLoading) {
    // 正在加载时，点击取消请求
    emit('cancel')
  } else if (props.modelValue?.trim()) {
    emit('send', props.modelValue.trim())
    emit('update:modelValue', '')
  }
}
</script>

<style scoped>
.chat-input-container {
  position: relative;
}

.chat-input-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--accent-orange);
  border-radius: 50px;
  padding: 0.5rem;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.2);
  transition: all 0.3s;
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 1rem 1.5rem;
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
}

.chat-input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.loading-hint {
  position: absolute;
  right: 4rem;
  color: var(--accent-orange);
  font-size: 0.85rem;
  font-weight: 700;
  pointer-events: none;
  animation: fadeIn 0.3s ease;
}

.loading-hint b {
  color: var(--accent-orange);
  font-weight: 700;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.chat-input::placeholder {
  color: var(--text-secondary);
}

.send-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--border-color);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
}

.send-button.active {
  background: var(--accent-orange);
  color: var(--bg-dark);
  transform: rotate(0deg);
}

.send-button.active:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(255, 107, 53, 0.3);
}

.send-button svg {
  width: 20px;
  height: 20px;
}

.loading-square {
  width: 16px;
  height: 16px;
  background: currentColor;
  border-radius: 2px;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.9);
  }
}
</style>
