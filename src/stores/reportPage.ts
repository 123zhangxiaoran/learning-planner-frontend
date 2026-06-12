import { defineStore } from 'pinia'
import { ref } from 'vue'

// 知识点评分项
export interface KnowledgeScoreItem {
  order: number
  knowledge_name: string
  score: number
}

// 报告页面数据
export interface ReportPageData {
  userid: number
  scores: KnowledgeScoreItem[]
}

export const useReportPageStore = defineStore('reportPage', () => {
  // 报告数据
  const reportData = ref<ReportPageData | null>(null)

  // 是否已加载数据
  const isLoaded = ref(false)

  // 设置报告数据（直接覆盖旧数据）
  const setReportData = (data: ReportPageData) => {
    reportData.value = data
    isLoaded.value = true
  }

  // 根据order获取知识点分数
  const getScoreByOrder = (order: number): number | null => {
    if (!reportData.value?.scores) return null
    const item = reportData.value.scores.find((s) => s.order === order)
    return item?.score ?? null
  }

  // 根据 skill_name 和 knowledge_name 获取分数
  const getScoreByKnowledge = (
    skillName: string,
    knowledgeName: string,
    orderIndex: Record<number, { skill: string; knowledge: string }>
  ): number | null => {
    if (!reportData.value?.scores) return null

    // 从 orderIndex 中找到对应的 order
    const targetOrder = Object.keys(orderIndex).find((order) => {
      const info = orderIndex[Number(order)]
      return info?.skill === skillName && info?.knowledge === knowledgeName
    })

    if (!targetOrder) return null

    return getScoreByOrder(Number(targetOrder))
  }

  // 清空数据
  const clearReportData = () => {
    reportData.value = null
    isLoaded.value = false
  }

  return {
    reportData,
    isLoaded,
    setReportData,
    getScoreByOrder,
    getScoreByKnowledge,
    clearReportData,
  }
})