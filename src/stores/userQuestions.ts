import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

// 用户题目数据项
export interface UserQuestion {
  questionId: string
  questionText: string
  correctAnswer: string
  explanation: string
  questionType: string
  skillName: string
  knowledgeName: string
  jobName: string
  id: string
  options?: string[] // 选择题有选项，判断题没有
}

const STORAGE_KEY = 'user-questions-data'
const EXPIRY_DAYS = 7

export const useUserQuestionsStore = defineStore('userQuestions', () => {
  // 用户题目列表
  const userQuestions = ref<UserQuestion[]>([])

  // 从 localStorage 加载数据
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        const now = Date.now()

        // 检查是否过期
        if (data.timestamp && now - data.timestamp < EXPIRY_DAYS * 24 * 60 * 60 * 1000) {
          userQuestions.value = data.questions || []
          return true
        }
      }
    } catch (error) {
      console.error('加载题目数据失败:', error)
    }
    return false
  }

  // 保存到 localStorage
  const saveToStorage = () => {
    try {
      const data = {
        questions: userQuestions.value,
        timestamp: Date.now(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('保存题目数据失败:', error)
    }
  }

  // 初始化时从 localStorage 加载
  loadFromStorage()

  // 监听数据变化自动保存
  watch(userQuestions, saveToStorage, { deep: true })

  // 设置题目数据
  const setUserQuestions = (questions: UserQuestion[]) => {
    userQuestions.value = questions
  }

  // 清空题目数据
  const clearUserQuestions = () => {
    userQuestions.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  // 检查数据是否存在
  const hasData = (): boolean => {
    return userQuestions.value.length > 0
  }

  // 检查数据是否过期
  const isDataExpired = (): boolean => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        if (data.timestamp) {
          const now = Date.now()
          return now - data.timestamp >= EXPIRY_DAYS * 24 * 60 * 60 * 1000
        }
      }
    } catch (error) {
      console.error('检查数据过期失败:', error)
    }
    return true // 如果无法读取，认为已过期
  }

  // 根据技能名获取题目
  const getQuestionsBySkill = (skillName: string): UserQuestion[] => {
    return userQuestions.value.filter((q) => q.skillName === skillName)
  }

  // 根据岗位名获取题目
  const getQuestionsByJob = (jobName: string): UserQuestion[] => {
    return userQuestions.value.filter((q) => q.jobName === jobName)
  }

  // 根据知识点获取题目
  const getQuestionsByKnowledge = (knowledgeName: string): UserQuestion[] => {
    return userQuestions.value.filter((q) => q.knowledgeName === knowledgeName)
  }

  return {
    userQuestions,
    setUserQuestions,
    clearUserQuestions,
    hasData,
    isDataExpired,
    getQuestionsBySkill,
    getQuestionsByJob,
    getQuestionsByKnowledge,
  }
})
