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

    <!-- 顶部导航栏 -->
    <NavBar />

    <!-- 主内容区域 -->
    <main class="main-content">
      <div class="page-header">
        <h2 class="page-title">收藏本</h2>
        <div class="header-right">
          <div class="view-toggle">
            <button
              class="toggle-btn"
              :class="{ active: viewMode === 'review' }"
              @click="viewMode = 'review'"
            >
              浏览模式
            </button>
            <button
              class="toggle-btn"
              :class="{ active: viewMode === 'practice' }"
              @click="viewMode = 'practice'"
            >
              练习模式
            </button>
          </div>
        </div>
      </div>

      <!-- 岗位技能列表 -->
      <section class="career-section">
        <div class="section-header">
          <h3 class="section-title">我的收藏题目</h3>
        </div>
        <div class="career-list">
          <details class="career-item" v-for="(career, cIndex) in careerList" :key="cIndex">
            <summary class="career-header">
              <div class="career-title-row">
                <h4 class="career-name">{{ career.name }}</h4>
                <span class="skill-count">{{ career.skills.length }} 个技能</span>
                <span class="expand-arrow">▶</span>
              </div>
              <div class="career-progress">
                <span class="progress-label">共 {{ career.total }} 道收藏题</span>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: Math.min(career.total * 10, 100) + '%' }"
                  ></div>
                </div>
              </div>
            </summary>
            <div class="career-content">
              <div v-if="career.skills.length > 0" class="skill-list">
                <div v-for="(skill, sIndex) in career.skills" :key="sIndex" class="skill-row">
                  <details class="skill-item">
                    <summary class="skill-summary">
                      <span class="skill-name">{{ skill.name }}</span>
                      <span class="skill-count-badge">{{ skill.questions.length }} 题</span>
                      <span class="expand-arrow">▶</span>
                    </summary>
                    <div class="skill-detail">
                      <!-- 浏览模式：直接显示题目+答案+解析 -->
                      <template v-if="viewMode === 'review'">
                        <!-- 判断题 -->
                        <div class="question-section" v-if="skill.judgeQuestions.length > 0">
                          <div class="section-divider">
                            判断题（{{ skill.judgeQuestions.length }}道）
                          </div>
                          <div
                            class="question-item"
                            v-for="question in skill.judgeQuestions"
                            :key="'judge-' + question.id"
                          >
                            <div class="question-text">
                              <span v-html="nl2br(question.questionText)"></span>
                            </div>
                            <div class="question-options">
                              <div
                                class="option-item"
                                :class="{
                                  correct: isJudgeCorrect(qIndex2, question.correctAnswer),
                                }"
                                v-for="(jOption, qIndex2) in ['正确', '错误']"
                                :key="qIndex2"
                              >
                                <span class="option-label">{{ optionLabel(qIndex2) }}</span>
                                <span class="option-text">{{ jOption }}</span>
                                <span
                                  class="mark-icon"
                                  v-if="isJudgeCorrect(qIndex2, question.correctAnswer)"
                                  >✓</span
                                >
                              </div>
                            </div>
                            <div class="question-explanation" v-if="question.explanation">
                              <div
                                class="explanation-content"
                                v-html="nl2br(question.explanation)"
                              ></div>
                            </div>
                          </div>
                        </div>
                        <!-- 选择题 -->
                        <div class="question-section" v-if="skill.choiceQuestions.length > 0">
                          <div class="section-divider">
                            选择题（{{ skill.choiceQuestions.length }}道）
                          </div>
                          <div
                            class="question-item"
                            v-for="question in skill.choiceQuestions"
                            :key="'choice-' + question.id"
                          >
                            <div class="question-text">
                              <span v-html="nl2br(question.questionText)"></span>
                            </div>
                            <div class="question-options">
                              <div
                                class="option-item"
                                :class="{
                                  correct: isChoiceCorrect(oIndex, question.correctAnswer),
                                }"
                                v-for="(option, oIndex) in question.options || []"
                                :key="oIndex"
                              >
                                <span class="option-label">{{ optionLabel(oIndex) }}</span>
                                <span
                                  class="option-text"
                                  v-html="nl2br(cleanOptionText(option))"
                                ></span>
                                <span
                                  class="mark-icon"
                                  v-if="isChoiceCorrect(oIndex, question.correctAnswer)"
                                  >✓</span
                                >
                              </div>
                            </div>
                            <div class="question-explanation" v-if="question.explanation">
                              <div
                                class="explanation-content"
                                v-html="nl2br(question.explanation)"
                              ></div>
                            </div>
                          </div>
                        </div>
                        <!-- 填空题 -->
                        <div class="question-section" v-if="skill.fillQuestions.length > 0">
                          <div class="section-divider">
                            填空题（{{ skill.fillQuestions.length }}道）
                          </div>
                          <div
                            class="question-item"
                            v-for="question in skill.fillQuestions"
                            :key="'fill-' + question.id"
                          >
                            <div class="question-text">
                              <span v-html="nl2br(question.questionText)"></span>
                            </div>
                            <div class="question-explanation" v-if="question.explanation">
                              <div class="explanation-label">正确答案：</div>
                              <div class="explanation-content">
                                <span
                                  v-for="(answer, idx) in question.correctAnswer?.split('|') || []"
                                  :key="idx"
                                >
                                  ({{ idx + 1 }}) {{ answer }}&nbsp;&nbsp;
                                </span>
                              </div>
                              <div class="explanation-label" v-if="question.explanation">
                                答案解析：
                              </div>
                              <div
                                class="explanation-content"
                                v-html="nl2br(question.explanation)"
                              ></div>
                            </div>
                          </div>
                        </div>
                        <!-- 分析题 -->
                        <div class="question-section" v-if="skill.analysisQuestions.length > 0">
                          <div class="section-divider">
                            分析题（{{ skill.analysisQuestions.length }}道）
                          </div>
                          <div
                            class="question-item"
                            v-for="question in skill.analysisQuestions"
                            :key="'analysis-' + question.id"
                          >
                            <div class="question-text">
                              <span v-html="nl2br(question.questionText)"></span>
                            </div>
                            <div class="question-explanation">
                              <div class="explanation-label">正确答案：</div>
                              <div
                                class="explanation-content"
                                v-html="nl2br(question.correctAnswer)"
                              ></div>
                            </div>
                          </div>
                        </div>
                      </template>

                      <!-- 练习模式：只显示题目，做完后显示答案+解析 -->
                      <template v-else>
                        <!-- 判断题 -->
                        <div class="question-section" v-if="skill.judgeQuestions.length > 0">
                          <div class="section-divider">
                            判断题（{{ skill.judgeQuestions.length }}道）
                          </div>
                          <div
                            class="question-item"
                            v-for="question in skill.judgeQuestions"
                            :key="'judge-' + question.id"
                          >
                            <div class="question-text">
                              <span v-html="nl2br(question.questionText)"></span>
                            </div>
                            <div class="question-options">
                              <div
                                class="option-item"
                                :class="{
                                  'user-selected': practiceAnswers[question.id] === jIndex,
                                  correct:
                                    revealedQuestions[question.id] &&
                                    isJudgeCorrect(jIndex, question.correctAnswer),
                                  wrong:
                                    revealedQuestions[question.id] &&
                                    practiceAnswers[question.id] === jIndex &&
                                    !isJudgeCorrect(jIndex, question.correctAnswer),
                                }"
                                v-for="(jOption, jIndex) in ['正确', '错误']"
                                :key="jIndex"
                                @click="handlePracticeAnswer(question.id, jIndex)"
                              >
                                <span class="option-label">{{ optionLabel(jIndex) }}</span>
                                <span class="option-text">{{ jOption }}</span>
                                <span
                                  class="mark-icon"
                                  v-if="
                                    revealedQuestions[question.id] &&
                                    isJudgeCorrect(jIndex, question.correctAnswer)
                                  "
                                  >✓</span
                                >
                                <span
                                  class="mark-icon wrong"
                                  v-if="
                                    revealedQuestions[question.id] &&
                                    practiceAnswers[question.id] === jIndex &&
                                    !isJudgeCorrect(jIndex, question.correctAnswer)
                                  "
                                  >✗</span
                                >
                              </div>
                            </div>
                            <div
                              class="question-explanation"
                              v-if="revealedQuestions[question.id] && question.explanation"
                            >
                              <div
                                class="explanation-content"
                                v-html="nl2br(question.explanation)"
                              ></div>
                            </div>
                          </div>
                        </div>
                        <!-- 选择题 -->
                        <div class="question-section" v-if="skill.choiceQuestions.length > 0">
                          <div class="section-divider">
                            选择题（{{ skill.choiceQuestions.length }}道）
                          </div>
                          <div
                            class="question-item"
                            v-for="question in skill.choiceQuestions"
                            :key="'choice-' + question.id"
                          >
                            <div class="question-text">
                              <span v-html="nl2br(question.questionText)"></span>
                            </div>
                            <div class="question-options">
                              <div
                                class="option-item"
                                :class="{
                                  'user-selected': practiceAnswers[question.id] === oIndex,
                                  correct:
                                    revealedQuestions[question.id] &&
                                    isChoiceCorrect(oIndex, question.correctAnswer),
                                  wrong:
                                    revealedQuestions[question.id] &&
                                    practiceAnswers[question.id] === oIndex &&
                                    !isChoiceCorrect(oIndex, question.correctAnswer),
                                }"
                                v-for="(option, oIndex) in question.options || []"
                                :key="oIndex"
                                @click="handlePracticeAnswer(question.id, oIndex)"
                              >
                                <span class="option-label">{{ optionLabel(oIndex) }}</span>
                                <span
                                  class="option-text"
                                  v-html="nl2br(cleanOptionText(option))"
                                ></span>
                                <span
                                  class="mark-icon"
                                  v-if="
                                    revealedQuestions[question.id] &&
                                    isChoiceCorrect(oIndex, question.correctAnswer)
                                  "
                                  >✓</span
                                >
                                <span
                                  class="mark-icon wrong"
                                  v-if="
                                    revealedQuestions[question.id] &&
                                    practiceAnswers[question.id] === oIndex &&
                                    !isChoiceCorrect(oIndex, question.correctAnswer)
                                  "
                                  >✗</span
                                >
                              </div>
                            </div>
                            <div
                              class="question-explanation"
                              v-if="revealedQuestions[question.id] && question.explanation"
                            >
                              <div
                                class="explanation-content"
                                v-html="nl2br(question.explanation)"
                              ></div>
                            </div>
                          </div>
                        </div>
                        <!-- 填空题 -->
                        <div class="question-section" v-if="skill.fillQuestions.length > 0">
                          <div class="section-divider">
                            填空题（{{ skill.fillQuestions.length }}道）
                          </div>
                          <div
                            class="question-item"
                            v-for="question in skill.fillQuestions"
                            :key="'fill-' + question.id"
                          >
                            <div class="question-text">
                              <span v-html="nl2br(question.questionText)"></span>
                            </div>
                            <div class="fill-inputs-wrapper" v-if="!revealedQuestions[question.id]">
                              <div
                                class="fill-input-item"
                                v-for="(answer, index) in question.correctAnswer?.split('|') || []"
                                :key="index"
                              >
                                <span class="fill-label">{{ index + 1 }}.</span>
                                <input
                                  type="text"
                                  class="fill-input"
                                  :value="
                                    (practiceAnswers[question.id] as string)?.split('|')[index] ||
                                    ''
                                  "
                                  @input="
                                    handleFillPractice(
                                      question.id,
                                      index,
                                      ($event.target as HTMLInputElement).value,
                                      (question.correctAnswer?.split('|') || []).length,
                                    )
                                  "
                                  :placeholder="`空${index + 1}`"
                                />
                              </div>
                              <button class="btn-submit-fill" @click="revealAnswer(question.id)">
                                提交
                              </button>
                            </div>
                            <div class="question-explanation" v-if="revealedQuestions[question.id]">
                              <div class="explanation-label">正确答案：</div>
                              <div class="explanation-content">
                                <span
                                  v-for="(answer, idx) in question.correctAnswer?.split('|') || []"
                                  :key="idx"
                                >
                                  ({{ idx + 1 }}) {{ answer }}&nbsp;&nbsp;
                                </span>
                              </div>
                              <div class="explanation-label" v-if="question.explanation">
                                答案解析：
                              </div>
                              <div
                                class="explanation-content"
                                v-html="nl2br(question.explanation)"
                              ></div>
                            </div>
                          </div>
                        </div>
                        <!-- 分析题 -->
                        <div class="question-section" v-if="skill.analysisQuestions.length > 0">
                          <div class="section-divider">
                            分析题（{{ skill.analysisQuestions.length }}道）
                          </div>
                          <div
                            class="question-item"
                            v-for="question in skill.analysisQuestions"
                            :key="'analysis-' + question.id"
                          >
                            <div class="question-text">
                              <span v-html="nl2br(question.questionText)"></span>
                            </div>
                            <div
                              class="question-input-wrapper"
                              v-if="!revealedQuestions[question.id]"
                            >
                              <textarea
                                class="question-text-input"
                                :value="(practiceAnswers[question.id] as string) || ''"
                                @input="
                                  handleTextPractice(
                                    question.id,
                                    ($event.target as HTMLTextAreaElement).value,
                                  )
                                "
                                placeholder="请输入你的分析..."
                                rows="3"
                              ></textarea>
                              <button class="btn-submit-fill" @click="revealAnswer(question.id)">
                                提交
                              </button>
                            </div>
                            <div class="question-explanation" v-if="revealedQuestions[question.id]">
                              <div class="explanation-label">参考答案：</div>
                              <div
                                class="explanation-content"
                                v-html="nl2br(question.correctAnswer)"
                              ></div>
                            </div>
                          </div>
                        </div>
                      </template>
                    </div>
                  </details>
                </div>
              </div>
              <div v-else class="empty-inline">
                <span class="empty-inline-text">暂无收藏题目</span>
              </div>
            </div>
          </details>
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-if="careerList.length === 0">
          <p class="empty-text">暂无收藏记录</p>
          <p class="empty-hint">完成练习后可将题目加入收藏</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/layout/NavBar.vue'
import { ref, computed, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/user'
import { useUserQuestionsStore, type UserQuestion } from '@/stores/userQuestions'
import { getUserQuestions } from '@/api/agent'

const playerStore = usePlayerStore()
const userQuestionsStore = useUserQuestionsStore()

// 查看模式：review（直接渲染答案）| practice（练习模式）
const viewMode = ref<'review' | 'practice'>('review')

// 练习模式的用户答案
const practiceAnswers = ref<Record<string, number | string>>({})
// 已揭示答案的题目
const revealedQuestions = ref<Record<string, boolean>>({})

// 只取 isCollect === 1 的题目
const collectedQuestions = computed(() => {
  return userQuestionsStore.userQuestions.filter((q) => q.isCollect === 1)
})

// 按岗位分组
const careerList = computed(() => {
  const map: Record<
    string,
    {
      name: string
      total: number
      skills: {
        name: string
        questions: UserQuestion[]
        judgeQuestions: UserQuestion[]
        choiceQuestions: UserQuestion[]
        fillQuestions: UserQuestion[]
        analysisQuestions: UserQuestion[]
      }[]
    }
  > = {}

  for (const q of collectedQuestions.value) {
    if (!map[q.jobName]) {
      map[q.jobName] = { name: q.jobName, total: 0, skills: [] }
    }
    const career = map[q.jobName]!
    career.total++

    let skillGroup = career.skills.find((s) => s.name === q.skillName)
    if (!skillGroup) {
      skillGroup = {
        name: q.skillName,
        questions: [],
        judgeQuestions: [],
        choiceQuestions: [],
        fillQuestions: [],
        analysisQuestions: [],
      }
      career.skills.push(skillGroup)
    }
    skillGroup.questions.push(q)
    if (q.questionType === 'judge') skillGroup.judgeQuestions.push(q)
    else if (q.questionType === 'choice') skillGroup.choiceQuestions.push(q)
    else if (q.questionType === 'fill') skillGroup.fillQuestions.push(q)
    else if (q.questionType === 'analysis') skillGroup.analysisQuestions.push(q)
  }

  return Object.values(map)
})

// 清理选项文本
function cleanOptionText(option: string): string {
  if (!option) return ''
  return option.trim().replace(/^[A-D][.．、,，\s)）]+/i, '')
}

// 将换行符转为 <br>（用于 v-html）
function nl2br(text: string | null | undefined): string {
  return (text || '').replace(/\\n/g, '<br>')
}

// 选项标签 A/B/C/D...
function optionLabel(index: number): string {
  return String.fromCharCode(65 + index)
}

// 判断题选项文本
function judgeText(index: number): string {
  return index === 0 ? '正确' : '错误'
}

// 判断题是否正确答案
function isJudgeCorrect(index: number, correctAnswer: string): boolean {
  return judgeText(index) === correctAnswer
}

// 选择题是否正确答案
function isChoiceCorrect(index: number, correctAnswer: string): boolean {
  return optionLabel(index) === correctAnswer?.toUpperCase()
}

// 页面加载时调用 API 获取最新题目数据
onMounted(async () => {
  const userId = playerStore.playerInfo?.id
  if (!userId) return

  try {
    const res = await getUserQuestions(userId)
    if (res.code === 200 && res.data) {
      userQuestionsStore.setUserQuestions(res.data as UserQuestion[])
    }
  } catch (e) {
    console.error('加载收藏题目数据失败', e)
  }
})

// ========= 练习模式函数 =========

// 处理判断/选择题
function handlePracticeAnswer(questionId: string, answerIndex: number) {
  practiceAnswers.value[questionId] = answerIndex
  revealedQuestions.value[questionId] = true
}

// 处理填空题输入
function handleFillPractice(questionId: string, index: number, value: string, totalCount: number) {
  if (revealedQuestions.value[questionId]) return
  const currentAnswer = (practiceAnswers.value[questionId] as string) || ''
  const answers = currentAnswer ? currentAnswer.split('|') : []
  while (answers.length < totalCount) answers.push('')
  answers[index] = value
  practiceAnswers.value[questionId] = answers.join('|')
}

// 处理分析题输入
function handleTextPractice(questionId: string, value: string) {
  if (revealedQuestions.value[questionId]) return
  practiceAnswers.value[questionId] = value
}

// 揭示答案（填空/分析题点击提交后）
function revealAnswer(questionId: string) {
  revealedQuestions.value[questionId] = true
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 5% 3rem 8%;
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

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* ========= 模式切换按钮 ========= */
.view-toggle {
  display: flex;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 3px;
}

.toggle-btn {
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: #f59e0b;
  color: #fff;
}

.toggle-btn:hover:not(.active) {
  color: var(--text-primary);
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
  gap: 0.8rem;
}

.career-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.skill-count {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.expand-arrow {
  font-size: 0.8rem;
  color: var(--text-secondary);
  transition: transform 0.3s;
}

.career-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.progress-bar {
  width: 150px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent-orange);
  border-radius: 10px;
  transition: width 0.5s ease;
}

.career-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

/* ========= 技能列表 ========= */
.skill-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding-top: 1rem;
}

.skill-row {
  display: flex;
  align-items: flex-start;
  gap: 0;
}

.skill-item {
  flex: 1;
  border: 1px solid rgba(245, 158, 11, 0.3);
  transition: all 0.3s;
  overflow: hidden;
}

.skill-item[open] {
  border-color: #f59e0b;
}

.skill-item[open] .expand-arrow {
  transform: rotate(90deg);
}

.skill-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1rem;
  cursor: pointer;
  list-style: none;
  font-weight: 500;
  background: rgba(245, 158, 11, 0.08);
}

.skill-summary::-webkit-details-marker {
  display: none;
}

.skill-name {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.02em;
}

.skill-count-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  background: #f59e0b;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
}

.skill-detail {
  padding: 0 0 0.8rem 0;
  border-top: 1px solid var(--border-color);
}

/* ========= 题目区域 ========= */
.question-section {
  margin-top: 0.8rem;
  padding: 0 1rem;
}

.question-section:first-child {
  margin-top: 0;
}

.section-divider {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent-teal);
  padding: 0.6rem 0;
  border-bottom: 1px solid rgba(46, 196, 182, 0.2);
  margin-bottom: 0.6rem;
}

.question-item {
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(245, 158, 11, 0.5);
}

.question-item:last-child {
  border-bottom: none;
}

.question-text {
  font-size: 0.9rem;
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 0.6rem;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.8rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  border-radius: 6px;
}

.option-item.correct {
  border-color: var(--accent-teal);
  background: rgba(46, 196, 182, 0.1);
}

.option-item.user-selected {
  border-color: #2ec4b6;
  background: rgba(46, 196, 182, 0.06);
}

.option-item.wrong {
  border-color: var(--accent-orange);
  background: rgba(255, 107, 53, 0.1);
}

.option-item:hover:not(.correct):not(.wrong) {
  border-color: var(--accent-teal);
  cursor: pointer;
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
  font-size: 0.9rem;
  color: var(--text-primary);
  flex: 1;
}

.mark-icon {
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent-teal);
}

.mark-icon.wrong {
  color: var(--accent-orange);
}

/* ========= 练习模式 - 输入框样式 ========= */
.fill-inputs-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
  margin-bottom: 0.6rem;
  padding: 0 1rem;
}

.fill-input-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.fill-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.fill-input {
  width: 140px;
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  transition: all 0.2s;
}

.fill-input:focus {
  outline: none;
  border-color: var(--accent-teal);
  box-shadow: 0 0 0 2px rgba(46, 196, 182, 0.15);
}

.btn-submit-fill {
  padding: 0.4rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  background: var(--accent-orange);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit-fill:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.question-input-wrapper {
  margin-bottom: 0.6rem;
  padding: 0 1rem;
}

.question-text-input {
  width: 100%;
  padding: 0.5rem 0.8rem;
  font-size: 0.85rem;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
  margin-bottom: 0.6rem;
}

.question-text-input:focus {
  outline: none;
  border-color: var(--accent-teal);
  box-shadow: 0 0 0 2px rgba(46, 196, 182, 0.15);
}

/* ========= 答案解析 ========= */
.question-explanation {
  margin-top: 0.6rem;
  padding: 0.8rem 1rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.explanation-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #166534;
  margin-top: 0.6rem;
}

.explanation-label:first-child {
  margin-top: 0;
}

.explanation-content {
  font-size: 0.85rem;
  color: #166534;
  line-height: 1.6;
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

.empty-inline {
  padding: 1rem;
  text-align: center;
}

.empty-inline-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* ========= 响应式适配 ========= */
@media (max-width: 1024px) {
  .main-content {
    padding: 2rem 3%;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1.5rem 1rem;
  }

  .page-title {
    font-size: 1.5rem;
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
    flex-direction: column;
    gap: 0.8rem;
    align-items: flex-start;
    padding: 1rem;
  }

  .career-title-row {
    width: 100%;
    justify-content: space-between;
  }

  .career-name {
    font-size: 1.1rem;
  }

  .career-progress {
    width: 100%;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .progress-label {
    font-size: 0.8rem;
  }

  .progress-bar {
    flex: 1;
    min-width: 100px;
    height: 8px;
  }

  .career-content {
    padding: 0 1rem 1rem 1rem;
  }

  .skill-summary {
    flex-wrap: wrap;
    gap: 0.4rem;
    padding: 0.6rem 0.8rem;
  }

  .skill-name {
    font-size: 0.85rem;
    width: 100%;
  }

  .view-toggle {
    margin-top: 0.5rem;
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

  .progress-label {
    font-size: 0.75rem;
  }

  .progress-bar {
    height: 6px;
  }

  .skill-list {
    gap: 0.6rem;
  }

  .skill-summary {
    padding: 0.6rem 0.8rem;
  }

  .skill-detail {
    padding: 0 0.8rem 0.6rem 0.8rem;
  }

  .question-item {
    padding: 0.6rem 0;
  }

  .question-text {
    font-size: 0.85rem;
  }

  .option-item {
    padding: 0.4rem 0.6rem;
  }

  .option-text {
    font-size: 0.85rem;
  }
}
</style>
