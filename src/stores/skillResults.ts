import { defineStore } from 'pinia'
import { ref } from 'vue'

// 存储键名
const STORAGE_KEY = 'skill-results-store'
const EXPIRY_KEY = 'skill-results-store-expiry'

// 7天的毫秒数（与 career store 一致）
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

// 技能学习结果
export interface SkillResult {
  skill_name: string
  score: number
  dimensions: string[] // 知识点列表
}

export const useSkillResultsStore = defineStore('skillResults', () => {
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

  // 从 localStorage 初始化
  const initFromStorage = (): Record<string, SkillResult[]> => {
    if (isExpired()) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(EXPIRY_KEY)
      return {}
    }
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored) as Record<string, SkillResult[]>
        // 兼容旧数据：确保每个 skill 都有 dimensions 字段
        for (const jobName of Object.keys(data)) {
          data[jobName] = data[jobName].map((s) => ({
            ...s,
            dimensions: s.dimensions || [],
          }))
        }
        return data
      } catch {
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(EXPIRY_KEY)
      }
    }
    return {}
  }

  // 技能学习结果，key 为岗位名称，value 为该岗位已学习的技能列表
  const skillResults = ref<Record<string, SkillResult[]>>(initFromStorage())

  // 保存到 localStorage
  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(skillResults.value))
      localStorage.setItem(EXPIRY_KEY, String(Date.now() + SEVEN_DAYS))
    } catch (error) {
      console.error('保存技能学习结果失败:', error)
    }
  }

  // 添加技能学习结果
  const addSkillResult = (jobName: string, skillName: string, score: number, dimensions: string[] = []) => {
    if (!skillResults.value[jobName]) {
      skillResults.value[jobName] = []
    }
    // 避免重复添加同一个技能
    const exists = skillResults.value[jobName].some((s) => s.skill_name === skillName)
    if (!exists) {
      skillResults.value[jobName].push({ skill_name: skillName, score, dimensions })
      saveToStorage()
    }
  }

  // 获取某个岗位的技能学习结果
  const getSkillResultsByJob = (jobName: string): SkillResult[] => {
    return skillResults.value[jobName] || []
  }

  // 清空所有技能学习结果
  const clearAll = () => {
    skillResults.value = {}
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(EXPIRY_KEY)
  }

  return {
    skillResults,
    addSkillResult,
    getSkillResultsByJob,
    clearAll,
  }
})
