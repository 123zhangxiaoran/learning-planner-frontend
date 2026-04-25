import request, { type ApiResponse } from '@/utils/request'
import { usePlayerStore } from '@/stores/user'
import type {
  SendMessageRequest,
  CareerRecommendResponse,
  RAGSearchRequest,
  RAGSearchResponse,
} from './types'

// ?????????????
export function sendChatMessage(
  data: SendMessageRequest,
  signal?: AbortSignal,
): Promise<ApiResponse<CareerRecommendResponse>> {
  return request<CareerRecommendResponse>({
    url: '/agent/searchJobs',
    method: 'post',
    data,
    signal,
  })
}

// ??????? RAG ??
export function saveJobAndSearchRAG(jobNames: string[]): Promise<ApiResponse<RAGSearchResponse>> {
  return request<RAGSearchResponse>({
    url: '/agent/searchSkills',
    method: 'post',
    data: { jobs: jobNames } as RAGSearchRequest,
  })
}

// ?????????????
export function saveSelectedJobs(jobNames: string[]): Promise<ApiResponse<void>> {
  const playerStore = usePlayerStore()
  const userId = playerStore.playerInfo?.id
  return request<void>({
    url: '/agent/savejob',
    method: 'post',
    data: { jobs: jobNames, userId },
  })
}
