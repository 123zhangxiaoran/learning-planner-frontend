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

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 搜索栏 + 错题本入口 -->
      <div class="search-bar-wrapper">
        <section class="search-section">
          <div class="search-wrapper">
            <svg
              class="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              class="search-input"
              placeholder="搜索岗位或技能..."
              v-model="searchKeyword"
            />
          </div>
        </section>

        <!-- 错题本入口 -->
        <section class="wrong-book-section">
          <div class="wrong-book-card">
            <div class="wrong-book-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <path d="M12 6h6" />
                <path d="M12 10h6" />
                <path d="M12 14h6" />
              </svg>
            </div>
            <div class="wrong-book-info">
              <h4 class="wrong-book-title">错题本</h4>
              <p class="wrong-book-desc">共 <span class="total-wrong">23</span> 道题待练习</p>
            </div>
            <button class="btn-wrong-book" @click="goToQuestion">查看全部</button>
          </div>
        </section>
      </div>

      <!-- 岗位技能列表 -->
      <section class="career-section">
        <div class="section-header">
          <h3 class="section-title">我的知识仓库</h3>
          <span class="career-count">{{ filteredCareers.length }} 个岗位</span>
        </div>

        <div class="career-list">
          <details class="career-item" v-for="(career, cIndex) in filteredCareers" :key="cIndex">
            <summary class="career-header">
              <div class="career-title-row">
                <h4 class="career-name">{{ career.name }}</h4>
                <span class="skill-count">{{ career.skills.length }} 个技能</span>
                <span class="expand-arrow">▶</span>
              </div>
            </summary>

            <div class="career-content">
              <!-- 无技能空状态 -->
              <div class="empty-state card-style" v-if="career.skills.length === 0">
                <span class="empty-text">还未规划学习技能</span>
              </div>
              <div class="skill-grid" v-else>
                <div class="skill-card" v-for="(skill, sIndex) in career.skills" :key="sIndex">
                  <div class="skill-header">
                    <span class="skill-name">{{ skill.name }}</span>
                  </div>

                  <div class="skill-actions">
                    <button
                      class="btn-action btn-generate"
                      @click="handleGenerate(cIndex, sIndex)"
                      :disabled="questionsStore.generatingKey !== null"
                    >
                      <span
                        v-if="questionsStore.generatingKey === `${career.name}::${skill.name}`"
                        class="loading-text"
                      >
                        专属题目定制中
                        <WaveLoading />
                      </span>
                      <span v-else>AI智能出题</span>
                    </button>
                    <button
                      class="btn-action btn-question-bank"
                      @click="openQuestionBank(cIndex, sIndex)"
                    >
                      专属题库
                      <span class="wrong-count" v-if="skill.wrongCount > 0">{{
                        skill.wrongCount
                      }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </details>

          <!-- 空状态 -->
          <div class="empty-state" v-if="filteredCareers.length === 0 && careersData.length === 0">
            <span class="empty-text">还未规划学习技能</span>
          </div>
          <div class="empty-state" v-else-if="filteredCareers.length === 0">
            <span class="empty-text">未找到匹配的知识仓库</span>
          </div>
        </div>
      </section>
    </main>

    <!-- AI出题弹窗 -->
    <div class="ai-dialog-overlay" v-if="showDialog">
      <div class="ai-dialog-panel">
        <div class="ai-dialog-header">
          <h3 class="ai-dialog-title">选择知识点维度</h3>
          <label class="checkbox-wrapper">
            <input
              type="checkbox"
              class="select-all-checkbox"
              :checked="isAllSelected"
              @change="toggleSelectAll"
            />
            <span class="checkbox-label">全选</span>
          </label>
        </div>
        <div class="ai-dialog-content">
          <div class="knowledge-dimensions-list">
            <button
              v-for="(dim, index) in currentSkillDimensions"
              :key="index"
              class="knowledge-dimension-btn"
              :class="{ selected: isDimensionSelected(index) }"
              @click="toggleDimension(index)"
            >
              {{ dim[0] }}
            </button>
          </div>
          <div class="dialog-buttons">
            <button
              class="btn-generate-questions"
              @click="handleGenerateQuestions"
              :disabled="isGenerating || selectedDimensionIndices.size === 0"
            >
              <span v-if="isGenerating" class="loading-text">
                生成中
                <WaveLoading />
              </span>
              <span v-else>生成专属题目</span>
            </button>
            <button class="btn-cancel" @click="closeDialog" :disabled="isGenerating">
              取消生成
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 错题本面板 -->
    <div class="question-bank-overlay" v-if="showQuestionBank">
      <div class="question-bank-panel">
        <div class="question-bank-header">
          <h3 class="question-bank-title">
            {{ filteredCareers[questionBankJobIndex]?.name }} -
            {{ filteredCareers[questionBankJobIndex]?.skills[questionBankSkillIndex]?.name }}
          </h3>
          <button class="btn-close-question-bank" @click="closeQuestionBank">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="question-bank-content">
          <!-- 知识点分组列表 -->
          <div
            class="knowledge-groups"
            v-if="Object.keys(groupedQuestions).length > 0 && !selectedKnowledgeGroup"
          >
            <div
              class="knowledge-group-item"
              v-for="(questions, knowledgeName) in groupedQuestions"
              :key="knowledgeName"
              @click="selectKnowledgeGroup(knowledgeName)"
            >
              <span class="knowledge-name">{{ knowledgeName }}</span>
              <span class="question-count">{{ questions.length }} 道题</span>
              <span class="arrow-icon">▶</span>
            </div>
          </div>

          <!-- 选中知识点的题目列表 -->
          <div class="questions-list" v-if="selectedKnowledgeGroup">
            <div class="back-header" @click="backToKnowledgeList">
              <span class="back-text">← 返回知识点列表</span>
            </div>
            <div class="group-title">
              <span>{{ selectedKnowledgeGroup }}（{{ currentGroupQuestions.length }}道题）</span>
            </div>

            <!-- 判断题区域 -->
            <div class="question-section" v-if="judgeQuestions.length > 0">
              <div class="section-divider">判断题（{{ judgeQuestions.length }}道）</div>
              <div
                class="question-item"
                v-for="(question, qIndex) in judgeQuestions"
                :key="'judge-' + question.id"
              >
                <div class="question-text">
                  <span v-html="question.questionText.replace(/\\n/g, '<br>')"></span>
                </div>
                <div class="question-options">
                  <div
                    class="option-item"
                    :class="{
                      'user-selected': answeredQuestions[question.id] === jIndex,
                      correct:
                        submittedQuestions.has(question.id) &&
                        answeredQuestions[question.id] === jIndex &&
                        (jIndex === 0 ? '正确' : '错误') === question.correctAnswer,
                      wrong:
                        submittedQuestions.has(question.id) &&
                        answeredQuestions[question.id] === jIndex &&
                        (jIndex === 0 ? '正确' : '错误') !== question.correctAnswer,
                    }"
                    v-for="(jOption, jIndex) in ['正确', '错误']"
                    :key="jIndex"
                    @click="handleOptionClick(question.id, jIndex)"
                  >
                    <span class="option-label">{{ jIndex === 0 ? 'A' : 'B' }}</span>
                    <span class="option-text">{{ jOption }}</span>
                  </div>
                </div>
                <!-- 收藏星星 -->
                <div
                  class="star-icon"
                  v-if="submittedQuestions.has(question.id)"
                  @click="toggleStar(question.id)"
                  :class="{ filled: starredQuestions[question.id] }"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                  </svg>
                </div>
                <!-- 答案解析（提交后显示） -->
                <div
                  class="question-explanation"
                  v-if="submittedQuestions.has(question.id) && question.explanation"
                >
                  <div
                    class="explanation-content"
                    v-html="question.explanation.replace(/\\n/g, '<br>')"
                  ></div>
                </div>
              </div>
            </div>

            <!-- 选择题区域 -->
            <div class="question-section" v-if="choiceQuestions.length > 0">
              <div class="section-divider">选择题（{{ choiceQuestions.length }}道）</div>
              <div
                class="question-item"
                v-for="(question, qIndex) in choiceQuestions"
                :key="'choice-' + question.id"
              >
                <div class="question-text">
                  <span v-html="question.questionText.replace(/\\n/g, '<br>')"></span>
                </div>
                <div class="question-options">
                  <div
                    class="option-item"
                    :class="{
                      'user-selected': answeredQuestions[question.id] === oIndex,
                      correct:
                        submittedQuestions.has(question.id) &&
                        answeredQuestions[question.id] === oIndex &&
                        String.fromCharCode(65 + oIndex) === question.correctAnswer?.toUpperCase(),
                      wrong:
                        submittedQuestions.has(question.id) &&
                        answeredQuestions[question.id] === oIndex &&
                        String.fromCharCode(65 + oIndex) !== question.correctAnswer?.toUpperCase(),
                    }"
                    v-for="(option, oIndex) in question.options || []"
                    :key="oIndex"
                    @click="handleOptionClick(question.id, oIndex)"
                  >
                    <span class="option-label">{{ String.fromCharCode(65 + oIndex) }}</span>
                    <span
                      class="option-text"
                      v-html="cleanOptionText(option).replace(/\\n/g, '<br>')"
                    ></span>
                  </div>
                </div>
                <!-- 收藏星星 -->
                <div
                  class="star-icon"
                  v-if="submittedQuestions.has(question.id)"
                  @click="toggleStar(question.id)"
                  :class="{ filled: starredQuestions[question.id] }"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                  </svg>
                </div>
                <!-- 答案解析（提交后显示） -->
                <div
                  class="question-explanation"
                  v-if="submittedQuestions.has(question.id) && question.explanation"
                >
                  <div
                    class="explanation-content"
                    v-html="question.explanation.replace(/\\n/g, '<br>')"
                  ></div>
                </div>
              </div>
            </div>

            <div class="questions-footer">
              <!-- 提交中状态（按钮点击后立即显示） -->
              <div v-if="isSubmittingGroup" class="submitting-hint">
                <WaveLoading text="提交中" />
              </div>
              <!-- 提交答案按钮 -->
              <button
                v-else-if="!isSubmissionCompleted"
                class="btn-submit-set"
                :disabled="
                  currentGroupQuestions.every((q) => answeredQuestions[q.id] === undefined)
                "
                @click="submitGroupAnswers"
              >
                提交答案
              </button>
              <!-- 提交完成后显示加入错题本 -->
              <button v-else class="btn-add-wrong-book" @click="addToWrongBook">加入错题本</button>
            </div>
          </div>
          <div class="question-bank-empty" v-if="Object.keys(groupedQuestions).length === 0">
            <span class="empty-text">暂无题目，点击上方「AI智能出题」生成</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 轻量级提示弹窗 -->
    <Transition name="toast">
      <div class="toast-overlay" v-if="toast.show" @click.self="closeToast">
        <div class="toast-panel" :class="toast.type">
          <div class="toast-icon">
            <svg
              v-if="toast.type === 'success'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <svg
              v-else-if="toast.type === 'error'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" @click="closeToast">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- 二次确认弹窗 -->
    <Transition name="confirm">
      <div class="confirm-overlay" v-if="confirmDialog.show" @click.self="cancelSubmit">
        <div class="confirm-panel">
          <div class="confirm-header">
            <svg
              class="confirm-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span class="confirm-title">确认提交</span>
          </div>
          <div class="confirm-content">
            <p v-if="confirmDialog.unansweredCount > 0">
              还有 <span class="confirm-count">{{ confirmDialog.unansweredCount }}</span> 道题未做
            </p>
            <p class="confirm-hint">
              {{
                confirmDialog.unansweredCount > 0 ? '未做的题目将自动判为答错，' : ''
              }}确定要提交答案吗？
            </p>
          </div>
          <div class="confirm-buttons">
            <button class="btn-confirm-cancel" @click="cancelSubmit" :disabled="isSubmitting">
              取消
            </button>
            <button class="btn-confirm-ok" @click="confirmSubmit" :disabled="isSubmitting">
              <span v-if="isSubmitting">提交中...</span>
              <span v-else>确定提交</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/layout/NavBar.vue'
import WaveLoading from '@/components/layout/WaveLoading.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCareerStore } from '@/stores/career'
import { useSkillResultsStore } from '@/stores/skillResults'
import { useSkillKnowledgeStore } from '@/stores/skillKnowledge'
import { usePlayerStore } from '@/stores/user'
import { useUserQuestionsStore, type UserQuestion } from '@/stores/userQuestions'
import { useQuestionsStore } from '@/stores/questions'
import {
  generateQuestions as generateQuestionsApi,
  getUserQuestions,
  getUserSelectedSkills,
  submitQuestionAnswer,
} from '@/api/agent'
import type { SkillResult } from '@/stores/skillResults'

const router = useRouter()
const careerStore = useCareerStore()
const skillResultsStore = useSkillResultsStore()
const skillKnowledgeStore = useSkillKnowledgeStore()
const playerStore = usePlayerStore()
const userQuestionsStore = useUserQuestionsStore()
const questionsStore = useQuestionsStore()
const searchKeyword = ref('')

// 轻量级提示弹窗状态
const toast = ref<{
  show: boolean
  message: string
  type: 'success' | 'error' | 'info'
}>({
  show: false,
  message: '',
  type: 'info',
})

// 显示提示弹窗
function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  toast.value = { show: true, message, type }
  // 3秒后自动关闭
  setTimeout(() => {
    closeToast()
  }, 3000)
}

// 关闭提示弹窗
function closeToast() {
  toast.value.show = false
}

// 二次确认弹窗状态
const confirmDialog = ref<{
  show: boolean
  unansweredCount: number
}>({
  show: false,
  unansweredCount: 0,
})

// 提交中状态（禁用确认按钮）
const isSubmitting = ref(false)

// 取消提交
function cancelSubmit() {
  confirmDialog.value.show = false
}

// 确认提交
function confirmSubmit() {
  confirmDialog.value.show = false
  isSubmitting.value = true
  isSubmittingGroup.value = true // 标记当前分组正在提交中（按钮立即消失）
  doSubmitAnswers()
}

// 从 Pinia 获取岗位和技能数据
const careersData = computed(() => {
  return careerStore.selectedJobNames.map((jobName) => {
    const skills = skillResultsStore.getSkillResultsByJob(jobName)
    return {
      name: jobName,
      skills: skills.map((skill) => ({
        name: skill.skill_name,
        wrongCount: 0, // 暂时设为0，后续可以从其他 store 获取
      })),
    }
  })
})

// 搜索过滤
const filteredCareers = computed(() => {
  if (!searchKeyword.value.trim()) {
    return careersData.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return careersData.value
    .map((career) => ({
      ...career,
      skills: career.skills.filter((skill) => skill.name.toLowerCase().includes(keyword)),
    }))
    .filter((career) => career.name.toLowerCase().includes(keyword) || career.skills.length > 0)
})

// 获取用户已选技能
async function fetchUserSelectedSkills() {
  const userId = playerStore.playerInfo?.id
  if (!userId) return
  // Pinia 中已有技能数据，不重复请求
  if (Object.keys(skillResultsStore.skillResults).length > 0) {
    return
  }
  try {
    const res = await getUserSelectedSkills(userId)
    const list = res.data
    if (!list || !Array.isArray(list) || list.length === 0) return

    // 按 jobName → skillName 分组
    const skillMap: Record<string, Record<string, { name: string; score: number }[]>> = {}
    for (const item of list) {
      let jobMap = skillMap[item.jobName]
      if (!jobMap) {
        jobMap = {}
        skillMap[item.jobName] = jobMap
      }
      const knowledgeList = jobMap[item.skillName] ?? []
      knowledgeList.push({ name: item.knowledgeName, score: item.score })
      jobMap[item.skillName] = knowledgeList
    }

    // 转换为 SkillResult 格式写入 Pinia（持久化）
    const skillResultsData: Record<string, SkillResult[]> = {}
    for (const [jobName, skills] of Object.entries(skillMap)) {
      const skillList: SkillResult[] = []
      skillResultsData[jobName] = skillList
      for (const [skillName, knowledgeList] of Object.entries(skills)) {
        const dimensions = knowledgeList.map((k) => [k.name])
        const avgScore = knowledgeList.reduce((sum, k) => sum + k.score, 0) / knowledgeList.length
        skillList.push({ skill_name: skillName, score: avgScore, dimensions })
      }
    }
    skillResultsStore.setSkillResults(skillResultsData)
  } catch (e) {
    console.error('获取用户已选技能失败', e)
    // 获取已选技能失败
  }
}

// 页面加载时确保 Pinia 数据已获取
onMounted(async () => {
  await fetchUserSelectedSkills()

  const userId = playerStore.playerInfo?.id
  if (!userId) return

  // 加载用户已生成的题目
  try {
    const res = await getUserQuestions(userId)
    console.log('API返回数据:', res.data)
    if (res.code === 200 && res.data) {
      console.log('API数据第一条:', JSON.stringify(res.data[0]))
      userQuestionsStore.setUserQuestions(res.data as UserQuestion[])
      console.log('Store中的数据:', userQuestionsStore.userQuestions)
    }
  } catch (e) {
    console.error('加载题目数据失败', e)
  }

  // 恢复正在生成的状态：如果存在生成中的任务，轮询等待结果
  if (questionsStore.generatingKey) {
    console.log('检测到正在生成的任务:', questionsStore.generatingKey)
    pollGeneratingStatus(userId)
  }
})

// 轮询等待生成完成
async function pollGeneratingStatus(userId: number) {
  const maxAttempts = 60 // 最多轮询60次（5分钟，每5秒一次）
  let attempts = 0

  const check = async () => {
    attempts++
    if (attempts > maxAttempts) {
      console.log('轮询超时，清除生成状态')
      questionsStore.clearGenerating()
      showToast('题目生成超时，请重新尝试', 'error')
      return
    }

    try {
      // 查询最新题目数据
      const questionsRes = await getUserQuestions(userId)
      if (questionsRes.code === 200 && questionsRes.data) {
        const questionsData = questionsRes.data as UserQuestion[]
        // 检查是否有新数据（与之前的数据比较）
        const currentCount = userQuestionsStore.userQuestions.length
        userQuestionsStore.setUserQuestions(questionsData)

        // 如果数据有变化，说明生成完成
        if (questionsData.length > currentCount) {
          console.log('检测到新题目，生成完成')
          questionsStore.clearGenerating()
          showToast('题目生成成功', 'success')
          return
        }
      }

      // 继续轮询
      setTimeout(check, 5000)
    } catch (error) {
      console.error('轮询检查失败:', error)
      // 出错也继续轮询，直到超时
      setTimeout(check, 5000)
    }
  }

  // 开始轮询
  setTimeout(check, 3000) // 延迟3秒开始第一次检查
}

// 是否正在生成题目（使用 store 中的 generatingKey，支持页面刷新后恢复）
const isGenerating = computed(() => questionsStore.generatingKey !== null)

// 弹窗显示状态
const showDialog = ref(false)

// 当前点击的技能信息
const currentJobIndex = ref<number>(-1)
const currentSkillIndex = ref<number>(-1)

// 选中的知识点维度索引（支持多选）
const selectedDimensionIndices = ref<Set<number>>(new Set())

// 题库面板显示状态
const showQuestionBank = ref(false)
const questionBankJobIndex = ref<number>(-1)
const questionBankSkillIndex = ref<number>(-1)

// 当前选中的知识点分组
const selectedKnowledgeGroup = ref<string | null>(null)

// 用户答题记录 key: question.id, value: 选中的选项索引（0=A, 1=B, 2=C, 3=D）
const answeredQuestions = ref<Record<string, number>>({})

// 已提交的题目集合 key: question.id
const submittedQuestions = ref<Set<string>>(new Set())

// 提交是否完成（所有接口返回）
const isSubmissionCompleted = ref(false)

// 当前分组是否正在提交中（点击提交后、接口返回前）
const isSubmittingGroup = ref(false)

// 题目收藏状态 key: question.id, value: 是否收藏
const starredQuestions = ref<Record<string, boolean>>({})

// 当前技能的题目按 questionId 分组（相同的 questionId 为一组）
const groupedQuestions = computed(() => {
  const groups: Record<string, UserQuestion[]> = {}
  currentSkillQuestions.value.forEach((q) => {
    const key = q.questionId || q.id || '其他'
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(q)
  })
  return groups
})

// 判断题列表（按 questionType 筛选）
const judgeQuestions = computed(() => {
  return currentGroupQuestions.value.filter((q) => q.questionType === 'judge')
})

// 选择题列表（按 questionType 筛选）
const choiceQuestions = computed(() => {
  return currentGroupQuestions.value.filter((q) => q.questionType !== 'judge')
})

// 当前选中的知识点分组的题目
const currentGroupQuestions = computed(() => {
  if (!selectedKnowledgeGroup.value) return []
  return groupedQuestions.value[selectedKnowledgeGroup.value] || []
})

// 切换题目收藏状态
function toggleStar(questionId: string) {
  starredQuestions.value[questionId] = !starredQuestions.value[questionId]
}

// 清理选项文本，去除前面的 A. B. C. D. 等前缀
function cleanOptionText(option: string): string {
  if (!option) return ''
  // 匹配常见的选项前缀格式：A. B. C. D. / A、B、C、D、/ A) B) C) D) / A B C D 等
  return option.trim().replace(/^[A-D][.．、,，\s)）]+/i, '')
}

// 处理选项点击（用户答题）
function handleOptionClick(questionId: string, optionIndex: number) {
  // 如果已提交，不能修改
  if (submittedQuestions.value.has(questionId)) return
  // 存储选项索引（0=A, 1=B, 2=C, 3=D）
  if (answeredQuestions.value[questionId] === optionIndex) {
    delete answeredQuestions.value[questionId]
  } else {
    answeredQuestions.value[questionId] = optionIndex
  }
}

// 提交当前分组答案
function submitGroupAnswers() {
  if (!playerStore.playerInfo?.id) {
    showToast('用户信息不存在', 'error')
    return
  }

  // 检查是否有未做的题目
  const unansweredCount = currentGroupQuestions.value.filter(
    (q) => answeredQuestions.value[q.id] === undefined,
  ).length

  // 显示二次确认弹窗
  confirmDialog.value = {
    show: true,
    unansweredCount,
  }
}

// 执行实际提交
async function doSubmitAnswers() {
  const userId = playerStore.playerInfo.id

  // 提交每道题目的答案
  for (const q of currentGroupQuestions.value) {
    submittedQuestions.value.add(q.id)

    // 判断是否答对：用户有选择且答案正确为 true，否则为 false（未选也算错）
    const userAnswerIndex = answeredQuestions.value[q.id]

    // 如果没有选择，跳过调用接口
    if (userAnswerIndex === undefined) continue

    // 将索引转换为字母（0->A, 1->B, 2->C, 3->D）
    const userAnswerLetter = String.fromCharCode(65 + userAnswerIndex)
    const isCorrect = userAnswerLetter === q.correctAnswer?.toUpperCase()

    try {
      await submitQuestionAnswer({
        user_id: userId,
        question_id: q.id,
        is_correct: isCorrect ? 1 : 0,
        question_type: q.questionType,
        job_name: q.jobName,
        skill_name: q.skillName,
        knowledge_name: q.knowledgeName,
      })
    } catch (error) {
      console.error('提交答案失败:', error)
    }
  }

  // 所有请求完成，解除禁用并标记提交完成
  isSubmitting.value = false
  isSubmittingGroup.value = false // 提交结束
  isSubmissionCompleted.value = true
}

// 加入错题本
function addToWrongBook() {
  const wrongQuestions = currentGroupQuestions.value.filter((q) => {
    const userAnswer = answeredQuestions.value[q.id]
    return userAnswer && userAnswer !== q.correctAnswer
  })
  alert(`已将 ${wrongQuestions.length} 道错题加入错题本`)
}

// 当前技能的知识点维度
const currentSkillDimensions = computed(() => {
  const career = filteredCareers.value[currentJobIndex.value]
  if (!career) return []

  const jobName = career.name
  const skillName = career.skills[currentSkillIndex.value]?.name

  // 先从 skillKnowledgeStore 查找（需匹配 job_name 和 skill_name）
  const knowledgeData = skillKnowledgeStore.skillKnowledgeData
  if (knowledgeData?.job_name === jobName && knowledgeData?.skill_name === skillName) {
    return knowledgeData.dimensions || []
  }

  // 再从 skillResultsStore 查找
  const results = skillResultsStore.skillResults[jobName]
  if (results) {
    const found = results.find((s) => s.skill_name === skillName)
    if (found) {
      return found.dimensions || []
    }
  }

  return []
})

// 获取题库面板当前技能的总知识点维度数
function getCurrentSkillTotalDimensions(): number {
  const career = filteredCareers.value[questionBankJobIndex.value]
  if (!career) return 0

  const jobName = career.name
  const skillName = career.skills[questionBankSkillIndex.value]?.name
  if (!skillName) return 0

  const knowledgeData = skillKnowledgeStore.skillKnowledgeData
  if (knowledgeData?.job_name === jobName && knowledgeData?.skill_name === skillName) {
    return knowledgeData.dimensions.length
  }
  const results = skillResultsStore.skillResults[jobName]
  if (results) {
    const found = results.find((s) => s.skill_name === skillName)
    if (found) return found.dimensions.length
  }
  return 0
}

// 关闭弹窗
function closeDialog() {
  showDialog.value = false
  selectedDimensionIndices.value.clear()
}

// 打开错题本
function openQuestionBank(cIndex: number, sIndex: number) {
  questionBankJobIndex.value = cIndex
  questionBankSkillIndex.value = sIndex
  showQuestionBank.value = true
}

// 选择知识点分组
function selectKnowledgeGroup(knowledgeName: string) {
  selectedKnowledgeGroup.value = knowledgeName
  isSubmissionCompleted.value = false
}

// 返回知识点列表
function backToKnowledgeList() {
  selectedKnowledgeGroup.value = null
}

// 关闭错题本
function closeQuestionBank() {
  showQuestionBank.value = false
  questionBankJobIndex.value = -1
  questionBankSkillIndex.value = -1
  selectedKnowledgeGroup.value = null
  answeredQuestions.value = {}
  submittedQuestions.value.clear()
  starredQuestions.value = {}
  isSubmittingGroup.value = false
  isSubmissionCompleted.value = false
}

// 跳转到错题页面
function goToQuestion() {
  router.push({ name: 'user-wrong' })
}

// 处理生成按钮点击
function handleGenerate(cIndex: number, sIndex: number) {
  currentJobIndex.value = cIndex
  currentSkillIndex.value = sIndex
  showDialog.value = true

  // 默认选中所有知识点维度（按索引）
  const dimensions = currentSkillDimensions.value
  selectedDimensionIndices.value = new Set(dimensions.map((_, index) => index))
}

// 切换知识点选中状态（按索引）
function toggleDimension(index: number) {
  if (selectedDimensionIndices.value.has(index)) {
    selectedDimensionIndices.value.delete(index)
  } else {
    selectedDimensionIndices.value.add(index)
  }
}

// 检查知识点是否选中（按索引）
function isDimensionSelected(index: number): boolean {
  return selectedDimensionIndices.value.has(index) ?? false
}

// 判断是否全部选中
const isAllSelected = computed(() => {
  if (currentSkillDimensions.value.length === 0) return false
  return currentSkillDimensions.value.every((_, index) => selectedDimensionIndices.value.has(index))
})

// 当前技能的题目列表（从 userQuestionsStore 获取）
const currentSkillQuestions = computed(() => {
  if (questionBankJobIndex.value === -1 || questionBankSkillIndex.value === -1) return []
  const career = filteredCareers.value[questionBankJobIndex.value]
  if (!career) return []
  const skillName = career.skills[questionBankSkillIndex.value]?.name
  if (!skillName) return []

  console.log('过滤条件 - jobName:', career.name, 'skillName:', skillName)
  console.log('Store中的所有题目:', userQuestionsStore.userQuestions)

  // 从 userQuestionsStore 获取该岗位+技能的题目
  const filtered = userQuestionsStore.userQuestions.filter(
    (q) => q.jobName === career.name && q.skillName === skillName,
  )
  console.log('过滤后的题目:', filtered)
  return filtered
})

// 切换全选状态
function toggleSelectAll() {
  if (isAllSelected.value) {
    // 取消全选
    selectedDimensionIndices.value.clear()
  } else {
    // 全选
    selectedDimensionIndices.value = new Set(currentSkillDimensions.value.map((_, index) => index))
  }
}

// 生成专属题目
async function handleGenerateQuestions() {
  if (selectedDimensionIndices.value.size === 0) {
    showToast('请先选择至少一个知识点维度', 'info')
    return
  }

  // 获取当前技能信息
  const career = filteredCareers.value[currentJobIndex.value]
  const skill = career?.skills[currentSkillIndex.value]

  if (!career || !skill) {
    showToast('获取技能信息失败', 'error')
    return
  }

  // 获取用户ID
  if (!playerStore.playerInfo?.id) {
    showToast('用户信息不存在，请重新登录', 'error')
    return
  }
  const userId = playerStore.playerInfo.id

  // 设置正在生成状态（持久化到 localStorage）
  questionsStore.setGenerating(career.name, skill.name)

  // 根据选中的索引从原始数据获取完整的二维数组
  const fullDimensions = currentSkillDimensions.value.filter((_, index) =>
    selectedDimensionIndices.value.has(index),
  )

  // 立即关闭弹窗
  closeDialog()

  try {
    // 调用生成题目的API
    const response = await generateQuestionsApi({
      skill_name: skill.name,
      job_name: career.name,
      dimensions: fullDimensions,
      user_id: userId,
    })

    if (response.code === 200) {
      // 生成成功，立即调用 getUserQuestions 获取最新题目数据
      const questionsRes = await getUserQuestions(userId)
      if (questionsRes.code === 200 && questionsRes.data) {
        const questionsData = questionsRes.data as UserQuestion[]
        userQuestionsStore.setUserQuestions(questionsData)
        showToast('题目生成成功', 'success')
      }
    } else {
      showToast(response.message || '生成题目失败', 'error')
    }
  } catch (error) {
    showToast('生成题目失败，请重试', 'error')
  } finally {
    // 清除生成状态（从 localStorage 移除）
    questionsStore.clearGenerating()
  }
}
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
.knowledge-container {
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 5% 3rem 8%;
}

/* ========= 搜索区域 ========= */
.search-bar-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.search-section {
  flex: 1;
  margin-bottom: 0;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1.2rem;
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  max-width: 250px;
  padding: 1rem 1rem 1rem 3.5rem;
  font-size: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  outline: none;
  transition: all 0.3s;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.search-input:focus {
  border-color: var(--accent-teal);
}

/* ========= 区块通用样式 ========= */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 60%;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-orange), transparent);
  border-radius: 2px;
}

.section-title::before {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 5px;
  width: 40%;
  height: 2px;
  background: var(--accent-yellow);
  border-radius: 2px;
}

.career-count {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* ========= 岗位列表 ========= */
.career-section {
  margin-bottom: 3rem;
}

.career-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.career-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.career-item[open] > .career-header .expand-arrow {
  transform: rotate(90deg);
}

.career-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  cursor: pointer;
  list-style: none;
  transition: background 0.3s;
}

.career-header:hover {
  background: rgba(255, 107, 53, 0.05);
}

.career-header::-webkit-details-marker {
  display: none;
}

.career-title-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.career-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.skill-count {
  font-size: 0.85rem;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.08);
  padding: 0.25rem 0.7rem;
  border-radius: 12px;
}

.expand-arrow {
  font-size: 0.8rem;
  color: var(--text-secondary);
  transition: transform 0.3s;
  margin-left: auto;
}

.career-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

/* ========= 技能卡片网格 ========= */
.skill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding-top: 1rem;
}

.skill-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 1.2rem;
  transition: all 0.3s;
}

.skill-card:hover {
  border-color: var(--accent-teal);
  background: rgba(46, 196, 182, 0.05);
}

.skill-header {
  margin-bottom: 0.8rem;
}

.skill-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.skill-dimensions {
  margin-bottom: 1rem;
}

.dimension-label {
  font-size: 0.8rem;
  color: var(--accent-teal);
  font-weight: 600;
  display: block;
  margin-bottom: 0.5rem;
}

.dimension-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.dimension-tag {
  font-size: 0.75rem;
  color: var(--text-secondary);
  padding: 0.2rem 0.6rem;
  background: rgba(46, 196, 182, 0.1);
  border: 1px solid rgba(46, 196, 182, 0.2);
  border-radius: 4px;
}

.skill-actions {
  display: flex;
  gap: 0.6rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--border-color);
}

.btn-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action .icon {
  width: 14px;
  height: 14px;
}

.btn-generate {
  background: rgba(255, 107, 53, 0.15);
  color: var(--accent-orange);
  border: 1px solid rgba(255, 107, 53, 0.3);
}

.btn-generate:hover {
  background: var(--accent-orange);
  color: var(--bg-dark);
  transform: scale(1.02);
}

.btn-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-generate:disabled:hover {
  background: rgba(255, 107, 53, 0.15);
  color: var(--accent-orange);
  transform: none;
}

.btn-question-bank {
  background: rgba(46, 196, 182, 0.15);
  color: var(--accent-teal);
  border: 1px solid rgba(46, 196, 182, 0.3);
  position: relative;
}

.btn-question-bank:hover {
  background: var(--accent-teal);
  color: var(--bg-dark);
  transform: scale(1.02);
}

.wrong-count {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  color: #fff;
  border-radius: 9px;
  padding: 0 4px;
}

/* ========= 加载文字动画 ========= */
.loading-text {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

/* ========= AI出题弹窗 ========= */
.ai-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 2rem;
}

.ai-dialog-panel {
  background: #fff;
  width: 40vw;
  height: 80vh;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.ai-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.ai-dialog-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.select-all-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.checkbox-label {
  font-size: 0.9rem;
  color: #6b7280;
  cursor: pointer;
  user-select: none;
}

.ai-dialog-content {
  display: flex;
  flex-direction: column;
  height: calc(100% - 65px);
}

.knowledge-dimensions-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.knowledge-dimension-btn {
  padding: 1rem 1.25rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  height: 70px;
  display: flex;
  align-items: center;
}

.knowledge-dimension-btn:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.knowledge-dimension-btn.selected {
  border-color: #3b82f6;
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 600;
}

.dialog-buttons {
  display: flex;
  gap: 0.8rem;
  width: 100%;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-generate-questions {
  flex: 1;
  padding: 0.8rem 1rem;
  background: rgba(46, 196, 182, 0.12);
  color: #2ec4b6;
  border: 1.5px solid rgba(46, 196, 182, 0.3);
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.btn-generate-questions:hover:not(:disabled) {
  background: #2ec4b6;
  color: #fff;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(46, 196, 182, 0.3);
}

.btn-generate-questions:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-generate-questions:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  flex: 1;
  padding: 0.8rem 1rem;
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border: 1.5px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover:not(:disabled) {
  background: #ef4444;
  color: #fff;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-cancel:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ========= 错题本面板 ========= */
.question-bank-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.question-bank-panel {
  background: linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%);
  width: 65vw;
  max-width: 900px;
  height: 80vh;
  border-radius: 16px;
  box-shadow:
    0 25px 80px rgba(0, 0, 0, 0.25),
    0 0 1px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(46, 196, 182, 0.1);
}

.question-bank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.question-bank-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.btn-close-question-bank {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-question-bank:hover {
  background: #fee2e2;
}

.btn-close-question-bank svg {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

.question-bank-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* 知识点分组列表 */
.knowledge-groups {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.knowledge-group-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.knowledge-group-item:hover {
  border-color: var(--accent-teal);
  box-shadow: 0 4px 12px rgba(46, 196, 182, 0.1);
  transform: translateY(-2px);
}

.knowledge-group-item .knowledge-name {
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.knowledge-group-item .question-count {
  font-size: 0.85rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  margin-right: 0.75rem;
}

.knowledge-group-item .arrow-icon {
  font-size: 0.9rem;
  color: #9ca3af;
}

/* 返回按钮 */
.back-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  cursor: pointer;
}

.back-text {
  font-size: 0.95rem;
  color: var(--accent-teal);
  font-weight: 600;
}

.back-text:hover {
  color: var(--accent-orange);
}

/* 分组标题 */
.group-title {
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, rgba(46, 196, 182, 0.1) 0%, rgba(46, 196, 182, 0.05) 100%);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.group-title span {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
}

.question-sets-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.question-set-group {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition:
    box-shadow 0.3s,
    transform 0.2s;
}

.question-set-group:hover {
  box-shadow: 0 4px 16px rgba(46, 196, 182, 0.15);
}

.question-set-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 1.4rem;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  cursor: pointer;
  transition: all 0.25s ease;
  border-left: 4px solid transparent;
}

.question-set-header:hover {
  background: linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%);
  border-left-color: #2ec4b6;
}

.question-set-header.expanded {
  background: linear-gradient(135deg, #f0fdfa 0%, #f0fdfa 100%);
  border-left-color: #2ec4b6;
  border-bottom: 1px solid #ccfbf1;
}

.set-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #2ec4b6;
  background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
  padding: 0.4rem 1rem;
  border-radius: 8px;
  border: 1px solid #99f6e4;
}

.set-dimensions {
  flex: 1;
  font-size: 0.9rem;
  color: #4b5563;
  font-weight: 500;
}

.set-count {
  font-size: 0.8rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.expand-icon {
  font-size: 0.9rem;
  color: #2ec4b6;
  transition: transform 0.3s ease;
  background: #f0fdfa;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.question-set-questions {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 1.4rem;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.set-accuracy {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.2rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 10px;
  border: 1px solid #bae6fd;
}

.set-accuracy.pending {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-color: #d1d5db;
}

.set-accuracy.pending .accuracy-label {
  color: #6b7280;
}

.set-accuracy.pending .accuracy-value {
  color: #9ca3af;
}

.accuracy-label {
  font-size: 0.85rem;
  color: #0369a1;
  font-weight: 600;
}

.accuracy-value {
  font-size: 1rem;
  color: #0ea5e9;
  font-weight: 700;
}

.set-footer,
.questions-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 0;
  margin-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-submit-set {
  padding: 0.6rem 1.5rem;
  background: linear-gradient(135deg, #2ec4b6 0%, #20a89a 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(46, 196, 182, 0.3);
}

.btn-submit-set:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(46, 196, 182, 0.4);
}

.btn-submit-set:disabled {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  cursor: not-allowed;
  box-shadow: none;
}

/* ========= 加入错题本按钮 ========= */
.btn-add-wrong-book {
  padding: 0.6rem 1.5rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.btn-add-wrong-book:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

/* ========= 提交中状态 ========= */
.submitting-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.5rem;
  color: var(--accent-teal);
  font-size: 0.9rem;
  font-weight: 600;
}

/* ========= 收藏星星 ========= */
.star-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.8rem;
  margin-left: auto;
}

.star-icon svg {
  width: 24px;
  height: 24px;
  stroke: #f59e0b;
  transition: all 0.2s ease;
}

.star-icon:hover svg {
  transform: scale(1.1);
}

.star-icon.filled svg {
  fill: #f59e0b;
  stroke: #f59e0b;
}

/* ========= 答案解析 ========= */
.question-explanation {
  margin-top: 1rem;
  padding: 1rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
}

.explanation-content {
  font-size: 0.9rem;
  color: #166534;
  line-height: 1.6;
}

.code-snippet {
  margin-top: 0.8rem;
  padding: 0.8rem 1rem;
  background: #1e293b;
  color: #e2e8f0;
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  font-size: 0.85rem;
  border-radius: 6px;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-x: auto;
}

/* ========= 返回题库按钮 ========= */
.back-header {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-bottom: 1.5rem;
}

.back-header:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.back-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4b5563;
  transition: color 0.2s;
}

.back-header:hover .back-text {
  color: #3b82f6;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 题目分区 */
.question-section {
  margin-bottom: 1.5rem;
}

.section-divider {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1f2937;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid var(--accent-teal);
}

.question-item {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.4rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s;
}

.question-item:hover {
  border-color: #bfdbfe;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.question-number {
  font-weight: 700;
  color: #3b82f6;
  margin-right: 0.5rem;
}

.question-text {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  padding: 0.9rem 1.1rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  transition: all 0.2s;
  cursor: pointer;
}

.option-item:hover:not(.correct):not(.wrong) {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.option-item.wrong {
  background: #fee2e2 !important;
  border-color: #ef4444 !important;
}

.option-item.user-selected {
  border-color: #3b82f6 !important;
  border-width: 2px;
  background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%) !important;
}

/* correct 必须在 wrong 之后定义，确保优先级更高 */
.option-item.correct {
  background: #d1fae5 !important;
  border-color: #10b981 !important;
}

.option-item.correct.wrong {
  /* 如果同时有 correct 和 wrong（不应该发生），显示红色 */
  background: #fee2e2 !important;
  border-color: #ef4444 !important;
}

.correct-icon {
  margin-left: auto;
  font-weight: 700;
  color: #10b981;
}

.wrong-icon {
  margin-left: auto;
  font-weight: 700;
  color: #ef4444;
}

.option-label {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 50%;
  font-size: 0.85rem;
  font-weight: 700;
  color: #374151;
  border: 1px solid #d1d5db;
}

.option-item.correct .option-label {
  background: #10b981;
  color: #fff;
}

.option-item.wrong .option-label {
  background: #ef4444;
  color: #fff;
}

.option-text {
  flex: 1;
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.4;
}

.question-bank-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

/* ========= 空状态 ========= */
.empty-state {
  padding: 3rem;
  text-align: center;
}

.empty-text {
  font-size: 1rem;
  color: var(--text-secondary);
}

/* 无技能空状态（带边框样式） */
.empty-state.card-style {
  padding: 0.8rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-top: 1rem;
}

/* ========= 错题本入口 ========= */
.wrong-book-section {
  flex-shrink: 0;
  margin-top: 0;
  width: 320px;
}

.wrong-book-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.2rem;
  background: var(--bg-card);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  transition: all 0.3s;
}

.wrong-book-card:hover {
  border-color: #ef4444;
  box-shadow: 0 8px 30px rgba(239, 68, 68, 0.15);
}

.wrong-book-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.15);
  border-radius: 50%;
  flex-shrink: 0;
}

.wrong-book-icon svg {
  width: 20px;
  height: 20px;
  color: #ef4444;
}

.wrong-book-info {
  flex: 1;
  min-width: 0;
}

.wrong-book-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}

.wrong-book-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.total-wrong {
  color: #ef4444;
  font-weight: 600;
}

.btn-wrong-book {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-wrong-book:hover {
  background: #ef4444;
  color: var(--bg-dark);
  transform: scale(1.02);
}

/* ========= 响应式适配 ========= */
@media (max-width: 1024px) {
  .main-content {
    padding: 2rem 3%;
  }

  .wrong-book-section {
    width: 260px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1.5rem 1rem;
  }

  .search-bar-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .wrong-book-section {
    width: 100%;
    margin-top: 0;
  }

  .search-input {
    max-width: 100%;
  }

  .section-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .section-title {
    font-size: 1.3rem;
  }

  .career-header {
    padding: 1rem;
  }

  .career-title-row {
    flex-wrap: wrap;
  }

  .skill-grid {
    grid-template-columns: 1fr;
  }

  .skill-card {
    padding: 1rem;
  }

  .wrong-book-card {
    flex-direction: column;
    text-align: center;
    padding: 1.2rem;
    gap: 1rem;
  }

  .wrong-book-info {
    text-align: center;
  }

  .btn-wrong-book {
    width: 100%;
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

  .section-title {
    font-size: 1.2rem;
  }

  .career-item {
    margin-bottom: 0.8rem;
  }

  .career-header {
    padding: 0.8rem;
  }

  .career-name {
    font-size: 1rem;
  }

  .skill-actions {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }
}

/* ========= 轻量级提示弹窗 ========= */
.toast-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 5rem;
  pointer-events: none;
}

.toast-panel {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1.2rem;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  max-width: 360px;
  pointer-events: auto;
}

.toast-panel.success {
  border-left: 4px solid #10b981;
}

.toast-panel.error {
  border-left: 4px solid #ef4444;
}

.toast-panel.info {
  border-left: 4px solid #3b82f6;
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

.toast-panel.success .toast-icon {
  color: #10b981;
}

.toast-panel.error .toast-icon {
  color: #ef4444;
}

.toast-panel.info .toast-icon {
  color: #3b82f6;
}

.toast-icon svg {
  width: 100%;
  height: 100%;
}

.toast-message {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.toast-close:hover {
  background: #e5e7eb;
}

.toast-close svg {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

/* 弹窗动画 - 从下方弹入，向上滑出消失 */
.toast-enter-active {
  animation: toast-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  animation: toast-out 0.3s ease-in forwards;
}

@keyframes toast-in {
  0% {
    opacity: 0;
    transform: translateY(60px) scale(0.8);
  }
  60% {
    opacity: 1;
    transform: translateY(-10px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toast-out {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-80px) scale(0.9);
  }
}

/* ========= 二次确认弹窗 ========= */
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

.confirm-panel {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  width: 320px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

.confirm-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.confirm-icon {
  width: 24px;
  height: 24px;
  color: #f59e0b;
  flex-shrink: 0;
}

.confirm-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
}

.confirm-content {
  margin-bottom: 1.5rem;
}

.confirm-content p {
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.5;
  margin: 0;
}

.confirm-count {
  color: #ef4444;
  font-weight: 700;
}

.confirm-hint {
  margin-top: 0.5rem !important;
  font-size: 0.9rem !important;
  color: #9ca3af !important;
}

.confirm-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-confirm-cancel,
.btn-confirm-ok {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm-cancel {
  background: #f3f4f6;
  color: #4b5563;
}

.btn-confirm-cancel:hover {
  background: #e5e7eb;
}

.btn-confirm-ok {
  background: linear-gradient(135deg, #2ec4b6 0%, #20a89a 100%);
  color: #fff;
}

.btn-confirm-ok:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(46, 196, 182, 0.4);
}

/* 确认弹窗动画 */
.confirm-enter-active {
  animation: confirm-in 0.3s ease-out;
}

.confirm-leave-active {
  animation: confirm-out 0.2s ease-in forwards;
}

@keyframes confirm-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes confirm-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}
</style>
