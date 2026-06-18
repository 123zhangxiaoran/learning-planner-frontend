import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePlayerStore } from './user'

// 存储键名（带用户ID隔离）
const getStorageKey = (userId: number) => `skill-knowledge-store-${userId}`
const getExpiryKey = (userId: number) => `skill-knowledge-expiry-${userId}`

// 1天的毫秒数
const ONE_DAY = 24 * 60 * 60 * 1000

// 技能知识点存储
export interface SkillKnowledgeStorage {
  skill_name: string
  job_name: string // 技能所属的岗位名称
  dimensions: string[][] // 二维数组，每个子数组第一项为维度名，其余为知识点
  timestamp: number
}

export const useSkillKnowledgeStore = defineStore('skillKnowledge', () => {
  // 获取当前用户ID
  const playerStore = usePlayerStore()
  const currentUserId = computed(() => playerStore.playerInfo?.id || 0)

  // 检查是否过期
  const isExpired = (userId: number): boolean => {
    try {
      const expiry = localStorage.getItem(getExpiryKey(userId))
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
    const userId = currentUserId.value
    if (!userId) return null
    if (isExpired(userId)) {
      localStorage.removeItem(getStorageKey(userId))
      localStorage.removeItem(getExpiryKey(userId))
      return null
    }
    const stored = localStorage.getItem(getStorageKey(userId))
    if (stored) {
      try {
        return JSON.parse(stored) as SkillKnowledgeStorage
      } catch {
        localStorage.removeItem(getStorageKey(userId))
        localStorage.removeItem(getExpiryKey(userId))
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
      const userId = currentUserId.value
      if (!userId) return
      const storageData: SkillKnowledgeStorage = {
        ...data,
        timestamp: Date.now(),
      }
      localStorage.setItem(getStorageKey(userId), JSON.stringify(storageData))
      localStorage.setItem(getExpiryKey(userId), String(Date.now() + ONE_DAY))
      skillKnowledgeData.value = storageData
    } catch (error) {
      console.error('保存技能知识点失败:', error)
    }
  }

  // 清除技能知识点
  const clearSkillKnowledge = () => {
    try {
      const userId = currentUserId.value
      skillKnowledgeData.value = null
      if (userId) {
        localStorage.removeItem(getStorageKey(userId))
        localStorage.removeItem(getExpiryKey(userId))
      }
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
