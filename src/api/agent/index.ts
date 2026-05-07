import request, { type ApiResponse } from '@/utils/request'
import { usePlayerStore } from '@/stores/user'
import type {
  SendMessageRequest,
  CareerRecommendResponse,
  RAGSearchRequest,
  RAGSearchResponse,
  SubmitUserMessageRequest,
  SubmitUserMessageResponse,
  GetUserJobDataResponse,
  SaveJobRequest,
} from './types'

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

export function saveJobAndSearchRAG(
  jobNames: string[],
  jobToken?: string,
  userId?: number,
  newData?: boolean,
): Promise<ApiResponse<RAGSearchResponse>> {
  return request<RAGSearchResponse>({
    url: '/agent/searchSkills',
    method: 'post',
    data: { jobs: jobNames, jobToken, userId, newData } as RAGSearchRequest,
  })
}

export function saveSelectedJobs(
  jobNames: string[],
  jobToken?: string,
): Promise<ApiResponse<string>> {
  const playerStore = usePlayerStore()
  const userId = playerStore.playerInfo?.id
  return request<string>({
    url: '/agent/savejob',
    method: 'post',
    data: { jobs: jobNames, userId, jobToken } as SaveJobRequest,
  })
}

// 提交用户发送的消息
export function submitUserMessage(
  data: SubmitUserMessageRequest,
): Promise<ApiResponse<SubmitUserMessageResponse>> {
  return request<SubmitUserMessageResponse>({
    url: '/agent/submitMessage',
    method: 'post',
    data,
  })
}

// 根据用户ID获取岗位和技能数据
export function getUserJobData(userId: number): Promise<ApiResponse<GetUserJobDataResponse>> {
  return request<GetUserJobDataResponse>({
    url: `/agent/userJobData/${userId}`,
    method: 'get',
  })
}
