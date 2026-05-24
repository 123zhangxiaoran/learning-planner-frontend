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
            titleBadge="AI小顾问"
            title="技能学习助手"
            subtitle="我是你的AI学习小顾问，帮你规划成长路径"
            highlightText=""
            placeholder="告诉我你想学什么，小顾问来帮你规划~"
            :isLoading="isSendingMessage"
            :disabled="!isSkillConfirmed || hasUnansweredQuestion"
            :waitingForAnswer="hasUnansweredQuestion"
            :hideHeader="hasEverConfirmed"
            @sendMessage="handleSendMessage"
            @cancel="cancelSendMessage"
          >
            <!-- AI消息（技能列表加载完成后显示） -->
            <div v-if="!isLoading && skillOptions.length > 0" class="message ai-message">
              <div class="message-bubble">
                <p>确认一个技能之后生成学习规划。</p>
                <p>生成之后可以和我说：</p>
                <ul class="suggestions">
                  <li>"你好啊，你叫什么名字"</li>
                  <li>"帮我出一个基础题的选择题"</li>
                  <li>"这个知识点不太懂，帮我生成讲解视频"</li>
                </ul>
              </div>
            </div>

            <!-- 加载状态（AI思考中） -->
            <div v-if="isLoading" class="message ai-message">
              <div class="message-bubble">
                <p>小顾问正在整理技能列表，稍等一下哦~</p>
              </div>
            </div>

            <!-- 对话记录 -->
            <div v-for="(record, idx) in chatRecords" :key="idx" class="chat-record">
              <!-- 用户消息 -->
              <div v-if="record.userMessage" class="message user-message">
                <div class="message-bubble">
                  <p>{{ record.userMessage }}</p>
                </div>
              </div>
              <!-- AI 回复 -->
              <div v-if="record.aiReply || record.stem" class="message ai-message">
                <div class="message-bubble">
                  <!-- 普通文本回复 -->
                  <pre
                    v-if="record.aiReply && !record.stem && !record.options?.length"
                    :class="{ 'wave-animation': record.aiReply.endsWith('....') }"
                    style="white-space: pre-wrap; margin: 0; font-family: inherit"
                  ><span v-if="record.aiReply.endsWith('....')" :key="waveKey" @animationend="onDotAnimationEnd($event)">{{ splitWaveText(record.aiReply).prefix }}<span v-for="d in splitWaveText(record.aiReply).dots" :key="d.index" class="wave-char" :style="{ animationDelay: d.delay }">{{ d.char }}</span></span><span v-else>{{ record.aiReply }}</span></pre>
                  <!-- PPT幻灯片展示（已注释）
                  <div v-if="record.pptSlides && record.pptSlides.length > 0" class="ppt-viewer">
                    ...
                  </div>
                  -->
                  <!-- AI文本 + 选项（没有stem时） -->
                  <div v-if="record.aiReply && record.options?.length" class="ai-with-options">
                    <div
                      :class="{
                        'ai-text': true,
                        'wave-animation': record.aiReply.endsWith('....'),
                      }"
                    >
                      <span
                        v-if="record.aiReply.endsWith('....')"
                        :key="waveKey"
                        @animationend="onDotAnimationEnd($event)"
                        >{{ splitWaveText(record.aiReply).prefix
                        }}<span
                          v-for="d in splitWaveText(record.aiReply).dots"
                          :key="d.index"
                          class="wave-char"
                          :style="{ animationDelay: d.delay }"
                          >{{ d.char }}</span
                        ></span
                      ><span v-else>{{ record.aiReply }}</span>
                    </div>
                    <div class="question-options options-count-2">
                      <template v-for="(opt, idx) in record.options" :key="idx">
                        <button
                          v-if="record.selectedOption === undefined"
                          class="option-btn"
                          @click="handleOptionClick(record, idx)"
                        >
                          {{ opt }}
                        </button>
                        <span
                          v-else
                          class="option-text"
                          :class="{
                            selected: record.selectedOption === idx,
                            correct: record.selectedOption === idx && record.isCorrect === true,
                            wrong: record.selectedOption === idx && record.isCorrect === false,
                          }"
                        >
                          {{ opt }}
                        </span>
                      </template>
                    </div>
                  </div>
                  <!-- 题目格式回复（有stem时显示） -->
                  <div v-if="record.stem" class="question-content">
                    <div
                      v-if="record.aiReply"
                      :class="{
                        'ai-text': true,
                        'wave-animation': record.aiReply.endsWith('....'),
                      }"
                    >
                      <span
                        v-if="record.aiReply.endsWith('....')"
                        :key="waveKey"
                        @animationend="onDotAnimationEnd($event)"
                        >{{ splitWaveText(record.aiReply).prefix
                        }}<span
                          v-for="d in splitWaveText(record.aiReply).dots"
                          :key="d.index"
                          class="wave-char"
                          :style="{ animationDelay: d.delay }"
                          >{{ d.char }}</span
                        ></span
                      ><span v-else>{{ record.aiReply }}</span>
                    </div>
                    <div v-if="record.type" class="question-type">{{ record.type }}</div>
                    <div class="question-stem">{{ record.stem }}</div>
                    <!-- 代码片段（如果有）-->
                    <pre v-if="record.codeSnippet" class="code-snippet">{{
                      record.codeSnippet
                    }}</pre>
                    <!-- 填空题显示输入框 -->
                    <div v-if="record.type === '填空题'" class="fill-blank-input">
                      <template v-if="record.selectedOption === undefined">
                        <input
                          v-model="record.fillAnswer"
                          type="text"
                          placeholder="请输入答案"
                          @keyup.enter="submitFillAnswer(record)"
                        />
                        <button class="confirm-btn" @click="submitFillAnswer(record)">确认</button>
                      </template>
                      <span
                        v-else
                        class="submitted-answer"
                        :class="{
                          correct: record.isCorrect === true,
                          wrong: record.isCorrect === false,
                        }"
                      >
                        答案：{{ record.fillAnswer }}
                      </span>
                    </div>
                    <!-- 分析题显示输入框 -->
                    <div v-else-if="record.type === '分析题'" class="fill-blank-input">
                      <template v-if="record.selectedOption === undefined">
                        <input
                          v-model="record.fillAnswer"
                          type="text"
                          placeholder="请输入答案"
                          @keyup.enter="submitFillAnswer(record)"
                        />
                        <button class="confirm-btn" @click="submitFillAnswer(record)">确认</button>
                      </template>
                      <span
                        v-else
                        class="submitted-answer"
                        :class="{
                          correct: record.isCorrect === true,
                          wrong: record.isCorrect === false,
                        }"
                      >
                        答案：{{ record.fillAnswer }}
                      </span>
                    </div>
                    <!-- 其他题型显示选项 -->
                    <div
                      v-else-if="record.options && record.options.length > 0"
                      class="question-options"
                      :class="'options-count-' + record.options.length"
                    >
                      <template v-for="(opt, idx) in record.options" :key="idx">
                        <button
                          v-if="record.selectedOption === undefined"
                          class="option-btn"
                          @click="handleOptionClick(record, idx)"
                        >
                          {{ opt }}
                        </button>
                        <span
                          v-else
                          class="option-text"
                          :class="{
                            selected: record.selectedOption === idx,
                            correct: record.selectedOption === idx && record.isCorrect === true,
                            wrong: record.selectedOption === idx && record.isCorrect === false,
                          }"
                        >
                          {{ opt }}
                        </span>
                      </template>
                    </div>
                    <!-- 答案解析（用户回答后显示）-->
                    <div
                      v-if="record.selectedOption !== undefined && record.explanation"
                      class="answer-explanation"
                    >
                      <div
                        class="explanation-title"
                        :class="{
                          correct: record.isCorrect === true,
                          wrong: record.isCorrect === false,
                        }"
                      >
                        {{
                          record.isCorrect === true
                            ? '✓ 回答正确'
                            : record.isCorrect === false
                              ? '✗ 回答错误'
                              : ''
                        }}
                      </div>
                      <div class="explanation-content">
                        <div class="correct-answer">
                          <span class="label-text">正确答案：</span>{{ record.correctAnswer }}
                        </div>
                        <div class="explanation-text">{{ record.explanation }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="skillOptions.length === 0 && !isLoading" class="empty-state">
              <div class="empty-icon">📚</div>
              <h3>暂无技能数据</h3>
              <p>小顾问提醒：请先从职业选择页面选择感兴趣的岗位哦~</p>
            </div>
          </AIDialog>
        </section>

        <!-- 右侧：数据卡片区域 -->
        <section class="right-panel">
          <div class="panel-header">
            <h3 class="panel-title">技能列表</h3>
          </div>

          <!-- 加载状态 -->
          <div v-if="isLoading" class="right-loading-state">
            <div class="loading-spinner"></div>
            <p class="wave-animation">
              <span :key="waveKey" @animationend="onDotAnimationEnd($event)">
                {{ splitWaveText('正在加载技能数据....').prefix
                }}<span
                  v-for="d in splitWaveText('正在加载技能数据....').dots"
                  :key="d.index"
                  class="wave-char"
                  :style="{ animationDelay: d.delay }"
                  >{{ d.char }}</span
                >
              </span>
            </p>
          </div>

          <!-- 技能卡片列表 -->
          <div v-else-if="skillOptions.length > 0" class="skill-cards-container">
            <div v-for="job in skillOptions" :key="job.id" class="skill-card">
              <!-- 岗位头部信息 -->
              <div class="card-header" @click="toggleJobCollapse(job.id)">
                <h4 class="card-title">
                  {{ job.name }}
                  <span
                    class="job-selected-count-inline"
                    :class="{ selected: getJobSelectedCount(job) > 0 }"
                    >({{ getJobSelectedCount(job) > 0 ? '已选择' : '未选择' }})</span
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
                    <span v-if="skillItem.difficulty" class="skill-difficulty">
                      <span class="difficulty-label" :class="'level-' + skillItem.difficulty">
                        {{
                          skillItem.difficulty === 1
                            ? '基础'
                            : skillItem.difficulty === 2
                              ? '进阶'
                              : '复杂'
                        }}
                      </span>
                    </span>
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
          <div class="panel-footer" v-if="skillOptions.length > 0 && !isSkillConfirmed">
            <button
              class="action-btn"
              :class="{ disabled: selectedSkills.length === 0 || isConfirming }"
              @click="confirmSkill"
            >
              <template v-if="isConfirming">
                <span
                  class="wave-animation"
                  :key="'confirm-' + waveKey"
                  @animationend="onDotAnimationEnd($event)"
                >
                  {{ splitWaveText('确认中....').prefix
                  }}<span
                    v-for="d in splitWaveText('确认中....').dots"
                    :key="d.index"
                    class="wave-char"
                    :style="{ animationDelay: d.delay }"
                    >{{ d.char }}</span
                  >
                </span>
              </template>
              <template v-else>确认学习目标</template>
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
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useCareerStore } from '@/stores/career'
import { useSkillKnowledgeStore } from '@/stores/skillKnowledge'
import { usePlayerStore } from '@/stores/user'
import { useSkillResultsStore } from '@/stores/skillResults'
import {
  saveJobAndSearchRAG,
  answerUserQuestion,
  getUserJobData,
  fetchSkillKnowledgePoints,
  generateLearningPath,
} from '@/api/agent'
import type { SkillItem } from '@/api/agent/types'

const route = useRoute()
const careerStore = useCareerStore()
const skillKnowledgeStore = useSkillKnowledgeStore()
const playerStore = usePlayerStore()
const skillResultsStore = useSkillResultsStore()

const selectedSkills = ref<string[]>([])
const skillsData = ref<SkillItem[]>([])
const isLoading = ref(false)
const selectedJobNames = ref<string[]>([])
const collapsedJobs = ref<number[]>([])
const isSkillConfirmed = ref(false)
const hasEverConfirmed = ref(false)
const isConfirming = ref(false) // 确认按钮防重复点击
// const currentPptSlide = ref(0) // 当前查看的PPT页码

// 初始化时将所有岗位设为折叠状态
const initCollapsedJobs = () => {
  // 确保 skillOptions 有数据再初始化
  if (skillOptions.value.length > 0) {
    collapsedJobs.value = skillOptions.value.map((job) => job.id)
  } else {
    collapsedJobs.value = []
  }
}

// 将后端返回的技能数据转换为展示格式，按点击顺序排序
const skillOptions = computed(() => {
  // 如果没有技能数据，返回空数组
  if (!skillsData.value || skillsData.value.length === 0) {
    return []
  }

  // 按照 selectedJobNames 的顺序对技能数据进行排序
  const orderedSkills = selectedJobNames.value
    .map((jobName) => {
      return skillsData.value.find((skill) => skill.job_name === jobName)
    })
    .filter((skill): skill is SkillItem => skill !== undefined)

  return orderedSkills.map((skill, index) => ({
    id: index + 1,
    name: skill.job_name,
    skillList: [...skill.skills].sort((a, b) => (a.difficulty || 0) - (b.difficulty || 0)),
    major: skill.major,
    score: skill.score,
  }))
})

// 确认技能选择
const confirmSkill = async () => {
  if (selectedSkills.value.length === 0 || isConfirming.value) return
  isConfirming.value = true

  try {
    // 根据选中的技能找到对应的岗位
    const selectedSkillName = selectedSkills.value[0]!
    const jobWithSkill = skillOptions.value.find((job) =>
      job.skillList.some((skill) => skill.name === selectedSkillName),
    )
    const jobName = jobWithSkill ? jobWithSkill.name : ''

    // 调用接口获取技能对应的知识点
    const res = await fetchSkillKnowledgePoints(
      selectedSkillName,
      jobName,
      playerStore.playerInfo?.id || 0,
    )
    let skillExists = false
    if (res.code === 200 && res.data) {
      const responseData = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
      if (responseData.skill_name && responseData.dimensions) {
        skillKnowledgeStore.setSkillKnowledge({
          skill_name: responseData.skill_name,
          job_name: responseData.job_name,
          dimensions: responseData.dimensions,
        })
      }
      skillExists = responseData.exists === true
    }

    // 如果已存在知识点评估，跳过AI对话，但按钮直接消失
    if (skillExists) {
      isSkillConfirmed.value = true
      hasEverConfirmed.value = true
      return
    }

    isSkillConfirmed.value = true
    hasEverConfirmed.value = true
    chatRecords.value.push({
      userMessage: '',
      aiReply: '小顾问帮你评估知识战力',
      options: ['纯小白，完全不懂', '有点基础，来考考我吧'],
    })
    scrollToBottom()
  } finally {
    isConfirming.value = false
  }
}

// 切换技能选择（确认前为切换模式，确认后需先取消才能选其他）
const toggleSkill = (skillItem: string) => {
  const index = selectedSkills.value.indexOf(skillItem)
  if (index > -1) {
    // 取消选择，重置确认状态（但头部保持隐藏）
    selectedSkills.value = []
    isSkillConfirmed.value = false
    // 清空聊天记录
    chatRecords.value = []
  } else if (!isSkillConfirmed.value || selectedSkills.value.length === 0) {
    selectedSkills.value = [skillItem]
  } else {
    chatRecords.value.push({
      userMessage: '',
      aiReply: '小顾问提醒您：请先取消已选择的技能，再选择新技能哦~',
    })
    scrollToBottom()
  }
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
  try {
    const jobNamesParam = route.query.jobNames as string
    const jobTokenParam = route.query.jobToken as string

    // 安全获取 store 中的数据，确保是数组
    let storeJobNames: string[] = []
    try {
      const names = careerStore.selectedJobNames
      storeJobNames = Array.isArray(names) ? names : []
    } catch (e) {
      console.warn('获取 store jobNames 失败:', e)
      storeJobNames = []
    }

    // 优先使用 query 参数，否则使用 store 中的数据
    let jobNames: string[] = []
    if (jobNamesParam) {
      jobNames = jobNamesParam.split(',').filter(Boolean)
    } else if (storeJobNames.length > 0) {
      jobNames = storeJobNames
    }

    // 优先使用 URL 中的凭证，否则使用 store 中的凭证
    const jobToken = jobTokenParam || careerStore.jobToken

    // 如果没有数据，发送阻塞请求获取用户数据
    if (jobNames.length === 0) {
      const userId = playerStore.playerInfo?.id
      if (userId) {
        isLoading.value = true
        try {
          const res = await getUserJobData(userId)
          if (res.code === 200 && res.data) {
            // data 是 JSON 字符串，需要先解析
            const responseData = JSON.parse(res.data as unknown as string)
            // 后端返回 query 和 skills
            jobNames = Array.isArray(responseData.query) ? responseData.query : []
            selectedJobNames.value = jobNames

            // 保存岗位名称到 store（使用后端返回的 query 更新）
            if (jobNames.length > 0) {
              careerStore.setJobNames(jobNames)
            }

            // 如果后端返回了 jobToken，保存到 store
            if (responseData.jobToken !== undefined && responseData.jobToken !== null) {
              careerStore.setJobToken(String(responseData.jobToken))
            }

            // 直接使用后端返回的技能数据
            skillsData.value = Array.isArray(responseData.skills) ? responseData.skills : []

            // 等待下一个 tick 再初始化折叠状态，确保 computed 已更新
            await nextTick()
            initCollapsedJobs()
          }
        } catch (error) {
          console.error('获取用户数据失败:', error)
        } finally {
          isLoading.value = false
        }
      }

      // 仍然没有数据则返回
      if (jobNames.length === 0) {
        return
      }
    } else {
      // 有数据时直接请求技能列表
      selectedJobNames.value = jobNames
      isLoading.value = true
      try {
        const userId = playerStore.playerInfo?.id
        // 判断是否是首次调用（从Career保存岗位后首次调用searchSkill）
        const newData = careerStore.hasCalledSaveJob
        const res = await saveJobAndSearchRAG(jobNames, jobToken || undefined, userId, newData)
        // 调用后重置标记
        careerStore.setHasCalledSaveJob(false)
        if (res.code === 200) {
          const responseData = JSON.parse(res.data as unknown as string)
          skillsData.value = Array.isArray(responseData.skills) ? responseData.skills : []

          // 只有当后端返回 jobToken 时，才把 query 同步到 pinia
          if (responseData.jobToken !== undefined && responseData.jobToken !== null) {
            // 保存 jobToken 到 pinia
            careerStore.setJobToken(String(responseData.jobToken))

            // 保存 query 到 pinia（只有在有 jobToken 时才同步）
            if (responseData.query && Array.isArray(responseData.query)) {
              const backendJobNames = responseData.query as string[]
              selectedJobNames.value = backendJobNames
              careerStore.setJobNames(backendJobNames)
            }
          }

          // 等待下一个 tick 再初始化折叠状态
          await nextTick()
          initCollapsedJobs()
        }
      } catch (error) {
        console.error('RAG 检索失败:', error)
      } finally {
        isLoading.value = false
      }
    }
  } catch (error) {
    console.error('SkillPage onMounted 错误:', error)
  }
})

// 波浪动画循环：监听 animationend，等最后一颗点运行完，延迟0.5秒后再次执行
const waveKey = ref(0)
let waveTimer: ReturnType<typeof setTimeout> | null = null
let dotEndCount = 0
const DOT_COUNT = 4

const onDotAnimationEnd = (e: AnimationEvent) => {
  if (!(e.target as HTMLElement).classList.contains('wave-char')) return
  dotEndCount++
  if (dotEndCount >= DOT_COUNT) {
    dotEndCount = 0
    waveTimer = setTimeout(() => {
      waveKey.value++
    }, 500)
  }
}

onUnmounted(() => {
  if (waveTimer) {
    clearTimeout(waveTimer)
    waveTimer = null
  }
})

// 对话记录，每个记录包含用户消息和AI回复
interface ChatRecord {
  userMessage: string
  aiReply?: string
  type?: string // 题目类型
  stem?: string // 题干
  options?: string[] // 选项列表
  selectedOption?: number // 选中的选项索引
  fillAnswer?: string // 填空题答案
  codeSnippet?: string // 代码片段
  correctAnswer?: string // 正确答案
  explanation?: string // 答案解析
  isCorrect?: boolean // 用户是否答对
  // pptBase64?: string // PPT文件base64数据
  // pptSlides?: string[] // 解析后的幻灯片文本内容
}
const chatRecords = ref<ChatRecord[]>([])
const isSendingMessage = ref(false)

// 判断是否有未回答的题目（最后一条记录是题目且用户未回答）
const hasUnansweredQuestion = computed(() => {
  if (chatRecords.value.length === 0) return false
  const lastRecord = chatRecords.value[chatRecords.value.length - 1]
  if (!lastRecord) return false
  // 如果有选项但用户未选择答案，禁用聊天
  if (
    lastRecord.options &&
    lastRecord.options.length > 0 &&
    lastRecord.selectedOption === undefined
  ) {
    return true
  }
  return false
})

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
  // 添加新的对话记录（包含思考中占位）
  chatRecords.value.push({ userMessage: message, aiReply: '小顾问思考中....' })
  isSendingMessage.value = true

  // 滚动到底部
  scrollToBottom()

  // 创建新的 AbortController
  abortController = new AbortController()

  // 调用接口提交用户消息，并添加3秒延迟给后端处理时间
  try {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    const knowledgeData = skillKnowledgeStore.skillKnowledgeData
    // 先从 skillKnowledgeStore 取 dimensions，如果没有再从 skillResultsStore 查找
    const dimensions = knowledgeData?.dimensions || (() => {
      const jobName = knowledgeData?.job_name
      const skillName = knowledgeData?.skill_name
      if (!jobName || !skillName) return undefined
      const results = skillResultsStore.skillResults[jobName]
      if (!results) return undefined
      const found = results.find(s => s.skill_name === skillName)
      return found?.dimensions
    })()
    const res = await answerUserQuestion(
      {
        skill_name: knowledgeData?.skill_name || '',
        job_name: knowledgeData?.job_name || '',
        userinput: message,
        user_id: playerStore.playerInfo?.id || 0,
        ...(dimensions ? { dimensions } : {}),
      },
      abortController?.signal,
    )
    if (res.code === 200 && res.data) {
      // res.data 是 JSON 字符串，需要先解析
      const responseData = JSON.parse(res.data as unknown as string)
      // 解析内层 data（可能是 JSON 字符串或已经是对象）
      const innerData =
        typeof responseData.data === 'string'
          ? JSON.parse(responseData.data)
          : responseData.data
      // 更新最后一条对话记录的 AI 回复
      const lastRecord = chatRecords.value[chatRecords.value.length - 1]
      if (lastRecord) {
        // 根据 tool 字段判断返回类型
        const toolType = innerData.tool
        if (toolType === 'chat') {
          // 普通聊天回复
          lastRecord.aiReply = innerData.answer || ''
        } else if (toolType === 'generate_quiz') {
          // 题目类型，需要交互
          // 清空"思考中"占位文字，避免与题目内容同时显示
          lastRecord.aiReply = ''
          const typeMap: Record<string, string> = {
            true_false: '判断题',
            choice: '选择题',
            filling: '填空题',
            analysis: '分析题',
          }
          const typeText = typeMap[innerData.type] || innerData.type
          // 存储题目数据
          lastRecord.type = typeText
          lastRecord.stem = innerData.stem
          lastRecord.options = innerData.options || []
          lastRecord.codeSnippet = innerData.code_snippet
          lastRecord.correctAnswer = innerData.answer
          lastRecord.explanation = innerData.explanation
        } else if (toolType === 'generate_ppt') {
          // PPT 生成类型，触发下载
          lastRecord.aiReply = innerData.answer || '小顾问帮你规划完毕，记得查收哦~（下载完成）'
          const base64Data = innerData.data
          if (base64Data) {
            downloadPPTFile(base64Data)
            // 同步保存学习结果到 skillResultsStore，用于 MePage 展示
            const jobName = knowledgeData?.job_name
            const skillName = knowledgeData?.skill_name
            const dimensions = knowledgeData?.dimensions || []
            if (jobName && skillName) {
              const jobSkillData = skillsData.value.find((s) => s.job_name === jobName)
              const score = jobSkillData?.score ?? 0
              skillResultsStore.addSkillResult(jobName, skillName, score, dimensions)
            }
          }
        }
        scrollToBottom()
      }
    }
  } catch (error: unknown) {
    // 判断是否是用户主动取消
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('请求已取消')
    } else {
      console.error('消息提交失败:', error)
    }
    // 移除最后一条对话记录（包括思考中占位）
    chatRecords.value.pop()
  } finally {
    isSendingMessage.value = false
    abortController = null
  }
}

// 处理选项点击
const handleOptionClick = async (record: ChatRecord, optionIndex: number) => {
  // 点击"纯小白，完全不懂"时，先改内容再重置状态
  if (record.options?.[optionIndex]?.includes('纯小白')) {
    const selectedSkillName = selectedSkills.value[0] || '该技能'
    record.aiReply = `需要小顾问生成${selectedSkillName}的学习路线吗？`
    record.options = ['是', '否']
    record.isCorrect = undefined
    record.selectedOption = undefined // 保持 undefined，让新按钮可点击
    scrollToBottom()
    return
  }

  // 点击"有点基础，略懂一些"时，覆盖为生成中的消息
  if (record.options?.[optionIndex]?.includes('有点基础')) {
    record.aiReply = '小顾问正在为你量身准备中....'
    record.options = []
    record.stem = ''
    record.selectedOption = undefined
    record.isCorrect = undefined
    scrollToBottom()
    return
  }

  // 其他选项正常设置
  record.selectedOption = optionIndex
  // 判断答案是否正确
  const correctAnswer = record.correctAnswer?.trim()
  if (correctAnswer) {
    const correctIndex = correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0)
    record.isCorrect = optionIndex === correctIndex
  }

  // 点击"否"时，删除当前记录
  if (record.options?.[optionIndex] === '否') {
    const index = chatRecords.value.indexOf(record)
    if (index > -1) {
      chatRecords.value.splice(index, 1)
    }
    scrollToBottom()
  }

  // 点击"是"时，调用生成学习路线接口
  if (record.options?.[optionIndex] === '是') {
    record.aiReply = '小顾问正在生成中....'
    record.options = undefined
    record.selectedOption = undefined
    record.isCorrect = undefined
    scrollToBottom()

    // 从知识 Pinia 获取字段
    const knowledgeData = skillKnowledgeStore.skillKnowledgeData
    // 从用户 Pinia 获取用户 ID
    const userId = playerStore.playerInfo?.id

    if (knowledgeData && userId) {
      console.log('[PPT] 开始请求，参数:', {
        skill_name: knowledgeData.skill_name,
        job_name: knowledgeData.job_name,
        dimensions: knowledgeData.dimensions,
        userId,
      })
      try {
        const res = await generateLearningPath({
          skill_name: knowledgeData.skill_name,
          job_name: knowledgeData.job_name,
          dimensions: knowledgeData.dimensions,
          user_id: userId,
          userinput: '帮我生成一份ppt',
        })
        console.log('[PPT] 接口返回:', { code: res.code, dataType: typeof res.data })
        if (res.code === 200 && res.data) {
          // res.data 是 JSON 字符串，需要先解析，格式：{ success, data: { data: base64, tool }, message }
          const parsed = JSON.parse(res.data as unknown as string)
          // 直接取内层 data 中的 ppt 码
          const base64Data = parsed.data?.data
          if (base64Data) {
            console.log('[PPT] 拿到base64数据，长度:', base64Data.length)
            // 下载PPT
            downloadPPTFile(base64Data)
            console.log('[PPT] 下载完成')
            record.aiReply = '小顾问帮你规划完毕，记得查收哦~（下载完成）'
            // 保存技能学习结果到store，用于MePage展示
            const jobName = knowledgeData.job_name
            const skillName = knowledgeData.skill_name
            const dimensions = knowledgeData.dimensions || []
            // 从skillsData中查找该岗位的评分
            const jobSkillData = skillsData.value.find((s) => s.job_name === jobName)
            const score = jobSkillData?.score ?? 0
            skillResultsStore.addSkillResult(jobName, skillName, score, dimensions)
          } else {
            console.error('[PPT] 解析数据不满足:', parsed)
            record.aiReply = '生成失败，请稍后重试'
          }
        } else {
          console.error('[PPT] 条件不满足:', { code: res.code, data: res.data })
          record.aiReply = '生成失败，请稍后重试'
        }
      } catch (error) {
        console.error('[PPT] 请求异常:', error)
        record.aiReply = '生成失败，请稍后重试'
      }
    } else {
      console.error('缺少知识点数据或用户信息')
      record.aiReply = '数据不完整，无法生成学习路线'
    }
  }
}

// 提交填空题答案
const submitFillAnswer = (record: ChatRecord) => {
  if (record.fillAnswer && record.fillAnswer.trim()) {
    record.selectedOption = 0 // 标记为已提交
    // 判断答案是否正确（不区分大小写，去除前后空格）
    const userAnswer = record.fillAnswer.trim().toLowerCase()
    const correctAnswer = record.correctAnswer?.trim().toLowerCase()
    record.isCorrect = userAnswer === correctAnswer
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

/*
// 解析PPTX文件，提取所有幻灯片的文本内容
async function parsePPTX(base64Data: string): Promise<string[]> {
  try {
    const binaryStr = atob(base64Data)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }
    const zip = await JSZip.loadAsync(bytes.buffer)
    const slides: string[] = []
    let slideIndex = 1
    while (true) {
      const fileName = `ppt/slides/slide${slideIndex}.xml`
      const file = zip.file(fileName)
      if (!file) break
      const content = await file.async('string')
      // 提取 <a:t> 标签中的文本
      const textMatches = content.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || []
      const slideText = textMatches
        .map((m) => m.replace(/<[^>]+>/g, ''))
        .filter((t) => t.trim())
        .join('\n')
      if (slideText.trim()) {
        slides.push(slideText)
      }
      slideIndex++
    }
    return slides
  } catch (e) {
    console.error('解析PPTX失败:', e)
    return []
  }
}
*/

// 下载PPT文件
function downloadPPTFile(base64Data: string, filename = '学习规划.pptx') {
  const byteChars = atob(base64Data)
  const byteNums: number[] = []
  for (let i = 0; i < byteChars.length; i++) {
    byteNums[i] = byteChars.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNums)
  const blob = new Blob([byteArray], {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// 将文本拆分为前缀文字 + 波浪动画的....四个点
const splitWaveText = (text: string) => {
  if (text.endsWith('....')) {
    const prefix = text.slice(0, -4)
    const dots = ['.', '.', '.', '.'].map((char, index) => ({
      char,
      index,
      delay: `${index * 0.6}s`,
    }))
    return { prefix, dots }
  }
  return { prefix: text, dots: [] }
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
  color: var(--text-secondary);
  font-weight: 600;
  margin-left: 0.5rem;
}

.job-selected-count-inline.selected {
  color: #22c55e;
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

.skill-difficulty {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.difficulty-label {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.difficulty-label.level-1 {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.15);
}

.difficulty-label.level-2 {
  color: #ca8a04;
  background: rgba(202, 138, 4, 0.15);
}

.difficulty-label.level-3 {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
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
  animation: float 5s ease-in-out infinite;
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
    transform: translateY(-2px);
  }
}

/* ========= 响应式适配 ========= */
@media (max-width: 1024px) {
  .main-content {
    height: auto;
    padding: 1rem 1.5%;
  }

  .split-layout {
    flex-direction: row;
    height: auto;
    gap: 1.5rem;
    align-items: stretch;
  }

  .left-panel {
    flex: 2;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .left-panel :deep(.ai-dialog-section) {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .left-panel :deep(.chat-container) {
    flex: 1;
    max-height: none;
    min-height: 400px;
  }

  .left-panel :deep(.input-container) {
    margin-top: auto;
  }

  .right-panel {
    width: 320px;
    flex-shrink: 0;
    max-height: none;
    display: flex;
    flex-direction: column;
  }

  .skill-cards-container {
    flex: 1;
    max-height: none;
    min-height: 400px;
  }

  .panel-footer {
    margin-top: auto;
  }
}

/* 平板横屏 (宽度 > 768px 且高度较小) */
@media (min-width: 769px) and (max-width: 1024px) and (max-height: 800px) {
  .main-content {
    height: auto;
    min-height: calc(100vh - 100px);
  }

  .split-layout {
    flex-direction: row;
    height: auto;
    gap: 1rem;
    align-items: stretch;
  }

  .left-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .left-panel :deep(.ai-dialog-section) {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: auto;
  }

  .left-panel :deep(.chat-container) {
    flex: 1;
    max-height: none;
    min-height: 350px;
  }

  .left-panel :deep(.input-container) {
    margin-top: auto;
  }

  .right-panel {
    width: 300px;
    max-height: none;
    display: flex;
    flex-direction: column;
  }

  .skill-cards-container {
    flex: 1;
    max-height: none;
    min-height: 350px;
  }

  .panel-footer {
    margin-top: auto;
  }

  .panel-header {
    padding: 0.75rem 1rem;
  }

  .panel-title {
    font-size: 1rem;
  }

  .card-header {
    padding: 0.6rem;
  }

  .card-title {
    font-size: 0.9rem;
  }

  .card-skills {
    padding: 0.5rem;
  }

  .card-skill-item {
    padding: 0.5rem;
    margin-bottom: 0.4rem;
  }
}

@media (max-width: 768px) {
  .skill-container {
    min-height: 100vh;
  }

  .main-content {
    padding: 1rem 0.75rem 2rem 0.75rem;
    height: auto;
  }

  .split-layout {
    flex-direction: column;
    height: auto;
    gap: 0.75rem;
  }

  /* 左侧对话面板 */
  .left-panel {
    min-height: 400px;
  }

  .left-panel :deep(.chat-container) {
    max-height: 400px;
    min-height: 0;
  }

  .left-panel :deep(.ai-dialog-section) {
    height: auto;
    min-height: 400px;
  }

  /* 右侧技能面板 */
  .right-panel {
    width: 100%;
    max-height: none;
    min-height: 400px;
  }

  .panel-header {
    padding: 1rem;
  }

  .panel-title {
    font-size: 1rem;
  }

  .panel-subtitle {
    font-size: 0.8rem;
  }

  .skill-cards-container {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  /* 技能卡片优化 */
  .skill-card {
    border-radius: 10px;
  }

  .card-header {
    padding: 0.75rem;
  }

  .card-title {
    font-size: 0.9rem;
  }

  .job-selected-count-inline {
    font-size: 0.7rem;
  }

  .card-badge {
    font-size: 0.65rem;
    padding: 0.15rem 0.5rem;
  }

  .card-skills {
    padding: 0.5rem;
  }

  .card-skill-item {
    padding: 0.6rem 0.75rem;
    gap: 0.5rem;
  }

  .skill-info .skill-name {
    font-size: 0.85rem;
  }

  .skill-info .skill-desc {
    font-size: 0.7rem;
  }

  .skill-check {
    width: 18px;
    height: 18px;
  }

  .skill-check svg {
    width: 10px;
    height: 10px;
  }

  /* 底部操作按钮 */
  .panel-footer {
    padding: 0.75rem 1rem;
  }

  .action-btn {
    padding: 0.8rem 1.2rem;
    font-size: 0.9rem;
    border-radius: 8px;
  }

  /* 空状态优化 */
  .empty-state {
    padding: 2rem 1rem;
  }

  .empty-icon {
    font-size: 2.5rem;
  }

  .empty-state h3 {
    font-size: 1.2rem;
  }

  .empty-state p {
    font-size: 0.85rem;
  }

  /* 消息气泡优化 */
  .message {
    margin-bottom: 1rem;
    gap: 0.5rem;
  }

  .message-bubble {
    padding: 0.75rem 1rem;
    max-width: 85%;
    border-radius: 14px;
  }

  /* 建议列表优化 */
  .suggestions {
    padding-left: 1rem;
  }

  .suggestions li {
    font-size: 0.85rem;
    margin-bottom: 0.2rem;
  }

  /* 返回按钮优化 */
  .back-btn {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }

  /* 技能内容区域 */
  .skill-content {
    padding: 1.5rem 1rem;
  }

  /* 滚动条优化 */
  .skill-cards-container::-webkit-scrollbar {
    width: 4px;
  }

  .skill-cards-container::-webkit-scrollbar-thumb {
    border-radius: 2px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem 0.5rem 1.5rem 0.5rem;
  }

  .split-layout {
    gap: 0.5rem;
  }

  /* 更小的屏幕适配 */
  .left-panel {
    min-height: 350px;
  }

  .left-panel :deep(.chat-container) {
    max-height: 350px;
  }

  .right-panel {
    min-height: 350px;
  }

  .panel-header {
    padding: 0.75rem 0.75rem;
  }

  .panel-title {
    font-size: 0.9rem;
  }

  /* 技能卡片进一步压缩 */
  .card-header {
    padding: 0.6rem 0.75rem;
  }

  .card-title {
    font-size: 0.85rem;
  }

  .card-skill-item {
    padding: 0.5rem 0.6rem;
  }

  .skill-info .skill-name {
    font-size: 0.8rem;
  }

  .skill-info .skill-desc {
    font-size: 0.65rem;
  }

  /* 按钮进一步优化 */
  .action-btn {
    padding: 0.7rem 1rem;
    font-size: 0.85rem;
  }

  /* 消息气泡进一步优化 */
  .message-bubble {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
  }

  .empty-state {
    padding: 1.5rem 0.75rem;
  }

  .empty-icon {
    font-size: 2rem;
  }

  /* 返回按钮进一步优化 */
  .back-btn {
    padding: 0.5rem 0.8rem;
    font-size: 0.85rem;
  }
}

/* 横屏模式优化 */
@media (max-height: 600px) and (orientation: landscape) {
  .main-content {
    padding: 0.5rem 1rem 1rem 1rem;
    height: calc(100vh - 60px);
  }

  .split-layout {
    flex-direction: row;
    gap: 1rem;
  }

  .left-panel {
    min-height: auto;
  }

  .left-panel :deep(.chat-container) {
    max-height: calc(100vh - 140px);
  }

  .right-panel {
    min-height: auto;
    max-height: calc(100vh - 140px);
  }

  .panel-header {
    padding: 0.75rem;
  }

  .card-header {
    padding: 0.5rem 0.75rem;
  }

  .card-skill-item {
    padding: 0.4rem 0.6rem;
  }

  .skill-info .skill-name {
    font-size: 0.8rem;
  }

  .skill-info .skill-desc {
    font-size: 0.65rem;
  }

  .panel-footer {
    padding: 0.5rem 0.75rem;
  }

  .action-btn {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
}

/* 题目内容样式 */
.question-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-type {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
  margin-bottom: 8px;
}

.ai-text {
  color: var(--text-primary);
  font-size: 1rem;
  margin-bottom: 16px;
  line-height: 1.5;
}

.ai-with-options {
  margin-top: 8px;
}

.ai-icon {
  width: 18px;
  height: 18px;
  margin-left: 6px;
  vertical-align: middle;
}

.question-stem {
  font-size: 1rem;
  line-height: 1.6;
  text-indent: 2em;
}

.question-options {
  display: grid;
  gap: 8px 24px;
  margin-top: 8px;
}

/* 所有选项：一行两列 */
.question-options {
  grid-template-columns: repeat(2, 1fr);
}

.option-btn {
  font-size: 0.95rem;
  line-height: 1.5;
  text-align: center;
  padding: 8px 16px;
  border: 1px solid var(--accent-color, #4ecdc4);
  border-radius: 8px;
  background: transparent;
  color: #1a1a1a;
  cursor: pointer;
  transition: background 0.2s ease;
}

.option-btn:hover,
.option-btn.selected {
  background: var(--accent-color, #4ecdc4);
}

.option-text {
  font-size: 0.95rem;
  line-height: 1.5;
  text-align: center;
  padding: 8px 16px;
}

.option-text.selected {
  color: var(--accent-color, #4ecdc4);
  font-weight: 600;
}

/* 填空题输入框样式 */
.fill-blank-input {
  margin-top: 12px;
}

.fill-blank-input input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid var(--accent-color, #4ecdc4);
  border-radius: 8px;
  background: transparent;
  color: #1a1a1a;
  font-size: 0.95rem;
  outline: none;
}

.fill-blank-input input::placeholder {
  color: rgba(26, 26, 26, 0.5);
}

.fill-blank-input {
  display: flex;
  gap: 8px;
  align-items: center;
}

.confirm-btn {
  padding: 10px 16px;
  border: 1px solid var(--accent-color, #4ecdc4);
  border-radius: 8px;
  background: var(--accent-color, #4ecdc4);
  color: #1a1a1a;
  font-size: 0.9rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
  white-space: nowrap;
}

.confirm-btn:hover {
  opacity: 0.8;
}

.submitted-answer {
  display: block;
  padding: 10px 16px;
  color: var(--accent-color, #4ecdc4);
  font-weight: 600;
}

.submitted-answer.correct {
  color: #4caf50;
}

.submitted-answer.wrong {
  color: #f44336;
}

/* 选项样式 */
.option-text.correct {
  color: #4caf50;
  font-weight: 600;
}

.option-text.wrong {
  color: #f44336;
  font-weight: 600;
}

/* 答案解析样式 */
.answer-explanation {
  margin-top: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border-left: 4px solid var(--accent-color, #4ecdc4);
}

.answer-explanation .explanation-title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.answer-explanation .explanation-title.correct {
  color: #4caf50;
}

.answer-explanation .explanation-title.wrong {
  color: #f44336;
}

.answer-explanation .explanation-content {
  font-size: 0.95rem;
  line-height: 1.6;
}

.answer-explanation .correct-answer {
  color: #1a1a1a;
  font-weight: 600;
  margin-bottom: 8px;
}

.answer-explanation .explanation-text {
  color: #1a1a1a;
  text-indent: 2em;
  line-height: 1.8;
}

.answer-explanation .label-text {
  color: #1a1a1a;
  font-weight: 600;
}

/* 代码片段样式 */
.code-snippet {
  margin-top: 12px;
  padding: 12px 16px;
  background: #2d2d2d;
  border-radius: 8px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
  color: #f8f8f2;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 波浪动画 - 用于AI思考中/生成中等占位文本，提示用户页面未卡死 */
/* 每个字符依次浮动，形成波浪效果 */
@keyframes wave-char {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.wave-animation {
  display: inline-block;
}

.wave-char {
  display: inline-block;
  font-weight: 800;
  font-size: 1.3em;
  animation: wave-char 1.4s ease-in-out;
}

/* ========= PPT 幻灯片展示（已注释） =========
.ppt-viewer { ... }
.ppt-slide-container { ... }
.ppt-slide-content { ... }
.ppt-controls { ... }
.ppt-nav-btn { ... }
.ppt-nav-btn:hover:not(:disabled) { ... }
.ppt-nav-btn:disabled { ... }
.ppt-page-indicator { ... }
.ppt-download-btn { ... }
.ppt-download-btn:hover { ... }
*/
</style>
