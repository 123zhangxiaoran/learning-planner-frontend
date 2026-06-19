import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePlayerStore } from './user'

// 存储键名（带用户ID隔离）
const getStorageKey = (userId: number) => `skill-knowledge-store-${userId}`
const getExpiryKey = (userId: number) => `skill-knowledge-expiry-${userId}`

// 1天的毫秒数
const ONE_DAY = 24 * 60 * 60 * 1000

// 技能知识点存储（单个）
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

  // 从 localStorage 初始化整个记录
  const initFromStorage = (): Record<string, SkillKnowledgeStorage> => {
    const userId = currentUserId.value
    if (!userId) return {}
    if (isExpired(userId)) {
      localStorage.removeItem(getStorageKey(userId))
      localStorage.removeItem(getExpiryKey(userId))
      return {}
    }
    const stored = localStorage.getItem(getStorageKey(userId))
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // 兼容旧数据：如果是单个对象（有 skill_name 字段），转为 record
        if (parsed.skill_name) {
          const key = `${parsed.job_name}::${parsed.skill_name}`
          return { [key]: parsed as SkillKnowledgeStorage }
        }
        // 新格式：已经是 record
        return parsed as Record<string, SkillKnowledgeStorage>
      } catch {
        localStorage.removeItem(getStorageKey(userId))
        localStorage.removeItem(getExpiryKey(userId))
      }
    }
    return {}
  }

  // 从 record 中获取第一个技能作为当前选中（向后兼容）
  const getFirstSkillFromRecord = (record: Record<string, SkillKnowledgeStorage>): SkillKnowledgeStorage | null => {
    const keys = Object.keys(record)
    return keys.length > 0 ? record[keys[0]]! : null
  }

  // 技能知识点记录，key 为 "job_name::skill_name"
  const skillKnowledgeRecord = ref<Record<string, SkillKnowledgeStorage>>(initFromStorage())

  // 当前选中的技能知识点（向后兼容 SkillPage 等旧代码）
  const skillKnowledgeData = ref<SkillKnowledgeStorage | null>(
    getFirstSkillFromRecord(skillKnowledgeRecord.value),
  )

  // 保存到 localStorage
  const saveToStorage = () => {
    try {
      const userId = currentUserId.value
      if (!userId) return
      localStorage.setItem(getStorageKey(userId), JSON.stringify(skillKnowledgeRecord.value))
      localStorage.setItem(getExpiryKey(userId), String(Date.now() + ONE_DAY))
    } catch (error) {
      console.error('保存技能知识点失败:', error)
    }
  }

  // 设置单个技能知识点（如果已存在则更新，同时设为当前选中）
  const setSkillKnowledge = (data: Omit<SkillKnowledgeStorage, 'timestamp'>) => {
    const key = `${data.job_name}::${data.skill_name}`
    const storageData: SkillKnowledgeStorage = {
      ...data,
      timestamp: Date.now(),
    }
    skillKnowledgeRecord.value = {
      ...skillKnowledgeRecord.value,
      [key]: storageData,
    }
    // 更新当前选中指针
    skillKnowledgeData.value = storageData
    saveToStorage()
  }

  // 批量添加技能知识点，不覆盖已有的（用于 getUserKnowledgeData 初始化）
  const setSkillKnowledgeList = (
    list: Array<{ job_name: string; skill_name: string; dimensions: string[][] }>,
  ) => {
    const newRecord = { ...skillKnowledgeRecord.value }
    for (const item of list) {
      const key = `${item.job_name}::${item.skill_name}`
      if (!newRecord[key]) {
        newRecord[key] = {
          ...item,
          timestamp: Date.now(),
        }
      }
    }
    skillKnowledgeRecord.value = newRecord
    // 如果当前没有选中，设为第一个
    if (!skillKnowledgeData.value) {
      skillKnowledgeData.value = getFirstSkillFromRecord(newRecord)
    }
    saveToStorage()
  }

  // 通过 job_name 和 skill_name 查找技能知识点
  const getSkillKnowledge = (jobName: string, skillName: string): SkillKnowledgeStorage | null => {
    const key = `${jobName}::${skillName}`
    return skillKnowledgeRecord.value[key] || null
  }

  // 清除所有技能知识点
  const clearSkillKnowledge = () => {
    try {
      const userId = currentUserId.value
      skillKnowledgeRecord.value = {}
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
    setSkillKnowledgeList,
    getSkillKnowledge,
    clearSkillKnowledge,
  }
})
