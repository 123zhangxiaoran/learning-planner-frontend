<template>
  <div class="question-container">
    <!-- 噪点纹理背景 -->
    <div class="noise-bg"></div>
    <!-- 手绘网格背景 -->
    <svg class="hand-drawn-grid" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path
            d="M 60 0 L 0 0 0 60"
            fill="none"
            stroke="#1a3a3a"
            stroke-width="0.5"
            stroke-dasharray="2,3"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>

    <!-- 主内容区域 -->
    <main class="main-content">
      <div class="page-header">
        <h2 class="page-title">我的题目</h2>
        <span class="question-count">{{ questions.length }} 道题</span>
      </div>

      <!-- 题目列表 -->
      <div class="question-list">
        <div class="question-card" v-for="(question, index) in questions" :key="index">
          <div class="question-header">
            <span class="question-type">{{ question.type }}</span>
            <span class="question-number">第 {{ index + 1 }} 题</span>
          </div>
          <div class="question-content">
            <p class="question-text">{{ question.content }}</p>
          </div>
          <div class="question-options" v-if="question.options">
            <div
              class="option-item"
              v-for="(option, oIndex) in question.options"
              :key="oIndex"
              :class="{ correct: question.correctAnswer === oIndex }"
            >
              <span class="option-label">{{ String.fromCharCode(65 + oIndex) }}</span>
              <span class="option-text">{{ option }}</span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-if="questions.length === 0">
          <p class="empty-text">暂无题目</p>
          <p class="empty-hint">请从知识仓库生成专属题目</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Question {
  type: string
  content: string
  options?: string[]
  correctAnswer?: number
}

const questions = ref<Question[]>([])
</script>

<style scoped>
/* ========= 颜色变量 ========= */
:root {
  --bg-dark: #0d1b1e;
  --bg-card: #162a2e;
  --accent-orange: #ff6b35;
  --accent-yellow: #f7c548;
  --accent-teal: #2ec4b6;
  --text-primary: #e8f1f2;
  --text-secondary: #95a5a6;
  --border-color: #1a3a3a;
}

/* ========= 容器 ========= */
.question-container {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  background-color: var(--bg-dark);
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  color: var(--text-primary);
  padding-bottom: 4rem;
  user-select: none;
}

/* ========= 背景 ========= */
.noise-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.03;
  z-index: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}

.hand-drawn-grid {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  opacity: 0.4;
}

/* ========= 主内容区 ========= */
.main-content {
  position: relative;
  z-index: 10;
  max-width: 900px;
  margin: 0 auto;
  padding: 3rem 5%;
}

/* ========= 页面头部 ========= */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-primary);
}

.question-count {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* ========= 题目列表 ========= */
.question-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.question-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 1.5rem;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.question-type {
  font-size: 0.8rem;
  color: var(--accent-teal);
  background: rgba(46, 196, 182, 0.15);
  padding: 0.25rem 0.7rem;
  border-radius: 4px;
}

.question-number {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.question-content {
  margin-bottom: 1rem;
}

.question-text {
  font-size: 1rem;
  color: var(--text-primary);
  line-height: 1.6;
}

/* ========= 选项 ========= */
.question-options {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  transition: all 0.2s;
}

.option-item.correct {
  border-color: var(--accent-teal);
  background: rgba(46, 196, 182, 0.1);
}

.option-label {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.option-text {
  font-size: 0.95rem;
  color: var(--text-primary);
}

/* ========= 空状态 ========= */
.empty-state {
  padding: 3rem;
  text-align: center;
}

.empty-text {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.empty-hint {
  font-size: 0.9rem;
  color: var(--text-secondary);
  opacity: 0.7;
}

/* ========= 响应式适配 ========= */
@media (max-width: 768px) {
  .main-content {
    padding: 2rem 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .question-card {
    padding: 1.2rem;
  }
}
</style>