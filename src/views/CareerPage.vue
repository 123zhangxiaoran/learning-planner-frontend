<template>
  <div class="career-container">
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

    <!-- AI对话区域 -->
    <main class="main-content">
      <section class="ai-dialog-section">
        <!-- 标题区域 -->
        <div class="section-header">
          <div class="header-badge">AI 职业顾问</div>
          <h1 class="section-title">助你选择合适岗位</h1>
          <p class="section-subtitle">
            基于你的专业和兴趣，AI为你筛选匹配的就业方向<br />
            <span class="highlight">快速了解岗位要求和就业前景。</span>
          </p>
        </div>

        <!-- 对话气泡区域 -->
        <div class="chat-container">
          <!-- AI消息 -->
          <div class="message ai-message">
            <div class="message-bubble">
              <p>你好！我是职业规划AI助手。你可以问我：</p>
              <ul class="suggestions">
                <li>"我的专业是计算机科学"</li>
                <li>"我对数据分析感兴趣"</li>
                <li>"我喜欢和数字打交道"</li>
              </ul>
            </div>
          </div>

          <!-- 用户消息 -->
          <div v-if="userMessage" class="message user-message">
            <div class="message-bubble">
              <p>{{ userMessage }}</p>
            </div>
          </div>

          <!-- AI回复消息 -->
          <div v-if="aiMessage" class="message ai-message">
            <div class="message-bubble">
              <p>{{ aiMessage }}</p>
            </div>
          </div>

          <!-- 静态数据展示区域 -->
          <div v-if="showCareerOptions" class="career-options">
            <div class="options-header">
              <div class="options-badge">为你推荐</div>
              <h3>{{ careerOptions[0]?.major || '技术开发' }}相关职业</h3>
            </div>

            <div class="career-grid">
              <div
                v-for="career in careerOptions"
                :key="career.id"
                class="career-card"
                @click="viewCareerDetail(career.id)"
              >
                <h4 class="card-title">{{ career.title }}</h4>
                <p class="card-description">{{ career.description }}</p>
                <div class="card-stats">
                  <span class="stat">专业: {{ career.major }}</span>
                  <span class="stat">匹配度: {{ Math.round(career.similarity * 100) }}%</span>
                </div>
                <div class="card-sketch">
                  <svg viewBox="0 0 100 40">
                    <path
                      d="M10,20 Q30,10 50,20 T90,20"
                      stroke="#2ec4b6"
                      stroke-width="1.5"
                      fill="none"
                      stroke-dasharray="3,2"
                    />
                  </svg>
                </div>
                <div class="card-action">
                  <button
                    class="action-btn"
                    :class="{ active: selectedCareer === career.id }"
                    @click.stop="selectCareer(career.id)"
                  >
                    {{ selectedCareer === career.id ? '✓ 确定选择' : '选这个' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 下一步按钮 -->
            <div class="next-step-container" v-if="showCareerOptions">
              <button class="next-step-btn" @click="goToSkillPage">
                <span class="next-step-text">开始分析技能路径</span>
                <span class="next-step-arrow">→</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <ChatInput
          v-model="userInput"
          placeholder="你现在的专业是什么？或者对哪些方向感兴趣..."
          @send="sendMessage"
        />
      </section>
    </main>

    <!-- 浮动装饰元素 -->
    <div class="floating-decoration">
      <div class="decoration-item">💼</div>
      <div class="decoration-item">📊</div>
      <div class="decoration-item">🚀</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/layout/NavBar.vue'
import ChatInput from '@/components/layout/ChatInput.vue'
import { sendChatMessage } from '@/api/agent'
import type { CareerOption, JobInfo } from '@/api/agent/types'

const router = useRouter()

// 静态数据
const userInput = ref('')
const showCareerOptions = ref(false)
const userMessage = ref('')
const aiMessage = ref('')

// 职业选项数据
const careerOptions = ref<CareerOption[]>([])

// 发送消息
const sendMessage = async () => {
  if (userInput.value.trim()) {
    userMessage.value = userInput.value
    const major = userInput.value
    userInput.value = ''

    try {
      const res = await sendChatMessage({ major: major })
      if (res.code === 200) {
        // res.data 是 JSON 字符串，需要先解析
        const responseData = JSON.parse(res.data as unknown as string)
        const jobs: JobInfo[] = responseData.jobs
        // 转换为前端展示用的careerOptions
        careerOptions.value = jobs.map((job, index) => ({
          id: index + 1,
          title: job.job_name,
          description: job.job_description,
          major: job.major,
          similarity: job.similarity / 100, // 后端返回的是百分比，转为0-1
        }))
        showCareerOptions.value = true
      }
    } catch (error) {
      console.error('发送消息失败:', error)
    }
  }
}

// 查看职业详情（静态函数）
const viewCareerDetail = (careerId: number) => {
  console.log('查看职业详情:', careerId)
}

// 选择职业（交互按钮）
const selectedCareer = ref<number | null>(null)
const selectCareer = (careerId: number) => {
  selectedCareer.value = selectedCareer.value === careerId ? null : careerId
}

// 跳转到技能页面
const goToSkillPage = () => {
  router.push('/user/skill')
}
</script>

<style scoped>
/* ========= CSS变量定义 ========= */
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

/* ========= 基础样式 ========= */
.career-container {
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
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1rem 1.5rem;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.message.ai-message .message-bubble {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

/* 用户消息气泡样式 */

.message.user-message .message-bubble {
  background: var(--accent-orange);
  color: var(--bg-dark);
  border: none;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
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

/* ========= 职业选项区域 ========= */
.career-options {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px dashed var(--border-color);
}

.options-header {
  margin-bottom: 1.5rem;
}

.options-badge {
  display: inline-block;
  background: var(--accent-teal);
  color: var(--bg-dark);
  padding: 0.3rem 0.8rem;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 12px;
  margin-bottom: 0.5rem;
}

.options-header h3 {
  color: var(--text-primary);
  font-size: 1.3rem;
  font-weight: 700;
}

/* 职业卡片网格 */
.career-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.career-card {
  background: var(--bg-dark);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
  transform: rotate(var(--rotation, 0deg));
}

.career-card:hover {
  transform: rotate(0deg) translateY(-5px);
  border-color: var(--accent-orange);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.card-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  background: rgba(46, 196, 182, 0.1);
  color: var(--accent-teal);
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.card-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat {
  background: rgba(255, 107, 53, 0.1);
  color: var(--accent-orange);
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.card-link {
  color: var(--accent-teal);
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.career-card:hover .card-link {
  color: var(--accent-orange);
}

.card-sketch {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  width: 40px;
  opacity: 0.3;
}

/* ========= 卡片动作区域 ========= */
.card-action {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
}

.action-btn {
  background: rgba(46, 196, 182, 0.1);
  border: 2px solid var(--accent-teal);
  color: var(--accent-teal);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 80px;
}

.action-btn:hover {
  background: var(--accent-teal);
  color: var(--bg-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 196, 182, 0.3);
}

.action-btn.active {
  background: var(--accent-orange);
  border-color: var(--accent-orange);
  color: var(--bg-dark);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

/* ========= 下一步按钮 ========= */
.next-step-container {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px dashed var(--border-color);
  animation: fadeInUp 0.6s ease;
}

.next-step-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(145deg, var(--accent-orange), #e5562b);
  color: var(--bg-dark);
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
}

.next-step-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 107, 53, 0.5);
  background: linear-gradient(145deg, #ff7b4f, #ff6b35);
}

.next-step-icon {
  font-size: 1.3rem;
}

.next-step-text {
  font-size: 1rem;
}

.next-step-arrow {
  font-size: 1.2rem;
  font-weight: 900;
  transition: transform 0.3s ease;
}

.next-step-btn:hover .next-step-arrow {
  transform: translateX(5px);
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
@media (max-width: 1024px) {
  .main-content {
    padding: 2rem 5%;
  }

  .section-title {
    font-size: 2.5rem;
  }

  .career-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1.5rem 1rem;
  }

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

  .floating-decoration {
    display: none;
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

  .career-card {
    padding: 1rem;
  }

  .card-title {
    font-size: 1.1rem;
  }

  .card-description {
    font-size: 0.85rem;
  }
}
</style>
