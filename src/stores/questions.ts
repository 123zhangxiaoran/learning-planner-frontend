import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GeneratedQuestion } from '@/api/agent'

// 存储键名
const STORAGE_KEY = 'questions-store'
const LAST_CLEAR_KEY = 'questions-last-clear-time'
const GENERATING_KEY = 'questions-generating' // 正在生成的技能key
const EXPIRE_DAYS = 7 // 7天后自动清除

// 题目集合（每次生成的一批题目）
export interface QuestionSet {
  id: string
  jobName: string
  skillName: string
  dimensions: string[]
  createdAt: Date
  questions: GeneratedQuestion[]
}

// 带岗位和技能信息的题目（用于兼容）
export interface QuestionWithContext extends GeneratedQuestion {
  jobName: string
  skillName: string
}

// 检查是否需要清除过期数据
const checkAndClearExpired = () => {
  const lastClearTime = localStorage.getItem(LAST_CLEAR_KEY)
  const now = Date.now()
  const expireMs = EXPIRE_DAYS * 24 * 60 * 60 * 1000

  if (lastClearTime) {
    const lastClear = parseInt(lastClearTime, 10)
    if (now - lastClear > expireMs) {
      // 超过7天，清除数据
      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem(LAST_CLEAR_KEY, now.toString())
      console.log('题目数据已过期，已自动清除')
      return true
    }
  } else {
    // 首次设置清除时间
    localStorage.setItem(LAST_CLEAR_KEY, now.toString())
  }
  return false
}

// 检查正在生成的状态是否过期（超过5分钟视为失效），未过期则返回key
const getGeneratingKeyFromStorage = (): string | null => {
  const generating = localStorage.getItem(GENERATING_KEY)
  if (!generating) return null

  try {
    const data = JSON.parse(generating)
    const elapsed = Date.now() - data.timestamp
    const fiveMinutes = 5 * 60 * 1000

    if (elapsed > fiveMinutes) {
      // 超过5分钟，清除状态
      localStorage.removeItem(GENERATING_KEY)
      console.log('生成状态已过期，清除')
      return null
    }
    return data.key || null
  } catch {
    localStorage.removeItem(GENERATING_KEY)
    return null
  }
}

// 从 localStorage 初始化
const initFromStorage = (): Record<string, QuestionSet[]> => {
  // 先检查过期数据
  if (checkAndClearExpired()) {
    return {}
  }
  // 检查生成状态是否过期
  getGeneratingKeyFromStorage()

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    console.log('从localStorage加载题目数据:', stored)
    if (stored) {
      const data = JSON.parse(stored)
      // 转换 createdAt 字符串为 Date 对象
      for (const key of Object.keys(data)) {
        data[key] = data[key].map((set: QuestionSet) => ({
          ...set,
          createdAt: new Date(set.createdAt),
        }))
      }
      console.log('解析后的数据:', data)
      return data
    }
  } catch (e) {
    console.error('加载题目数据失败:', e)
    localStorage.removeItem(STORAGE_KEY)
  }
  return {}
}

export const useQuestionsStore = defineStore('questions', () => {
  const initialData = initFromStorage()
  console.log('questions store初始化数据:', initialData)
  // 使用普通对象代替 Map，确保 Vue 响应式正常
  const questionSetsByKey = ref<Record<string, QuestionSet[]>>(initialData)

  // 正在生成的技能标识（从localStorage恢复）
  const generatingKey = ref<string | null>(getGeneratingKeyFromStorage())
  console.log('正在生成的key:', generatingKey.value)

  // 保存到 localStorage
  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questionSetsByKey.value))
    } catch (error) {
      console.error('保存题目数据失败:', error)
    }
  }

  // 生成唯一ID
  const generateSetId = () => {
    return `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 获取存储key
  const getSetKey = (jobName: string, skillName: string) => {
    return `${jobName}::${skillName}`
  }

  // 设置正在生成状态（刷新页面也能恢复）
  const setGenerating = (jobName: string, skillName: string) => {
    generatingKey.value = getSetKey(jobName, skillName)
    localStorage.setItem(GENERATING_KEY, JSON.stringify({
      key: generatingKey.value,
      timestamp: Date.now(),
    }))
  }

  // 清除正在生成状态
  const clearGenerating = () => {
    generatingKey.value = null
    localStorage.removeItem(GENERATING_KEY)
  }

  // 检查是否正在生成某个技能
  const isGenerating = (jobName: string, skillName: string): boolean => {
    const key = getSetKey(jobName, skillName)
    return generatingKey.value === key
  }

  // 添加题目集合
  const addQuestionSet = (
    jobName: string,
    skillName: string,
    dimensions: string[],
    questions: GeneratedQuestion[]
  ) => {
    const key = getSetKey(jobName, skillName)
    const newSet: QuestionSet = {
      id: generateSetId(),
      jobName,
      skillName,
      dimensions,
      createdAt: new Date(),
      questions,
    }

    const existingSets = questionSetsByKey.value[key] || []
    questionSetsByKey.value[key] = [...existingSets, newSet]
    console.log('添加题目后store:', questionSetsByKey.value)
    saveToStorage()
    console.log('保存后localStorage:', localStorage.getItem(STORAGE_KEY))
  }

  // 获取指定技能的所有题目集合
  const getQuestionSetsBySkillAndJob = (jobName: string, skillName: string) => {
    const key = getSetKey(jobName, skillName)
    return questionSetsByKey.value[key] || []
  }

  // 获取指定技能的所有题目（平铺）
  const getQuestionsBySkillAndJob = (jobName: string, skillName: string) => {
    const sets = getQuestionSetsBySkillAndJob(jobName, skillName)
    return sets.flatMap((set) => set.questions)
  }

  // 清空指定技能的题目
  const clearQuestionsBySkillAndJob = (jobName: string, skillName: string) => {
    const key = getSetKey(jobName, skillName)
    delete questionSetsByKey.value[key]
    saveToStorage()
  }

  // 清空所有题目
  const clearAllQuestions = () => {
    questionSetsByKey.value = {}
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LAST_CLEAR_KEY)
  }

  return {
    questionSetsByKey,
    generatingKey,
    setGenerating,
    clearGenerating,
    isGenerating,
    addQuestionSet,
    getQuestionSetsBySkillAndJob,
    getQuestionsBySkillAndJob,
    clearQuestionsBySkillAndJob,
    clearAllQuestions,
  }
})
