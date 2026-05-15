import request, { type ApiResponse } from '@/utils/request'
import { usePlayerStore } from '@/stores/user'
import type {
  SendMessageRequest,
  CareerRecommendResponse,
  RAGSearchRequest,
  RAGSearchResponse,
  AnswerUserQuestionRequest,
  AnswerUserQuestionResponse,
  GetUserJobDataResponse,
  SaveJobRequest,
  FetchSkillKnowledgePointsResponse,
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

// 回答用户问题
export function answerUserQuestion(
  data: AnswerUserQuestionRequest,
  signal?: AbortSignal,
): Promise<ApiResponse<AnswerUserQuestionResponse>> {
  return request<AnswerUserQuestionResponse>({
    url: '/agent/submitMessage',
    method: 'post',
    data,
    signal,
  })
}

// 根据用户ID获取岗位和技能数据
export function getUserJobData(userId: number): Promise<ApiResponse<GetUserJobDataResponse>> {
  return request<GetUserJobDataResponse>({
    url: `/agent/userJobData/${userId}`,
    method: 'get',
  })
}

// 获取技能对应的知识点
export function fetchSkillKnowledgePoints(
  selectedSkill: string,
  jobName: string,
): Promise<ApiResponse<FetchSkillKnowledgePointsResponse>> {
  return request<FetchSkillKnowledgePointsResponse>({
    url: '/agent/fetchSkillKnowledgePoints',
    method: 'post',
    data: { job_names: jobName, selected_skill: selectedSkill },
  })
}
