<template>
  <!-- AI对话框组件 -->
  <div class="ai-dialog-section">
    <!-- 标题区域 -->
    <div class="section-header">
      <div class="header-left">
        <div class="header-badge">{{ titleBadge }}</div>
        <h1 class="section-title">{{ title }}</h1>
        <p class="section-subtitle">
          {{ subtitle }} <br />
          <span class="highlight">{{ highlightText }}</span>
        </p>
      </div>
      <div class="header-right">
        <slot name="header-right"></slot>
      </div>
    </div>

    <!-- 对话气泡区域 -->
    <div class="chat-container">
      <!-- AI消息 -->
      <div class="message ai-message">
        <div class="message-bubble">
          <p>{{ aiMessage }}</p>
          <ul v-if="suggestions && suggestions.length > 0" class="suggestions">
            <li v-for="suggestion in suggestions" :key="suggestion">{{ suggestion }}</li>
          </ul>
        </div>
      </div>

      <!-- 用户消息 -->
      <div v-if="showUserMessage" class="message user-message">
        <div class="message-bubble">
          <p>{{ userMessage }}</p>
        </div>
        <div class="message-avatar">👤</div>
      </div>

      <!-- 插槽：用于放置动态内容（如职业选项、技能选项等） -->
      <slot></slot>
    </div>

    <!-- 输入区域 -->
    <div class="input-container">
      <div class="input-wrapper">
        <input
          v-model="inputValue"
          type="text"
          :placeholder="isLoading ? '点击右边可以取消查询' : placeholder"
          class="chat-input"
          :disabled="isLoading"
          @keyup.enter="isLoading ? undefined : onSendMessage()"
        />
        <span v-if="isLoading" class="loading-hint"><b>➜</b></span>
        <button
          @click="handleButtonClick"
          class="send-button"
          :class="{ active: inputValue.trim() || isLoading, loading: isLoading }"
          :disabled="!isLoading && !inputValue.trim()"
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Props定义
interface Props {
  titleBadge?: string
  title?: string
  subtitle?: string
  highlightText?: string
  aiMessage?: string
  suggestions?: string[]
  showUserMessage?: boolean
  userMessage?: string
  placeholder?: string
  isLoading?: boolean
}

// 默认Props值
const props = withDefaults(defineProps<Props>(), {
  titleBadge: 'AI 助手',
  title: '你想了解什么？',
  subtitle: '告诉我你的需求，我会为你提供建议',
  highlightText: '选择一个方向开始对话。',
  aiMessage: '',
  suggestions: () => [],
  showUserMessage: false,
  userMessage: '',
  placeholder: '请输入你的问题...',
  isLoading: false,
})

const emit = defineEmits<{
  sendMessage: [message: string]
  cancel: []
}>()

const inputValue = ref('')

const onSendMessage = () => {
  if (inputValue.value.trim()) {
    emit('sendMessage', inputValue.value.trim())
    inputValue.value = ''
  }
}

const handleButtonClick = () => {
  if (props.isLoading) {
    // 正在加载时，点击取消请求
    emit('cancel')
  } else {
    onSendMessage()
  }
}
</script>

<style scoped>
/* 复用CareerPage的样式变量 */
:root {
  --bg-dark: #0d1b1e;
  --bg-card: #1a2f35;
  --text-primary: #ffffff;
  --text-secondary: #8ba1a1;
  --accent-orange: #ff6b35;
  --accent-teal: #2ec4b6;
  --accent-yellow: #f7c548;
  --border-color: #284047;
}

/* ========= 头部区域 ========= */
.section-header {
  margin-bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.header-left {
  flex: 1;
  max-width: 600px;
}

.header-right {
  flex-shrink: 0;
  padding-top: 6.5rem;
  padding-right: 8rem;
}

.header-badge {
  display: inline-block;
  background: var(--accent-orange);
  color: var(--bg-dark);
  padding: 0.4rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
  transform: rotate(-1deg);
}

.section-title {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1.1;
  color: var(--text-primary);
  margin-bottom: 1rem;
  letter-spacing: -0.03em;
}

.section-subtitle {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-secondary);
}

.section-subtitle .highlight {
  color: var(--accent-yellow);
  font-weight: 600;
}

/* ========= 对话容器 ========= */
.chat-container {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  min-height: 400px;
}

/* ========= 消息样式 ========= */
.message {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  animation: fadeInUp 0.5s ease;
}

.message.ai-message {
  align-items: flex-start;
}

.message.user-message {
  align-items: flex-end;
  justify-content: flex-end;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  background: var(--bg-dark);
  border: 2px solid var(--border-color);
  flex-shrink: 0;
}

.message-bubble {
  max-width: 70%;
  background: var(--bg-dark);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1rem 1.5rem;
}

.message.user-message .message-bubble {
  background: var(--accent-orange);
  color: var(--bg-dark);
  border-color: var(--accent-orange);
  user-select: text;
}

/* 建议列表 */
.suggestions {
  margin-top: 0.5rem;
  padding-left: 1.5rem;
}

.suggestions li {
  color: var(--accent-teal);
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
}

/* ========= 输入区域 ========= */
.input-container {
  position: relative;
}

.input-wrapper {
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
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

.send-button.loading {
  border-radius: 8px;
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
  background: #000000;
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

/* ========= 动画 ========= */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========= 响应式适配 ========= */
@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }

  .chat-container {
    padding: 1.5rem;
  }

  .message {
    gap: 0.8rem;
  }

  .message-bubble {
    max-width: 85%;
  }

  .input-wrapper {
    border-radius: 25px;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.8rem;
  }

  .header-badge {
    font-size: 0.65rem;
    padding: 0.3rem 0.8rem;
  }
}
</style>
