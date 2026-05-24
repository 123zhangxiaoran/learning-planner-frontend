<template>
  <div class="wrong-container">
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
        <h2 class="page-title">错题本</h2>
        <span class="wrong-count">{{ wrongQuestions.length }} 道错题</span>
      </div>

      <!-- 错题列表 -->
      <div class="wrong-list">
        <div class="wrong-card" v-for="(question, index) in wrongQuestions" :key="index">
          <div class="wrong-header">
            <span class="wrong-type">{{ question.type }}</span>
            <span class="wrong-number">第 {{ index + 1 }} 题</span>
            <span class="wrong-tag">错题</span>
          </div>
          <div class="wrong-content">
            <p class="wrong-text">{{ question.content }}</p>
          </div>
          <div class="wrong-options" v-if="question.options">
            <div
              class="option-item"
              v-for="(option, oIndex) in question.options"
              :key="oIndex"
              :class="{
                'user-wrong': question.userAnswer === oIndex && question.correctAnswer !== oIndex,
                'correct': question.correctAnswer === oIndex
              }"
            >
              <span class="option-label">{{ String.fromCharCode(65 + oIndex) }}</span>
              <span class="option-text">{{ option }}</span>
              <span class="mark-icon" v-if="question.correctAnswer === oIndex">✓</span>
              <span class="mark-icon wrong" v-if="question.userAnswer === oIndex && question.correctAnswer !== oIndex">✗</span>
            </div>
          </div>
          <div class="wrong-analysis" v-if="question.analysis">
            <h4 class="analysis-title">答案解析</h4>
            <p class="analysis-text">{{ question.analysis }}</p>
          </div>
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-if="wrongQuestions.length === 0">
          <p class="empty-text">暂无错题记录</p>
          <p class="empty-hint">继续保持，答对的题目不会进入错题本</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface WrongQuestion {
  type: string
  content: string
  options?: string[]
  correctAnswer: number
  userAnswer: number
  analysis?: string
}

const wrongQuestions = ref<WrongQuestion[]>([])
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
  --error-red: #ef4444;
}

/* ========= 容器 ========= */
.wrong-container {
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

.wrong-count {
  font-size: 0.9rem;
  color: var(--error-red);
}

/* ========= 错题列表 ========= */
.wrong-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.wrong-card {
  background: var(--bg-card);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  padding: 1.5rem;
}

.wrong-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.wrong-type {
  font-size: 0.8rem;
  color: var(--accent-teal);
  background: rgba(46, 196, 182, 0.15);
  padding: 0.25rem 0.7rem;
  border-radius: 4px;
}

.wrong-number {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-right: auto;
}

.wrong-tag {
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  background: var(--error-red);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
}

.wrong-content {
  margin-bottom: 1rem;
}

.wrong-text {
  font-size: 1rem;
  color: var(--text-primary);
  line-height: 1.6;
}

/* ========= 选项 ========= */
.wrong-options {
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

.option-item.user-wrong {
  border-color: var(--error-red);
  background: rgba(239, 68, 68, 0.1);
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
  flex: 1;
}

.mark-icon {
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent-teal);
}

.mark-icon.wrong {
  color: var(--error-red);
}

/* ========= 答案解析 ========= */
.wrong-analysis {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.analysis-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent-yellow);
  margin-bottom: 0.5rem;
}

.analysis-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
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

  .wrong-card {
    padding: 1.2rem;
  }

  .wrong-header {
    flex-wrap: wrap;
  }
}
</style>