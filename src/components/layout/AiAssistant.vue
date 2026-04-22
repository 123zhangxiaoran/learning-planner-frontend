<template>
  <div
    class="ai-assistant"
    :class="{ open: isOpen, dragging: isDragging }"
    :style="{ left: position.x + 'px', top: position.y + 'px', right: 'auto', bottom: 'auto' }"
  >
    <!-- 悬浮按钮 -->
    <button
      class="assistant-toggle"
      :class="{ dragging: isDragging }"
      @mousedown.stop="startDrag"
      @touchstart.stop.prevent="startDragTouch"
      @click.stop="toggleOpen"
    >
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
import { ref, onMounted, onBeforeUnmount } from 'vue'

const isOpen = ref(false)
const inputMsg = ref('')
const userMsg = ref('')
const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const hasMoved = ref(false) // 记录是否发生了拖动

// 统一的拖动处理函数
const handleDrag = (clientX: number, clientY: number) => {
  if (!isDragging.value) return

  hasMoved.value = true // 标记发生了拖动
  const newX = clientX - dragStart.value.x
  const newY = clientY - dragStart.value.y

  // 限制在窗口范围内
  const maxX = window.innerWidth - 56
  const maxY = window.innerHeight - 56

  position.value = {
    x: Math.max(0, Math.min(newX, maxX)),
    y: Math.max(0, Math.min(newY, maxY)),
  }
}

// 初始化位置
onMounted(() => {
  // 计算初始位置（右下角）
  position.value = {
    x: window.innerWidth - 56 - 32, // 32 是 right: 2rem
    y: window.innerHeight - 56 - 32, // 32 是 bottom: 2rem
  }

  // 绑定全局事件（支持鼠标和触摸）
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchmove', onTouchDrag, { passive: false })
  window.addEventListener('touchend', stopDragTouch)
})

// 清理事件
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', onTouchDrag)
  window.removeEventListener('touchend', stopDragTouch)
})

const toggleOpen = () => {
  // 如果刚刚发生了拖动，不执行打开/关闭
  if (hasMoved.value) {
    hasMoved.value = false
    return
  }
  isOpen.value = !isOpen.value
}

const startDrag = (e: MouseEvent) => {
  if (!isOpen.value) {
    isDragging.value = true
    hasMoved.value = false // 重置移动标记
    dragStart.value = {
      x: e.clientX - position.value.x,
      y: e.clientY - position.value.y,
    }
  }
}

const onDrag = (e: MouseEvent) => {
  handleDrag(e.clientX, e.clientY)
}

// 触摸事件处理
const startDragTouch = (e: TouchEvent) => {
  if (!isOpen.value) {
    e.preventDefault()
    isDragging.value = true
    hasMoved.value = false
    const touch = e.touches[0]
    if (touch) {
      dragStart.value = {
        x: touch.clientX - position.value.x,
        y: touch.clientY - position.value.y,
      }
    }
  }
}

const onTouchDrag = (e: TouchEvent) => {
  if (isDragging.value) {
    e.preventDefault()
    const touch = e.touches[0]
    if (touch) {
      handleDrag(touch.clientX, touch.clientY)
    }
  }
}

const stopDragTouch = () => {
  if (isDragging.value) {
    isDragging.value = false
    // 延迟一点重置 hasMoved，避免影响点击判断
    setTimeout(() => {
      hasMoved.value = false
    }, 100)
  }
}

const stopDrag = () => {
  if (isDragging.value) {
    isDragging.value = false
    // 延迟一点重置 hasMoved，避免影响点击判断
    setTimeout(() => {
      hasMoved.value = false
    }, 100)
  }
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
  right: 2rem;
  bottom: 2rem;
  z-index: 1000;
}

.ai-assistant.dragging {
  cursor: grabbing !important;
}

.ai-assistant.dragging .assistant-toggle {
  cursor: grabbing !important;
  transform: none !important;
}

/* 悬浮按钮 */
.assistant-toggle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--accent-orange), #e55a2b);
  border: none;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: none;
}

.assistant-toggle:active {
  cursor: grabbing;
  transition: none;
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
  color: #4caf50;
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
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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
