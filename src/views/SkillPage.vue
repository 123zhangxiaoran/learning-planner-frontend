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

    <!-- 主内容区域 - 左右分栏 -->
    <main class="main-content">
      <div class="split-layout">
        <!-- 左侧：对话区域 -->
        <section class="left-panel">
          <AIDialog
            titleBadge="技能学习"
            title="分析你的技能树"
            subtitle="告诉我你想掌握的技能，我来为你规划学习路径"
            highlightText="选择技能开始你的提升计划。"
            placeholder="想学什么技能？小顾问来帮你鉴赏一番~"
            :isLoading="isSendingMessage"
            @sendMessage="handleSendMessage"
            @cancel="cancelSendMessage"
          >
            <!-- 标题右侧插槽：返回按钮 -->
            <template #header-right>
              <router-link to="/user/career" class="back-btn"> ⬅ 返回职业选择 </router-link>
            </template>

            <!-- AI消息（技能列表加载完成后显示） -->
            <div v-if="!isLoading && skillOptions.length > 0" class="message ai-message">
              <div class="message-bubble">
                <p>右侧是推荐技能，也可以和我聊聊，帮你找到最适合的：</p>
                <ul class="suggestions">
                  <li>"我想学HTML"</li>
                  <li>"我想设计一个壮观的页面"</li>
                  <li>"我在逻辑处理上有点兴趣"</li>
                </ul>
              </div>
            </div>

            <!-- 加载状态（AI思考中） -->
            <div v-if="isLoading" class="message ai-message">
              <div class="message-bubble">
                <p>技能小顾问正在整理技能列表...</p>
              </div>
            </div>

            <!-- 对话记录 -->
            <div v-for="(record, idx) in chatRecords" :key="idx" class="chat-record">
              <!-- 用户消息 -->
              <div class="message user-message">
                <div class="message-bubble">
                  <p>{{ record.userMessage }}</p>
                </div>
              </div>
              <!-- AI 回复 -->
              <div v-if="record.aiReply" class="message ai-message">
                <div class="message-bubble">
                  <p>{{ record.aiReply }}</p>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="skillOptions.length === 0 && !isLoading" class="empty-state">
              <div class="empty-icon">📚</div>
              <h3>暂无技能数据</h3>
              <p>请先从职业选择页面选择感兴趣的岗位</p>
            </div>
          </AIDialog>
        </section>

        <!-- 右侧：数据卡片区域 -->
        <section class="right-panel">
          <div class="panel-header">
            <h3 class="panel-title">技能列表</h3>
            <span class="panel-subtitle" v-if="selectedSkills.length > 0">
              已选择 {{ selectedSkills.length }} 个技能
            </span>
          </div>

          <!-- 加载状态 -->
          <div v-if="isLoading" class="right-loading-state">
            <div class="loading-spinner"></div>
            <p>正在加载技能数据...</p>
          </div>

          <!-- 技能卡片列表 -->
          <div v-else-if="skillOptions.length > 0" class="skill-cards-container">
            <div v-for="job in skillOptions" :key="job.id" class="skill-card">
              <!-- 岗位头部信息 -->
              <div class="card-header" @click="toggleJobCollapse(job.id)">
                <h4 class="card-title">
                  {{ job.name }}
                  <span class="job-selected-count-inline"
                    >({{
                      getJobSelectedCount(job) > 0
                        ? '已选' + getJobSelectedCount(job) + '个'
                        : '未选择'
                    }})</span
                  >
                </h4>
                <div class="card-header-right">
                  <span class="card-badge">{{ job.major }}</span>
                  <span
                    class="collapse-icon"
                    :class="{ collapsed: collapsedJobs.includes(job.id) }"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>

              <!-- 技能列表 -->
              <div class="card-skills" v-show="!collapsedJobs.includes(job.id)">
                <div
                  v-for="(skillItem, idx) in job.skillList"
                  :key="idx"
                  class="card-skill-item"
                  :class="{ selected: selectedSkills.includes(skillItem.name) }"
                  @click="toggleSkill(skillItem.name)"
                >
                  <div class="skill-info">
                    <span class="skill-name">{{ skillItem.name }}</span>
                    <span class="skill-desc">{{ skillItem.description }}</span>
                  </div>
                  <div class="skill-check" v-if="selectedSkills.includes(skillItem.name)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <path d="M5 12l5 5L20 7" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="right-empty-state">
            <div class="empty-icon">📚</div>
            <p>暂无技能数据</p>
          </div>

          <!-- 底部操作栏 -->
          <div class="panel-footer" v-if="skillOptions.length > 0">
            <button class="action-btn" :class="{ disabled: selectedSkills.length === 0 }">
              生成学习计划
            </button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/layout/NavBar.vue'
import AIDialog from '@/components/ai/AIDialog.vue'
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useCareerStore } from '@/stores/career'
import { usePlayerStore } from '@/stores/user'
import { saveJobAndSearchRAG, submitUserMessage, getUserJobData } from '@/api/agent'
import type { SkillItem } from '@/api/agent/types'

const route = useRoute()
const careerStore = useCareerStore()
const playerStore = usePlayerStore()

const selectedSkills = ref<string[]>([])
const skillsData = ref<SkillItem[]>([])
const isLoading = ref(false)
const selectedJobNames = ref<string[]>([])
const collapsedJobs = ref<number[]>([])

// 初始化时将所有岗位设为折叠状态
const initCollapsedJobs = () => {
  collapsedJobs.value = skillOptions.value.map((job) => job.id)
}

// 将后端返回的技能数据转换为展示格式，按点击顺序排序
const skillOptions = computed(() => {
  // 按照 selectedJobNames 的顺序对技能数据进行排序
  const orderedSkills = selectedJobNames.value
    .map((jobName) => {
      return skillsData.value.find((skill) => skill.job_name === jobName)
    })
    .filter(Boolean)

  return orderedSkills.map((skill, index) => ({
    id: index + 1,
    name: skill!.job_name,
    skillList: skill!.skills,
    major: skill!.major,
    score: skill!.score,
  }))
})

// 切换技能选择
const toggleSkill = (skillItem: string) => {
  const index = selectedSkills.value.indexOf(skillItem)
  if (index > -1) {
    selectedSkills.value.splice(index, 1)
  } else {
    selectedSkills.value.push(skillItem)
  }
}

// 展开岗位并定位到指定技能
const expandAndScrollToSkill = (skillName: string) => {
  nextTick(() => {
    // 找到技能所在的岗位
    const jobWithSkill = skillOptions.value.find((job) =>
      job.skillList.some((skill) => skill.name === skillName),
    )
    if (!jobWithSkill) return

    // 如果岗位是折叠的，先展开
    if (collapsedJobs.value.includes(jobWithSkill.id)) {
      toggleJobCollapse(jobWithSkill.id)
    }

    // 等待展开动画完成后滚动到技能位置
    setTimeout(() => {
      const skillElements = document.querySelectorAll('.card-skill-item') as NodeListOf<HTMLElement>
      skillElements.forEach((el) => {
        const nameEl = el.querySelector('.skill-name')
        if (nameEl && nameEl.textContent === skillName) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      })
    }, 100)
  })
}

// 切换岗位折叠状态
const toggleJobCollapse = (jobId: number) => {
  const index = collapsedJobs.value.indexOf(jobId)
  if (index > -1) {
    collapsedJobs.value.splice(index, 1)
  } else {
    collapsedJobs.value.push(jobId)
  }
}

// 获取岗位下已选择的技能数量
const getJobSelectedCount = (job: { skillList: { name: string }[] }) => {
  return job.skillList.filter((skill) => selectedSkills.value.includes(skill.name)).length
}

onMounted(async () => {
  const jobNamesParam = route.query.jobNames as string
  const storeJobNames = careerStore.selectedJobNames

  // 优先使用 query 参数，否则使用 store 中的数据
  let jobNames = jobNamesParam ? jobNamesParam.split(',') : storeJobNames

  // 如果没有数据，发送阻塞请求获取用户数据
  if (
    (!jobNamesParam && (!storeJobNames || storeJobNames.length === 0)) ||
    (storeJobNames && storeJobNames.length === 0)
  ) {
    const userId = playerStore.playerInfo?.id
    if (userId) {
      isLoading.value = true
      try {
        const res = await getUserJobData(userId)
        if (res.code === 200 && res.data) {
          // data 是 JSON 字符串，需要先解析
          const responseData = JSON.parse(res.data as unknown as string)
          // 后端返回 jobNames 和 skills
          jobNames = responseData.query || []
          selectedJobNames.value = jobNames

          // 保存岗位名称到 store
          if (jobNames.length > 0) {
            careerStore.setJobNames(jobNames)
          }

          // 直接使用后端返回的技能数据
          skillsData.value = responseData.skills || []
          initCollapsedJobs()
        }
      } catch (error) {
        console.error('获取用户数据失败:', error)
      } finally {
        isLoading.value = false
      }
    }

    // 仍然没有数据则返回
    if (!jobNames || jobNames.length === 0) {
      return
    }
  } else {
    // 有数据时直接请求技能列表
    selectedJobNames.value = jobNames
    isLoading.value = true
    try {
      const res = await saveJobAndSearchRAG(jobNames)
      if (res.code === 200) {
        const responseData = JSON.parse(res.data as unknown as string)
        skillsData.value = responseData.skills || []
        initCollapsedJobs()
      }
    } catch (error) {
      console.error('RAG 检索失败:', error)
    } finally {
      isLoading.value = false
    }
  }
})

// 对话记录，每个记录包含用户消息和AI回复
interface ChatRecord {
  userMessage: string
  aiReply?: string
}
const chatRecords = ref<ChatRecord[]>([])
const isSendingMessage = ref(false)

// AbortController 用于取消请求
let abortController: AbortController | null = null

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    const chatContainer = document.querySelector('.left-panel .chat-container')
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  })
}

const handleSendMessage = async (message: string) => {
  // 添加新的对话记录
  chatRecords.value.push({ userMessage: message })
  isSendingMessage.value = true

  // 滚动到底部
  scrollToBottom()

  // 创建新的 AbortController
  abortController = new AbortController()

  // 获取岗位名称：优先使用 URL 参数，否则使用 store 中的数据
  const jobNamesParam = route.query.jobNames as string
  const storeJobNames = careerStore.selectedJobNames
  const jobNames = jobNamesParam ? jobNamesParam.split(',') : storeJobNames

  // 调用接口提交用户消息，并添加3秒延迟给后端处理时间
  try {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    const res = await submitUserMessage({ text: message, job_names: jobNames })
    if (res.code === 200 && res.data) {
      // res.data 是 JSON 字符串，需要先解析
      const responseData = JSON.parse(res.data as unknown as string)
      const skillName = responseData.best_match_skill
      if (skillName) {
        // 更新最后一条对话记录的 AI 回复
        const lastRecord = chatRecords.value[chatRecords.value.length - 1]
        if (lastRecord) {
          // 随机选择一句回复
          const replies = [
            `你想要学的是${skillName}吧，我帮你选中啦！`,
            `${skillName}真的很适合你，我帮你拿下它！`,
            `经过我的思考，${skillName}很符合你的期望，我帮你选中它。`,
            `我觉得${skillName}特别适合你，已经帮你选好了！`,
            `选${skillName}准没错，我帮你点上啦！`,
          ]
          lastRecord.aiReply = replies[Math.floor(Math.random() * replies.length)]
          scrollToBottom()
          // 自动选中技能，并展开定位
          if (!selectedSkills.value.includes(skillName)) {
            selectedSkills.value.push(skillName)
            expandAndScrollToSkill(skillName)
          }
        }
      } else {
        // 没有匹配到技能，给出友好提示
        const lastRecord = chatRecords.value[chatRecords.value.length - 1]
        if (lastRecord) {
          const noMatchReplies = [
            `嗯...你说的这个好像和你选的岗位不太搭哦，看看右侧有没有心仪的？`,
            `你这个问题和选的岗位没太对上，看看右侧技能列表挑一个？`,
            `你选的岗位里没有很匹配这个的，不妨看看右侧自己选一个？`,
            `这个问题和你的岗位方向不太一致，看看右边有没有感兴趣的技能？`,
          ]
          lastRecord.aiReply = noMatchReplies[Math.floor(Math.random() * noMatchReplies.length)]
          scrollToBottom()
        }
      }
    }
  } catch (error: unknown) {
    // 判断是否是用户主动取消
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('请求已取消')
      // 移除最后一条对话记录
      chatRecords.value.pop()
    } else {
      console.error('消息提交失败:', error)
    }
  } finally {
    isSendingMessage.value = false
    abortController = null
  }
}

// 取消发送
const cancelSendMessage = () => {
  if (isSendingMessage.value && abortController) {
    abortController.abort()
    abortController = null
    isSendingMessage.value = false
  }
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2% 3rem 2%;
  height: calc(100vh - 80px);
}

/* ========= 左右分栏布局 ========= */
.split-layout {
  display: flex;
  gap: 2rem;
  height: 100%;
}

/* 左侧对话面板 */
.left-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.left-panel :deep(.ai-dialog-section) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.left-panel :deep(.chat-container) {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

/* 右侧数据面板 */
.right-panel {
  width: 420px;
  flex-shrink: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: visible;
  max-height: calc(100vh - 120px);
}

.panel-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-dark);
}

.panel-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.panel-subtitle {
  font-size: 0.85rem;
  color: var(--accent-teal);
  font-weight: 600;
}

.skill-cards-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
  scroll-behavior: smooth;
}

/* 自定义滚动条样式 */
.skill-cards-container::-webkit-scrollbar {
  width: 6px;
}

.skill-cards-container::-webkit-scrollbar-track {
  background: transparent;
}

.skill-cards-container::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.skill-cards-container::-webkit-scrollbar-thumb:hover {
  background: var(--accent-teal);
}

/* 技能卡片 */
.skill-card {
  background: var(--bg-dark);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: visible;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.skill-card:hover {
  border-color: var(--accent-teal);
  box-shadow: 0 4px 15px rgba(46, 196, 182, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(46, 196, 182, 0.1);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
}

.card-header:hover {
  background: rgba(46, 196, 182, 0.2);
}

.card-header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.collapse-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: transform 0.3s ease;
}

.collapse-icon svg {
  width: 16px;
  height: 16px;
}

.collapse-icon.collapsed {
  transform: rotate(-90deg);
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.job-selected-count-inline {
  font-size: 0.75rem;
  color: var(--accent-teal);
  font-weight: 600;
  margin-left: 0.5rem;
}

.card-badge {
  font-size: 0.7rem;
  background: var(--accent-orange);
  color: var(--bg-dark);
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-weight: 600;
}

.card-skills {
  padding: 0.75rem;
}

.card-skill-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  pointer-events: auto;
}

.card-skill-item:last-child {
  margin-bottom: 0;
}

.card-skill-item:hover {
  border-color: var(--accent-teal);
  background: rgba(46, 196, 182, 0.05);
}

.card-skill-item.selected {
  background: rgba(255, 107, 53, 0.1);
  border-color: var(--accent-orange);
}

.skill-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
  min-width: 0;
}

.skill-info .skill-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.card-skill-item.selected .skill-info .skill-name {
  color: var(--accent-orange);
}

.skill-info .skill-desc {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  box-orient: vertical;
  overflow: hidden;
}

.skill-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent-orange);
  color: var(--bg-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.skill-check svg {
  width: 12px;
  height: 12px;
}

/* 右侧面板底部 */
.panel-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-dark);
}

.action-btn {
  width: 100%;
  background: var(--accent-orange);
  color: var(--bg-dark);
  border: none;
  padding: 0.9rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
}

.action-btn.disabled {
  background: var(--border-color);
  color: var(--text-secondary);
  cursor: not-allowed;
}

/* 右侧面板加载状态 */
.right-loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  max-height: calc(100vh - 280px);
  overflow-y: auto;
}

.right-empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  text-align: center;
}

.right-empty-state .empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.right-empty-state p {
  font-size: 0.9rem;
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

/* AI加载气泡 */

/* ========= 消息气泡样式 ========= */
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

.message-bubble {
  max-width: 70%;
  background: var(--bg-dark);
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

.message.user-message .message-bubble {
  background: var(--accent-orange);
  color: var(--bg-dark);
  border: none;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
  user-select: text;
}

/* ========= 岗位大卡片布局 ========= */
.job-cards {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 2rem 0;
}

.job-card {
  background: var(--bg-dark);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s ease;
}

.job-card:hover {
  border-color: var(--accent-teal);
  box-shadow: 0 8px 25px rgba(46, 196, 182, 0.1);
}

/* 岗位头部 */
.job-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.job-info {
  flex: 1;
}

.job-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.job-stats {
  display: flex;
  gap: 1rem;
}

.job-stats .stat {
  background: rgba(255, 107, 53, 0.1);
  color: var(--accent-orange);
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
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

/* 技能区域 */
.skills-section {
  margin-top: 1rem;
}

.skills-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.8rem;
}

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.skill-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.8rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.skill-item:hover {
  border-color: var(--accent-teal);
  background: rgba(46, 196, 182, 0.1);
}

.skill-item.selected {
  background: rgba(255, 107, 53, 0.15);
  border-color: var(--accent-orange);
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.2);
}

.skill-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.skill-item.selected .skill-name {
  color: var(--accent-orange);
}

.skill-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* ========= 选择信息 ========= */
.selection-info {
  text-align: center;
  margin-bottom: 1rem;
}

.selection-count {
  font-size: 0.9rem;
  color: var(--accent-teal);
  font-weight: 600;
}

/* ========= 下一步按钮 ========= */
.next-step {
  display: flex;
  flex-direction: column;
  align-items: center;
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

/* ========= 选项头部 ========= */
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

/* ========= 加载状态 ========= */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-teal);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ========= 空状态 ========= */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.empty-state h3 {
  color: var(--text-primary);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

/* ========= 返回按钮 ========= */
.back-btn {
  display: inline-block;
  background: var(--accent-teal);
  color: var(--bg-dark);
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  white-space: nowrap;
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
@media (max-width: 1024px) {
  .split-layout {
    flex-direction: column;
  }

  .right-panel {
    width: 100%;
    max-height: 400px;
  }

  .left-panel :deep(.chat-container) {
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1.5rem 1rem;
    height: auto;
  }

  .split-layout {
    flex-direction: column;
    height: auto;
  }

  .right-panel {
    width: 100%;
    max-height: none;
  }

  .skill-content {
    padding: 2rem;
  }

  .empty-icon {
    font-size: 3rem;
  }
}
</style>
