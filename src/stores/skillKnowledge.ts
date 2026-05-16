import { defineStore } from 'pinia'
import { ref } from 'vue'

// 存储键名
const STORAGE_KEY = 'skill-knowledge-store'
const EXPIRY_KEY = 'skill-knowledge-expiry'

// 1天的毫秒数
const ONE_DAY = 24 * 60 * 60 * 1000

// 技能知识点存储
export interface SkillKnowledgeStorage {
  skill_name: string
  job_name: string // 技能所属的岗位名称
  dimensions: string[]
  timestamp: number
}

export const useSkillKnowledgeStore = defineStore('skillKnowledge', () => {
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

  // 技能知识点数据
  const skillKnowledgeData = ref<SkillKnowledgeStorage | null>(null)

  // 从 localStorage 初始化
  const initFromStorage = (): SkillKnowledgeStorage | null => {
    if (isExpired()) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(EXPIRY_KEY)
      return null
    }
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored) as SkillKnowledgeStorage
      } catch {
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(EXPIRY_KEY)
        return null
      }
    }
    return null
  }

  // 初始化
  skillKnowledgeData.value = initFromStorage()

  // 保存技能知识点到 localStorage（1天过期）
  const setSkillKnowledge = (data: Omit<SkillKnowledgeStorage, 'timestamp'>) => {
    try {
      const storageData: SkillKnowledgeStorage = {
        ...data,
        timestamp: Date.now(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData))
      localStorage.setItem(EXPIRY_KEY, String(Date.now() + ONE_DAY))
      skillKnowledgeData.value = storageData
    } catch (error) {
      console.error('保存技能知识点失败:', error)
    }
  }

  // 清除技能知识点
  const clearSkillKnowledge = () => {
    try {
      skillKnowledgeData.value = null
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(EXPIRY_KEY)
    } catch (error) {
      console.error('清除技能知识点失败:', error)
    }
  }

  return {
    skillKnowledgeData,
    setSkillKnowledge,
    clearSkillKnowledge,
  }
})
