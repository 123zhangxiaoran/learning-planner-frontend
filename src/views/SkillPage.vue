<template>
  <div class="skill-container">
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

    <!-- 技能分析区域 -->
    <main class="main-content">
      <section class="skill-section">
        <!-- AI对话框组件 -->
        <AIDialog
          titleBadge="技能学习"
          title="分析你的技能树"
          subtitle="告诉我你想掌握的技能，我来为你规划学习路径"
          highlightText="选择技能开始你的提升计划。"
          @sendMessage="handleSendMessage"
        >
          <!-- 插槽内容：技能选择卡片 -->
          <div class="skill-cards">
            <div
              v-for="skill in skillsData"
              :key="skill.id"
              class="skill-card"
              :class="{ selected: selectedSkill === skill.id }"
              @click="handleSelectSkill(skill.id)"
            >
              <div class="skill-icon">💼</div>
              <div class="skill-info">
                <h4 class="skill-name">{{ skill.name }}</h4>
                <p class="skill-desc">{{ skill.description }}</p>
                <span class="skill-level">{{ skill.level }}</span>
              </div>
              <div class="skill-action">
                <button class="select-btn" :class="{ active: selectedSkill === skill.id }">
                  {{ selectedSkill === skill.id ? '√ 已选择' : '开始学习' }}
                </button>
              </div>
            </div>
          </div>

          <!-- 继续下一步按钮 -->
          <div class="next-step">
            <button class="next-btn" :class="{ disabled: !selectedSkill }">生成学习计划...</button>
          </div>

          <!-- 返回按钮 -->
          <div class="back-section">
            <router-link to="/user/career" class="back-btn"> ← 返回职业选择 </router-link>
          </div>
        </AIDialog>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/layout/NavBar.vue'
import AIDialog from '@/components/ai/AIDialog.vue'
import { ref } from 'vue'

const skillsData = [
  {
    id: 1,
    name: '前端框架',
    description: 'React、Vue、Angular等主流框架的深入掌握',
    level: '高级',
  },
  {
    id: 2,
    name: 'JavaScript/TypeScript',
    description: '语言核心概念、异步编程、类型系统',
    level: '高级',
  },
  { id: 3, name: 'CSS高级特性', description: 'Flexbox、Grid、动画、响应式设计', level: '中级' },
  { id: 4, name: '构建工具', description: 'Webpack、Vite、Rollup等打包工具的使用', level: '中级' },
  { id: 5, name: '性能优化', description: '代码分割、懒加载、缓存策略等', level: '进阶' },
  { id: 6, name: '测试技能', description: '单元测试、集成测试、E2E测试', level: '基础' },
]

const selectedSkill = ref<number | null>(null)
const showUserMessage = ref(false)
const userMessage = ref('')

const handleSendMessage = (message: string) => {
  userMessage.value = message
  showUserMessage.value = true

  // 模拟AI回复逻辑
  setTimeout(() => {
    // 可以根据message内容做更智能的回复
  }, 500)
}

const handleSelectSkill = (skillId: number) => {
  selectedSkill.value = skillId === selectedSkill.value ? null : skillId
}
</script>

<style scoped>
/* ========= 基础样式 ========= */
.skill-container {
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
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 复用CareerPage的样式变量 */
:root {
  --bg-dark: #1a1a1a;
  --bg-card: #2a2a2a;
  --border-color: #3a3a3a;
  --text-primary: #ffffff;
  --text-secondary: #888888;
  --accent-orange: #ff6b35;
  --accent-teal: #2ec4b6;
  --accent-yellow: #ffd166;
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

/* ========= 技能卡片布局 ========= */
.skill-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.skill-card {
  background: var(--bg-dark);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  position: relative;
  transform: translateY(-2px);
}

.skill-card:hover {
  border-color: var(--accent-teal);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(46, 196, 182, 0.1);
}

.skill-card.selected {
  border-color: var(--accent-orange);
  background: rgba(255, 107, 53, 0.05);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.1);
}

.skill-icon {
  font-size: 2rem;
  padding: 1rem;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.skill-card.selected .skill-icon {
  background: var(--accent-orange);
  color: var(--bg-dark);
}

.skill-info {
  flex: 1;
}

.skill-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.skill-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.skill-level {
  display: inline-block;
  padding: 0.2rem 0.8rem;
  background: var(--accent-teal);
  color: var(--bg-dark);
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 12px;
  text-transform: uppercase;
}

.skill-action {
  margin-top: 0.5rem;
}

.select-btn {
  padding: 0.5rem 1rem;
  background: var(--border-color);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.select-btn:hover {
  background: var(--accent-teal);
  color: var(--bg-dark);
  transform: translateY(-1px);
}

.select-btn.active {
  background: var(--accent-orange);
  color: var(--bg-dark);
  font-weight: 600;
}

/* ========= 下一步按钮 ========= */
.next-step {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.next-btn {
  background: var(--accent-orange);
  color: var(--bg-dark);
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.next-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
}

.next-btn.disabled {
  background: var(--border-color);
  color: var(--text-secondary);
  cursor: not-allowed;
}

/* ========= 返回区域 ========= */
.back-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

/* 保留原有的空状态样式，但重新定位到文件末尾 */
.skill-content {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 3rem;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skill-empty {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

.skill-empty h3 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.skill-empty p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
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
  0%,
  100% {
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

  .skill-content {
    padding: 2rem;
  }

  .empty-icon {
    font-size: 3rem;
  }
}
</style>
