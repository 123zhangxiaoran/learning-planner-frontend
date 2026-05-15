import { defineStore } from 'pinia'
import { ref } from 'vue'

// 存储键名
const STORAGE_KEY = 'career-store'
const EXPIRY_KEY = 'career-store-expiry'
const SKILL_KNOWLEDGE_KEY = 'skill-knowledge-store'
const SKILL_KNOWLEDGE_EXPIRY_KEY = 'skill-knowledge-expiry'

// 7天的毫秒数
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
// 1天的毫秒数
const ONE_DAY = 24 * 60 * 60 * 1000

export interface CareerStorage {
  jobNames: string[] // 选中的岗位名称列表
  timestamp: number // 存储时间戳
  jobToken?: string // 保存岗位后返回的凭证
  hasCalledSaveJob?: boolean // 是否已调用过 saveJob 接口
}

// 技能知识点存储
export interface SkillKnowledgeStorage {
  skill_name: string
  dimensions: string[]
  timestamp: number
}

export const useCareerStore = defineStore('career', () => {
  // 检查是否过期
  const isExpired = (): boolean => {
    try {
      const expiry = localStorage.getItem(EXPIRY_KEY)
      if (!expiry) return true
      const expiryTime = parseInt(expiry)
      if (isNaN(expiryTime)) return true
      return Date.now() > expiryTime
    } catch {
      return true
    }
  }

  // 从 localStorage 初始化数据
  const initFromStorage = (): {
    jobNames: string[]
    jobToken: string | null
    hasCalledSaveJob: boolean
  } => {
    if (isExpired()) {
      // 已过期，清除数据
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(EXPIRY_KEY)
      return { jobNames: [], jobToken: null, hasCalledSaveJob: false }
    }
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data: CareerStorage = JSON.parse(stored)
        // 确保 jobNames 是数组
        const jobNames = Array.isArray(data.jobNames) ? data.jobNames : []
        // 确保 jobToken 是字符串或 null
        const jobToken = data.jobToken != null ? String(data.jobToken) : null
        // 确保 hasCalledSaveJob 是布尔值
        const hasCalledSaveJob = data.hasCalledSaveJob === true
        return { jobNames, jobToken, hasCalledSaveJob }
      } catch {
        // 解析失败，清除数据
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(EXPIRY_KEY)
        return { jobNames: [], jobToken: null, hasCalledSaveJob: false }
      }
    }
    return { jobNames: [], jobToken: null, hasCalledSaveJob: false }
  }

  // 从 storage 初始化数据
  const storageData = initFromStorage()

  // 选中的岗位名称列表
  const selectedJobNames = ref<string[]>(storageData.jobNames)

  // 保存岗位后返回的凭证
  const jobToken = ref<string | null>(storageData.jobToken)

  // 是否已调用过 saveJob 接口（用于判断 searchSkill 首次调用时是否传 isNews）
  const hasCalledSaveJob = ref<boolean>(storageData.hasCalledSaveJob ?? false)

  // 保存到 localStorage 并设置过期时间
  const saveToStorage = () => {
    try {
      const data: CareerStorage = {
        jobNames: selectedJobNames.value,
        timestamp: Date.now(),
        jobToken: jobToken.value || undefined,
        hasCalledSaveJob: hasCalledSaveJob.value,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      localStorage.setItem(EXPIRY_KEY, String(Date.now() + SEVEN_DAYS))
    } catch (error) {
      console.error('保存到 localStorage 失败:', error)
    }
  }

  // 设置岗位名称列表
  const setJobNames = (names: string[]) => {
    selectedJobNames.value = names
    saveToStorage()
  }

  // 添加岗位名称
  const addJobName = (name: string) => {
    if (!selectedJobNames.value.includes(name)) {
      selectedJobNames.value.push(name)
      saveToStorage()
    }
  }

  // 移除岗位名称
  const removeJobName = (name: string) => {
    const index = selectedJobNames.value.indexOf(name)
    if (index > -1) {
      selectedJobNames.value.splice(index, 1)
      saveToStorage()
    }
  }

  // 设置岗位凭证
  const setJobToken = (token: string | number) => {
    jobToken.value = token != null ? String(token) : null
    saveToStorage()
  }

  // 标记已调用过 saveJob 接口
  const setHasCalledSaveJob = (called: boolean) => {
    hasCalledSaveJob.value = called
    saveToStorage()
  }

  // 清空岗位名称（token过期或退出登录时调用）
  const clearJobNames = () => {
    try {
      selectedJobNames.value = []
      jobToken.value = null
      hasCalledSaveJob.value = false
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(EXPIRY_KEY)
    } catch (error) {
      console.error('清除 localStorage 失败:', error)
    }
  }

  // 检查技能知识点是否过期
  const isSkillKnowledgeExpired = (): boolean => {
    try {
      const expiry = localStorage.getItem(SKILL_KNOWLEDGE_EXPIRY_KEY)
      if (!expiry) return true
      const expiryTime = parseInt(expiry)
      if (isNaN(expiryTime)) return true
      return Date.now() > expiryTime
    } catch {
      return true
    }
  }

  // 技能知识点数据
  const skillKnowledgeData = ref<SkillKnowledgeStorage | null>(null)

  // 从 localStorage 初始化技能知识点数据
  const initSkillKnowledgeFromStorage = (): SkillKnowledgeStorage | null => {
    if (isSkillKnowledgeExpired()) {
      localStorage.removeItem(SKILL_KNOWLEDGE_KEY)
      localStorage.removeItem(SKILL_KNOWLEDGE_EXPIRY_KEY)
      return null
    }
    const stored = localStorage.getItem(SKILL_KNOWLEDGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored) as SkillKnowledgeStorage
      } catch {
        localStorage.removeItem(SKILL_KNOWLEDGE_KEY)
        localStorage.removeItem(SKILL_KNOWLEDGE_EXPIRY_KEY)
        return null
      }
    }
    return null
  }

  // 初始化
  skillKnowledgeData.value = initSkillKnowledgeFromStorage()

  // 保存技能知识点到 localStorage（1天过期）
  const setSkillKnowledge = (data: Omit<SkillKnowledgeStorage, 'timestamp'>) => {
    try {
      const storageData: SkillKnowledgeStorage = {
        ...data,
        timestamp: Date.now(),
      }
      localStorage.setItem(SKILL_KNOWLEDGE_KEY, JSON.stringify(storageData))
      localStorage.setItem(SKILL_KNOWLEDGE_EXPIRY_KEY, String(Date.now() + ONE_DAY))
      skillKnowledgeData.value = storageData
    } catch (error) {
      console.error('保存技能知识点失败:', error)
    }
  }

  // 清除技能知识点
  const clearSkillKnowledge = () => {
    try {
      skillKnowledgeData.value = null
      localStorage.removeItem(SKILL_KNOWLEDGE_KEY)
      localStorage.removeItem(SKILL_KNOWLEDGE_EXPIRY_KEY)
    } catch (error) {
      console.error('清除技能知识点失败:', error)
    }
  }

  return {
    selectedJobNames,
    jobToken,
    hasCalledSaveJob,
    setJobNames,
    addJobName,
    removeJobName,
    setJobToken,
    setHasCalledSaveJob,
    clearJobNames,
    skillKnowledgeData,
    setSkillKnowledge,
    clearSkillKnowledge,
  }
})
