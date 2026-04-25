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
}

export const useCareerStore = defineStore('career', () => {
  // 检查是否过期
  const isExpired = (): boolean => {
    const expiry = localStorage.getItem(EXPIRY_KEY)
    if (!expiry) return true
    return Date.now() > parseInt(expiry)
  }

  // 从 localStorage 初始化数据
  const initFromStorage = (): string[] => {
    if (isExpired()) {
      // 已过期，清除数据
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(EXPIRY_KEY)
      return []
    }
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data: CareerStorage = JSON.parse(stored)
        return data.jobNames || []
      } catch {
        return []
      }
    }
    return []
  }

  // 选中的岗位名称列表
  const selectedJobNames = ref<string[]>(initFromStorage())

  // 保存到 localStorage 并设置过期时间
  const saveToStorage = () => {
    const data: CareerStorage = {
      jobNames: selectedJobNames.value,
      timestamp: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    localStorage.setItem(EXPIRY_KEY, String(Date.now() + SEVEN_DAYS))
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

  // 清空岗位名称（token过期或退出登录时调用）
  const clearJobNames = () => {
    selectedJobNames.value = []
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(EXPIRY_KEY)
  }

  return {
    selectedJobNames,
    setJobNames,
    addJobName,
    removeJobName,
    clearJobNames,
  }
})
