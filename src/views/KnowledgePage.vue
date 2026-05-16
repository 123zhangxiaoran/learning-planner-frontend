<template>
  <div class="knowledge-container">
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

    <!-- 顶部导航栏 -->
    <NavBar />

    <!-- 知识库存区域 -->
    <main class="main-content">
      <section class="knowledge-section">
        <!-- 标题区域 -->
        <div class="section-header">
          <div class="header-badge">知识仓库</div>
          <h1 class="section-title">你的学习知识库</h1>
          <p class="section-subtitle">
            这里存放着你在技能分析中积累的知识<br />
            <span class="highlight">随时查阅，温故知新！</span>
          </p>
        </div>

        <!-- 知识卡片区域 -->
        <div class="knowledge-content">
          <div class="knowledge-grid">
            <!-- 知识卡片 -->
            <div v-for="knowledge in knowledgeData" :key="knowledge.id" class="knowledge-card">
              <div class="card-icon">{{ knowledge.icon }}</div>
              <div class="card-content">
                <h3 class="card-title">{{ knowledge.title }}</h3>
                <p class="card-desc">{{ knowledge.description }}</p>
                <div class="card-tags">
                  <span
                    v-for="tag in knowledge.tags"
                    :key="tag"
                    class="tag"
                    :style="{ background: tagColors[tag] || tagColors.default }"
                  >
                    {{ tag }}
                  </span>
                </div>
                <div class="card-meta">
                  <span class="level" :class="knowledge.level">{{ knowledge.level }}掌握</span>
                  <span class="progress">
                    <span class="progress-text">进度：</span>
                    <span class="progress-bar">
                      <span
                        class="progress-fill"
                        :style="{ width: knowledge.progress + '%' }"
                      ></span>
                    </span>
                  </span>
                </div>
                <button class="review-btn" @click="handleReview(knowledge.id)">
                  📚 复习知识
                </button>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="knowledgeData.length === 0" class="knowledge-empty">
            <div class="empty-icon">📦</div>
            <h3>知识库存空空如也</h3>
            <p>先去技能页面分析你的技能，这里会开始记录你的学习成果</p>
            <router-link to="/user/skill" class="start-btn">
              🚀 开始技能分析
            </router-link>
          </div>
        </div>

        </section>
    </main>

    <!-- 浮动装饰元素 -->
    <div class="floating-decoration">
      <div class="decoration-item">📚</div>
      <div class="decoration-item">🔖</div>
      <div class="decoration-item">🎯</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/layout/NavBar.vue'
import { ref } from 'vue'

// 标签颜色映射
const tagColors = {
  '前端': '#ff6b35',
  '后端': '#2ec4b6',
  '数据库': '#f7c548',
  '工具': '#ff9f1c',
  '框架': '#e71d36',
  '算法': '#6a0572',
  '设计': '#00b4d8',
  '测试': '#06d6a0',
  'default': '#8ba1a1'
}

// 知识数据
const knowledgeData = ref([
  {
    id: 1,
    icon: '⚛️',
    title: 'React 组件设计模式',
    description: '高阶组件、Render Props、Hooks等组件设计模式的深度理解',
    tags: ['前端', '框架', 'React'],
    level: '高级',
    progress: 80
  },
  {
    id: 2,
    icon: '💻',
    title: 'TypeScript 类型系统',
    description: '类型推断、泛型、接口、装饰器等核心概念掌握',
    tags: ['前端', '工具', 'TypeScript'],
    level: '中级',
    progress: 65
  },
  {
    id: 3,
    icon: '🎨',
    title: 'CSS 布局系统',
    description: 'Flexbox 和 Grid 布局的深入应用和响应式适配',
    tags: ['前端', '设计', 'CSS'],
    level: '中级',
    progress: 70
  },
  {
    id: 4,
    icon: '🚀',
    title: 'Vue 3 Composition API',
    description: 'Vue 3 响应式系统和组合式API的完整理解',
    tags: ['前端', '框架', 'Vue'],
    level: '高级',
    progress: 85
  },
  {
    id: 5,
    icon: '🔧',
    title: 'Webpack 构建优化',
    description: '代码分割、懒加载、Tree Shaking等优化技巧',
    tags: ['前端', '工具', '构建'],
    level: '进阶',
    progress: 60
  },
  {
    id: 6,
    icon: '🧪',
    title: 'Jest 单元测试',
    description: 'JavaScript 单元测试框架的使用和最佳实践',
    tags: ['前端', '测试', '工具'],
    level: '基础',
    progress: 45
  }
])

const handleReview = (id: number) => {
  console.log(`开始复习知识: ${id}`)
  // 这里可以添加复习功能的逻辑
}
</script>

<style scoped>
/* ========= 基础样式 ========= */
.knowledge-container {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  background-color: var(--bg-dark);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--text-primary);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

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

/* ========= 背景样式 ========= */
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

/* ========= 主内容区域 ========= */
.main-content {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 5% 3rem 8%;
}

/* ========= 头部区域 ========= */
.section-header {
  margin-bottom: 3rem;
  max-width: 600px;
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

/* ========= 知识网格布局 ========= */
.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.knowledge-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  transform: translateY(-2px);
}

.knowledge-card:hover {
  border-color: var(--accent-orange);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.1);
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  text-align: center;
}

.card-content {
  text-align: center;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.card-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.card-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  padding: 0.2rem 0.8rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 12px;
  color: var(--bg-dark);
  text-transform: uppercase;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

.level {
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
  font-weight: 600;
}

.level.基础 {
  background: var(--accent-teal);
  color: var(--bg-dark);
}

.level.中级 {
  background: var(--accent-yellow);
  color: var(--bg-dark);
}

.level.高级 {
  background: var(--accent-orange);
  color: var(--bg-dark);
}

.level.进阶 {
  background: #e71d36;
  color: var(--text-primary);
}

.progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-text {
  color: var(--text-secondary);
}

.progress-bar {
  width: 80px;
  height: 6px;
  background: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent-teal);
  transition: width 0.3s ease;
}

.review-btn {
  background: var(--accent-orange);
  color: var(--bg-dark);
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.review-btn:hover {
  background: var(--accent-yellow);
  transform: translateY(-1px);
}

/* ========= 空状态 ========= */
.knowledge-empty {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

.knowledge-empty h3 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.knowledge-empty p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.start-btn {
  display: inline-block;
  background: var(--accent-teal);
  color: var(--bg-dark);
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.start-btn:hover {
  background: var(--accent-orange);
  transform: translateY(-2px);
}

/* ========= 返回区域 ========= */
.back-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.back-btn {
  display: inline-block;
  background: var(--accent-teal);
  color: var(--bg-dark);
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: var(--accent-orange);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

/* ========= 浮动装饰 ========= */
.floating-decoration {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 5;
}

.decoration-item {
  font-size: 1.5rem;
  opacity: 0.1;
  animation: float 3s ease-in-out infinite;
}

.decoration-item:nth-child(2) {
  animation-delay: 1s;
}

.decoration-item:nth-child(3) {
  animation-delay: 2s;
}

/* ========= 动画 ========= */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* ========= 响应式适配 ========= */
@media (max-width: 768px) {
  .main-content {
    padding: 1.5rem 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .knowledge-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .knowledge-card {
    padding: 1.2rem;
  }

  .card-meta {
    flex-direction: column;
    gap: 0.8rem;
    align-items: flex-start;
  }

  .knowledge-empty {
    padding: 2rem 1rem;
  }

  .empty-icon {
    font-size: 3rem;
  }
}
</style>
