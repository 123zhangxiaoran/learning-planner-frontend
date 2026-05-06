import { defineStore } from 'pinia'
import { ref } from 'vue'

// 存储键名
const STORAGE_KEY = 'career-store'
const EXPIRY_KEY = 'career-store-expiry'

// 7天的毫秒数
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

export interface CareerStorage {
  jobNames: string[] // 选中的岗位名称列表
  timestamp: number // 存储时间戳
  jobToken?: string // 保存岗位后返回的凭证
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
  const initFromStorage = (): { jobNames: string[]; jobToken: string | null } => {
    if (isExpired()) {
      // 已过期，清除数据
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(EXPIRY_KEY)
      return { jobNames: [], jobToken: null }
    }
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data: CareerStorage = JSON.parse(stored)
        // 确保 jobNames 是数组
        const jobNames = Array.isArray(data.jobNames) ? data.jobNames : []
        // 确保 jobToken 是字符串或 null
        const jobToken = data.jobToken != null ? String(data.jobToken) : null
        return { jobNames, jobToken }
      } catch {
        // 解析失败，清除数据
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(EXPIRY_KEY)
        return { jobNames: [], jobToken: null }
      }
    }
    return { jobNames: [], jobToken: null }
  }

  // 从 storage 初始化数据
  const storageData = initFromStorage()

  // 选中的岗位名称列表
  const selectedJobNames = ref<string[]>(storageData.jobNames)

  // 保存岗位后返回的凭证
  const jobToken = ref<string | null>(storageData.jobToken)

  // 保存到 localStorage 并设置过期时间
  const saveToStorage = () => {
    try {
      const data: CareerStorage = {
        jobNames: selectedJobNames.value,
        timestamp: Date.now(),
        jobToken: jobToken.value || undefined,
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

  // 清空岗位名称（token过期或退出登录时调用）
  const clearJobNames = () => {
    try {
      selectedJobNames.value = []
      jobToken.value = null
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(EXPIRY_KEY)
    } catch (error) {
      console.error('清除 localStorage 失败:', error)
    }
  }

  return {
    selectedJobNames,
    jobToken,
    setJobNames,
    addJobName,
    removeJobName,
    setJobToken,
    clearJobNames,
  }
})
