<template>
  <div class="chat-input-container">
    <div class="chat-input-wrapper">
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :placeholder="placeholder"
        class="chat-input"
        @keyup.enter="handleSend"
      />
      <button
        type="button"
        @click="handleSend"
        class="send-button"
        :class="{ active: modelValue?.trim() }"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path
            d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  modelValue?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'send', value: string): void
}>()

const handleSend = () => {
  if (props.modelValue?.trim()) {
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
</style>
