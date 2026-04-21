<template>
  <div class="ai-assistant" :class="{ open: isOpen }">
    <!-- 悬浮按钮 -->
    <button class="assistant-toggle" @click="toggleOpen">
      <span v-if="!isOpen" class="toggle-icon">💬</span>
      <span v-else class="toggle-icon">✕</span>
    </button>

    <!-- 聊天面板 -->
    <div v-if="isOpen" class="assistant-panel">
      <div class="panel-header">
        <div class="header-icon">🤖</div>
        <div class="header-info">
          <h3>AI 小助手</h3>
          <span class="status">在线</span>
        </div>
      </div>

      <div class="chat-messages">
        <div class="message ai-message">
          <div class="message-bubble">
            <p>你好！我是AI学习助手，有什么可以帮助你的吗？</p>
          </div>
        </div>
        <div v-if="userMsg" class="message user-message">
          <div class="message-bubble">
            <p>{{ userMsg }}</p>
          </div>
        </div>
      </div>

      <div class="chat-input-area">
        <input
          v-model="inputMsg"
          type="text"
          placeholder="问我任何问题..."
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage" :disabled="!inputMsg.trim()">发送</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)
const inputMsg = ref('')
const userMsg = ref('')

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

const sendMessage = () => {
  if (inputMsg.value.trim()) {
    userMsg.value = inputMsg.value
    inputMsg.value = ''
  }
}
</script>

<style scoped>
.ai-assistant {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}

/* 悬浮按钮 */
.assistant-toggle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--accent-orange), #e55a2b);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4);
  transition: all 0.3s ease;
}

.assistant-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(255, 107, 53, 0.5);
}

.toggle-icon {
  font-size: 1.5rem;
}

/* 聊天面板 */
.assistant-panel {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 360px;
  height: 480px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 面板头部 */
.panel-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  user-select: none;
}

.header-icon {
  font-size: 1.5rem;
}

.header-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
  margin: 0;
}

.status {
  font-size: 0.75rem;
  color: #4CAF50;
}

/* 聊天消息区域 */
.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.message.ai-message {
  align-items: flex-start;
}

.message.user-message {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.ai-message .message-bubble {
  background: #ffffff;
  color: #333333;
  border: 1px solid #e0e0e0;
  border-radius: 12px 12px 12px 4px;
}

.user-message .message-bubble {
  background: #ff6b35;
  color: #ffffff;
  border-radius: 12px 12px 4px 12px;
}

/* 输入区域 */
.chat-input-area {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: #ffffff;
  border-top: 1px solid #e0e0e0;
}

.chat-input-area input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #333333;
  font-size: 0.9rem;
  outline: none;
}

.chat-input-area input:focus {
  border-color: #ff6b35;
}

.chat-input-area input::placeholder {
  color: #999999;
}

.chat-input-area button {
  padding: 0.75rem 1.25rem;
  background: #ff6b35;
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.chat-input-area button:hover:not(:disabled) {
  background: #ff7b4f;
}

.chat-input-area button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式 */
@media (max-width: 480px) {
  .assistant-panel {
    width: calc(100vw - 2rem);
    right: -0.5rem;
    height: 400px;
  }
}
</style>
