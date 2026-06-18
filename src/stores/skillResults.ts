import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePlayerStore } from './user'

// 存储键名（带用户ID隔离）
const getStorageKey = (userId: number) => `skill-results-store-${userId}`
const getScoresKey = (userId: number) => `knowledge-scores-store-${userId}`
const getExpiryKey = (userId: number) => `skill-results-store-expiry-${userId}`

// 7天的毫秒数（与 career store 一致）
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

// 技能学习结果
export interface SkillResult {
  skill_name: string
  score: number
  dimensions: string[][] // 二维数组，每个子数组第一项为维度名，其余为知识点
}

export const useSkillResultsStore = defineStore('skillResults', () => {
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

  // 从 localStorage 初始化
  const initFromStorage = (): Record<string, SkillResult[]> => {
    const userId = currentUserId.value
    if (!userId) return {}
    if (isExpired(userId)) {
      localStorage.removeItem(getStorageKey(userId))
      localStorage.removeItem(getScoresKey(userId))
      localStorage.removeItem(getExpiryKey(userId))
      return {}
    }
    const stored = localStorage.getItem(getStorageKey(userId))
    if (stored) {
      try {
        const data = JSON.parse(stored) as Record<string, SkillResult[]>
        // 兼容旧数据：确保每个 skill 都有 dimensions 字段
        for (const jobName of Object.keys(data)) {
          data[jobName] = data[jobName]!.map((s) => ({
            ...s,
            dimensions: s.dimensions || [],
          }))
        }
        return data
      } catch {
        localStorage.removeItem(getStorageKey(userId))
        localStorage.removeItem(getScoresKey(userId))
        localStorage.removeItem(getExpiryKey(userId))
      }
    }
    return {}
  }

  // 从 localStorage 初始化知识点评分
  const initScoresFromStorage = (): Record<string, number> => {
    const userId = currentUserId.value
    if (!userId) return {}
    if (isExpired(userId)) {
      localStorage.removeItem(getScoresKey(userId))
      return {}
    }
    try {
      const stored = localStorage.getItem(getScoresKey(userId))
      return stored ? JSON.parse(stored) : {}
    } catch {
      localStorage.removeItem(getScoresKey(userId))
      return {}
    }
  }

  // 技能学习结果，key 为岗位名称，value 为该岗位已学习的技能列表
  const skillResults = ref<Record<string, SkillResult[]>>(initFromStorage())

  // 知识点评分，key 为 "skillName::knowledgeName"
  const knowledgeScores = ref<Record<string, number>>(initScoresFromStorage())

  // 保存到 localStorage
  const saveToStorage = () => {
    try {
      const userId = currentUserId.value
      if (!userId) return
      localStorage.setItem(getStorageKey(userId), JSON.stringify(skillResults.value))
      localStorage.setItem(getScoresKey(userId), JSON.stringify(knowledgeScores.value))
      localStorage.setItem(getExpiryKey(userId), String(Date.now() + SEVEN_DAYS))
    } catch (error) {
      console.error('保存技能学习结果失败:', error)
    }
  }

  // 添加技能学习结果
  const addSkillResult = (
    jobName: string,
    skillName: string,
    score: number,
    dimensions: string[][] = [],
  ) => {
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

  // 批量设置技能学习结果（全量替换）
  const setSkillResults = (data: Record<string, SkillResult[]>) => {
    skillResults.value = data
    saveToStorage()
  }

  // 批量设置知识点评分（全量替换）
  const setKnowledgeScores = (scores: Record<string, number>) => {
    knowledgeScores.value = scores
    saveToStorage()
  }

  // 清空所有技能学习结果
  const clearAll = () => {
    const userId = currentUserId.value
    skillResults.value = {}
    knowledgeScores.value = {}
    if (userId) {
      localStorage.removeItem(getStorageKey(userId))
      localStorage.removeItem(getScoresKey(userId))
      localStorage.removeItem(getExpiryKey(userId))
    }
  }

  // 删除指定技能
  const removeSkillResult = (skill: SkillResult, jobName: string) => {
    if (!skillResults.value[jobName]) return
    const index = skillResults.value[jobName].findIndex((s) => s.skill_name === skill.skill_name)
    if (index !== -1) {
      skillResults.value[jobName].splice(index, 1)
      // 同时删除该技能下的所有知识点评分
      if (skill.dimensions) {
        for (const dim of skill.dimensions) {
          if (dim.length > 0) {
            const key = `${skill.skill_name}::${dim[0]}`
            delete knowledgeScores.value[key]
          }
        }
      }
      saveToStorage()
    }
  }

  return {
    skillResults,
    knowledgeScores,
    addSkillResult,
    getSkillResultsByJob,
    setSkillResults,
    setKnowledgeScores,
    clearAll,
    removeSkillResult,
  }
})
