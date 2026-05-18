<template>
  <div class="home-container">
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

    <!-- 顶部导航栏 - 复用组件 -->
    <NavBar />

    <!-- 主内容区 - 非对称布局 -->
    <main class="main-content">
      <!-- Hero区域 - 左上对齐，打破居中 -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-badge">AI 替你踩过坑了</div>
          <h1 class="hero-title">别走弯路</h1>
          <p class="hero-subtitle">
            输入专业，AI会给你一套路线<br />
            <span class="highlight">但你不一定要听它的。</span>
          </p>
          <div class="hero-actions">
            <router-link to="/user/career" class="btn-primary">
              <span>开启职业探索</span>
              <svg
                class="btn-arrow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </router-link>
            <router-link to="/user/me" class="btn-secondary"> 查看我的路线 </router-link>
          </div>
        </div>

        <!-- 手绘路线图装饰 -->
        <div class="route-sketch">
          <svg viewBox="0 0 300 200" class="sketch-svg">
            <!-- 连接所有点的手绘风格曲线 -->
            <path
              d="M20,100 C60,70 110,110 150,80 S170,130 180,110 S240,90 280,50"
              fill="none"
              stroke="#2ec4b6"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-dasharray="4,4"
            />
            <!-- 节点 - 黑色实心 -->
            <circle cx="20" cy="100" r="5" fill="#0d1b1e" />
            <circle cx="150" cy="80" r="3" fill="#0d1b1e" />
            <circle cx="280" cy="50" r="6" fill="#0d1b1e" />
            <circle cx="180" cy="110" r="4" fill="#0d1b1e" />
          </svg>
          <div class="sketch-label">你的学习路线可能是这样的</div>
        </div>
      </section>

      <!-- 功能卡片区域 - 瀑布式错位布局 -->
      <section class="features-section">
        <!-- 大卡片 - 职业探索 -->
        <router-link
          to="/user/career"
          class="feature-card feature-card-large"
          style="--rotation: -1deg"
        >
          <div class="card-header">
            <div class="card-number-sketch">
              <svg viewBox="0 0 40 40" class="number-circle">
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke="#ff6b35"
                  stroke-width="2"
                  stroke-dasharray="3,2"
                />
                <text
                  x="20"
                  y="25"
                  text-anchor="middle"
                  fill="#ff6b35"
                  font-size="16"
                  font-weight="700"
                >
                  1
                </text>
              </svg>
            </div>
            <h3 class="card-title">职业探索</h3>
          </div>
          <p class="card-description">你的专业能干嘛？AI来康康，说不定能挖到宝~</p>
          <span class="card-link"> 去查看 → </span>
          <div class="card-sketch-decoration">
            <svg viewBox="0 0 100 60">
              <path
                d="M10,30 Q30,10 50,30 T90,30"
                stroke="#FF6B35"
                stroke-width="2"
                fill="none"
                stroke-dasharray="4,2"
              />
              <circle cx="50" cy="30" r="4" fill="#FF6B35" />
            </svg>
          </div>
        </router-link>

        <!-- 小卡片 - 技能分析 -->
        <router-link
          to="/user/skill"
          class="feature-card feature-card-small"
          style="--rotation: 1.5deg; margin-top: 40px"
        >
          <div class="card-header">
            <div class="card-number-sketch">
              <svg viewBox="0 0 40 40" class="number-circle">
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke="#ff6b35"
                  stroke-width="2"
                  stroke-dasharray="3,2"
                />
                <text
                  x="20"
                  y="25"
                  text-anchor="middle"
                  fill="#ff6b35"
                  font-size="16"
                  font-weight="700"
                >
                  2
                </text>
              </svg>
            </div>
            <h3 class="card-title">技能分析</h3>
          </div>
          <p class="card-description">
            想不想知道自己缺啥技能？AI来把把脉，对症下药，让你悄悄变强~
          </p>
          <span class="card-link"> 技能分析 → </span>
        </router-link>

        <!-- 中卡片 - 知识库存 -->
        <router-link
          to="/user/knowledge"
          class="feature-card feature-card-medium"
          style="--rotation: -0.5deg; margin-left: 5%"
        >
          <div class="card-header">
            <div class="card-number-sketch">
              <svg viewBox="0 0 40 40" class="number-circle">
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke="#ff6b35"
                  stroke-width="2"
                  stroke-dasharray="3,2"
                />
                <text
                  x="20"
                  y="25"
                  text-anchor="middle"
                  fill="#ff6b35"
                  font-size="16"
                  font-weight="700"
                >
                  3
                </text>
              </svg>
            </div>
            <h3 class="card-title">知识库存</h3>
          </div>
          <p class="card-description">悄悄告诉你，这里存着AI给你写的独门笔记~</p>
          <span class="card-link"> 查看库存 → </span>
        </router-link>

        <!-- 小卡片 - 个人中心 -->
        <router-link
          to="/user/me"
          class="feature-card feature-card-small"
          style="--rotation: 2deg; margin-top: -20px"
        >
          <div class="card-header">
            <div class="card-number-sketch">
              <svg viewBox="0 0 40 40" class="number-circle">
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke="#ff6b35"
                  stroke-width="2"
                  stroke-dasharray="3,2"
                />
                <text
                  x="20"
                  y="25"
                  text-anchor="middle"
                  fill="#ff6b35"
                  font-size="16"
                  font-weight="700"
                >
                  4
                </text>
              </svg>
            </div>
            <h3 class="card-title">个人中心</h3>
          </div>
          <p class="card-description">你的成长黑历史...哦不，是光辉历程，都在这里啦~</p>
          <span class="card-link"> 我的空间 → </span>
        </router-link>
      </section>
    </main>

    <!-- 反AI彩蛋 - 右下角 -->
    <div class="anti-ai-widget">
      <div class="anti-ai-header">
        <span class="anti-ai-icon">⚠️</span>
        <span class="anti-ai-title">反AI彩蛋</span>
      </div>
      <p class="anti-ai-quote">{{ currentQuote }}</p>
    </div>

    <!-- 悬浮提示 -->
    <div v-if="showTooltip" class="floating-tooltip" :style="tooltipStyle">
      {{ tooltipText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import NavBar from '@/components/layout/NavBar.vue'
import { usePlayerStore } from '@/stores/user'
import { useCareerStore } from '@/stores/career'
import { getUserJobData } from '@/api/agent'

// ======================== 反AI彩蛋 ========================
const quotes = [
  '学Python，不然十年后你给AI递扳手',
  'AI写的代码能跑，但别问为什么',
  '提示词工程师？不，就是会说话的甲方',
  'ChatGPT不会替你面试，但它能帮你吹',
  'AI能画图，但画不出你的焦虑',
  '别问AI能不能取代你，问你能不能驾驭它',
  'AI生成的简历，HR用AI筛选——完美闭环',
  '学AI不如学怎么让AI替你学',
  'AI不会犯错，但它会一本正经地胡说',
  '你的竞争对手不是AI，是会用AI的人',
  'AI可以写代码，但背锅的还是你',
  'Prompt写得越好，下班越早',
]

const currentQuote = ref(quotes[0])
let quoteInterval: ReturnType<typeof setInterval> | null = null

function refreshQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length)
  currentQuote.value = quotes[randomIndex]
}

function startAutoRefresh() {
  quoteInterval = setInterval(() => {
    refreshQuote()
  }, 30000) // 30秒自动切换
}

function stopAutoRefresh() {
  if (quoteInterval) {
    clearInterval(quoteInterval)
    quoteInterval = null
  }
}

// ======================== 悬浮提示 ========================
const showTooltip = ref(false)
const tooltipText = ref<string>('')
const tooltipStyle = ref({ left: '0px', top: '0px' })

const tooltips = [
  '这个岗位今年涨薪最快',
  '大厂都在招，但要求很高',
  '适合转行的方向',
  'AI暂时还取代不了',
  '需要数学基础',
  '入门容易精通难',
]

function handleMouseMove(e: MouseEvent) {
  // 随机显示提示（降低频率）
  if (Math.random() > 0.995 && !showTooltip.value) {
    tooltipText.value = tooltips[Math.floor(Math.random() * tooltips.length)] ?? ''
    tooltipStyle.value = {
      left: `${e.clientX + 15}px`,
      top: `${e.clientY + 15}px`,
    }
    showTooltip.value = true
    setTimeout(() => {
      showTooltip.value = false
    }, 2000)
  }
}

// ======================== 恢复岗位数据 ========================
const playerStore = usePlayerStore()
const careerStore = useCareerStore()

async function restoreUserData() {
  if (careerStore.selectedJobNames.length > 0) return

  const userId = playerStore.playerInfo?.id
  if (!userId) return

  try {
    const res = await getUserJobData(userId)
    if (res.code === 200 && res.data) {
      const data = JSON.parse(res.data as unknown as string)
      const jobNames: string[] = Array.isArray(data.query) ? data.query : []
      if (jobNames.length > 0) {
        careerStore.setJobNames(jobNames)
      }
    }
  } catch (e) {
    console.warn('恢复岗位名称失败:', e)
  }
}

// ======================== 生命周期 ========================
onMounted(() => {
  restoreUserData()
  refreshQuote()
  startAutoRefresh()
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  stopAutoRefresh()
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<style scoped>
/* ========= 基础重置 ========= */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* ========= 容器 ========= */
.home-container {
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
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* ========= 噪点背景 ========= */
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

/* ========= 手绘网格背景 ========= */
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

/* ========= 主内容区 - 非对称布局 ========= */
.main-content {
  position: relative;
  z-index: 10;
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 5% 3rem 8%; /* 左侧留白更多 */
}

/* ========= Hero区域 - 左上对齐 ========= */
.hero-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 5rem;
  padding-top: 2rem;
}

.hero-content {
  max-width: 500px;
}

.hero-badge {
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

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  line-height: 1.1;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
}

.hero-subtitle {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: 2.5rem;
}

.hero-subtitle .highlight {
  color: var(--accent-yellow);
  font-weight: 600;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--accent-orange);
  color: var(--bg-dark);
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  text-decoration: none;
  border: 3px solid var(--accent-orange);
  cursor: pointer;
  transition: all 0.2s;
  transform: rotate(-0.5deg);
  position: relative;
}

.btn-primary:hover {
  transform: rotate(0deg) scale(1.02);
  box-shadow: 0 10px 30px rgba(255, 107, 53, 0.4);
  background: var(--bg-dark);
  color: var(--accent-orange);
}

.btn-arrow {
  width: 20px;
  height: 20px;
  transition: transform 0.2s;
}

.btn-primary:hover .btn-arrow {
  transform: translateX(4px);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--accent-orange);
  color: var(--bg-dark);
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  text-decoration: none;
  border: 3px solid var(--accent-orange);
  cursor: pointer;
  transition: all 0.2s;
  transform: rotate(-0.5deg);
  position: relative;
}

.btn-secondary:hover {
  transform: rotate(0deg) scale(1.02);
  box-shadow: 0 10px 30px rgba(255, 107, 53, 0.4);
  background: var(--bg-dark);
  color: var(--accent-orange);
}

/* ========= 手绘路线图装饰 ========= */
.route-sketch {
  position: relative;
  width: 420px;
  padding: 2rem;
}

.sketch-svg {
  width: 100%;
  height: auto;
}

.sketch-label {
  position: absolute;
  bottom: 0;
  right: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-style: italic;
  transform: rotate(-2deg);
}

/* ========= 功能卡片区域 - 瀑布式错位 ========= */
.features-section {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 2rem;
  align-items: start;
}

.feature-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 2rem;
  position: relative;
  transition: all 0.3s;
  transform: rotate(var(--rotation, 0deg));
}

.feature-card:hover {
  transform: rotate(0deg) translateY(-5px);
  border-color: var(--accent-orange);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.feature-card-large {
  grid-row: span 2;
}

.feature-card-medium {
  grid-column: 1;
}

.feature-card-small {
  grid-column: 2;
}

.card-header {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 1rem;
}

.card-number-sketch {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.number-circle {
  width: 100%;
  height: 100%;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--accent-orange);
  letter-spacing: -0.02em;
}

.card-description {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.card-link {
  display: inline-flex;
  align-items: center;
  color: var(--accent-teal);
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s;
}

.card-link:hover {
  color: var(--accent-orange);
  gap: 0.5rem;
}

.card-sketch-decoration {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 80px;
  opacity: 0.5;
}

/* ========= 反AI彩蛋 ========= */
.anti-ai-widget {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  width: 280px;
  background: var(--bg-card);
  border: 2px solid var(--accent-yellow);
  padding: 1.5rem;
  z-index: 1000;
  transform: rotate(1deg);
}

.anti-ai-widget:hover {
  transform: rotate(0deg);
}

.anti-ai-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.anti-ai-icon {
  font-size: 1.2rem;
}

.anti-ai-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent-yellow);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ========= 响应式适配 ========= */
@media (max-width: 1024px) {
  .hero-section {
    flex-direction: column;
    gap: 3rem;
  }

  .route-sketch {
    width: 100%;
    max-width: 400px;
  }

  .features-section {
    grid-template-columns: 1fr;
  }

  .feature-card-small,
  .feature-card-medium {
    grid-column: 1;
    margin-left: 0 !important;
    margin-top: 0 !important;
  }

  .anti-ai-widget {
    display: none;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1.5rem 1rem;
  }

  .hero-section {
    padding-top: 1rem;
    margin-bottom: 3rem;
  }

  .hero-badge {
    font-size: 0.65rem;
    padding: 0.3rem 0.8rem;
    margin-bottom: 1rem;
  }

  .hero-title {
    font-size: 2.2rem;
    margin-bottom: 1rem;
  }

  .hero-subtitle {
    font-size: 1rem;
    margin-bottom: 2rem;
  }

  .hero-content {
    max-width: 100%;
  }

  .route-sketch {
    width: 100%;
    max-width: 300px;
    padding: 1rem;
  }

  .sketch-label {
    font-size: 0.8rem;
  }

  .hero-actions {
    flex-direction: column;
    gap: 0.8rem;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
    padding: 0.9rem 1.5rem;
    font-size: 0.95rem;
  }

  .features-section {
    gap: 1.5rem;
  }

  .feature-card {
    padding: 1.5rem;
  }

  .feature-card-large {
    grid-row: auto;
  }

  .card-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .card-number-sketch {
    width: 30px;
    height: 30px;
  }

  .card-title {
    font-size: 1.3rem;
  }

  .card-description {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .anti-ai-widget {
    display: none;
  }

  .anti-ai-quote {
    font-size: 0.85rem;
  }

  .hand-drawn-grid {
    display: none;
  }

  .noise-bg {
    opacity: 0.02;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 1rem 0.8rem;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .hero-badge {
    font-size: 0.6rem;
  }

  .hero-subtitle {
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.8rem 1.2rem;
    font-size: 0.9rem;
    border-width: 2px;
  }

  .route-sketch {
    max-width: 260px;
  }

  .feature-card {
    padding: 1.2rem;
  }

  .card-title {
    font-size: 1.2rem;
  }

  .card-description {
    font-size: 0.85rem;
  }

  .anti-ai-widget {
    display: none;
  }

  .floating-tooltip {
    font-size: 0.7rem;
    padding: 0.4rem 0.8rem;
  }
}

/* 小屏高度设备 */
@media (max-width: 380px) {
  .hero-title {
    font-size: 1.6rem;
  }

  .hero-section {
    margin-bottom: 2rem;
  }

  .feature-card {
    padding: 1rem;
  }
}
</style>
