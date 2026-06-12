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
  GenerateLearningPathRequest,
  GenerateLearningPathResponse,
  ReportSkillPointViewRequest,
  ReportPageDataRequest,
  ReportPageDataResponse,
  UserLearningProgress,
  GenerateQuestionsRequest,
  GenerateQuestionsResponse,
  GeneratedQuestion,
  GetUserKnowledgeDataResponse,
  DeleteSkillRequest,
  SubmitQuestionAnswerRequest,
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
  userId: number,
): Promise<ApiResponse<FetchSkillKnowledgePointsResponse>> {
  return request<FetchSkillKnowledgePointsResponse>({
    url: '/agent/fetchSkillKnowledgePoints',
    method: 'post',
    data: { job_names: jobName, selected_skill: selectedSkill, user_id: userId },
  })
}

// 生成学习路线（耗时操作，设置5分钟超时）
export function generateLearningPath(
  data: GenerateLearningPathRequest,
): Promise<ApiResponse<GenerateLearningPathResponse>> {
  return request<GenerateLearningPathResponse>({
    url: '/agent/generateLearningPath',
    method: 'post',
    data,
    timeout: 300000, // 5分钟超时
  })
}

// 上报知识点评分
export function reportKnowledgePoint(data: {
  userid: number
  skill_name: string
  knowledge_name: string
}): Promise<ApiResponse<void>> {
  return request<void>({
    url: '/agent/reportKnowledgePoint',
    method: 'post',
    data,
  })
}

// 上报技能点展示（个人主页顺序从1开始）
export function reportSkillPointView(
  data: ReportSkillPointViewRequest,
): Promise<ApiResponse<void>> {
  return request<void>({
    url: '/agent/reportSkillPointView',
    method: 'post',
    data,
  })
}

// 根据用户ID获取已选技能（GET，query参数）
export function getUserSelectedSkills(userId: number): Promise<ApiResponse<UserLearningProgress[]>> {
  return request<UserLearningProgress[]>({
    url: `/user/userSelectedSkills/${userId}`,
    method: 'get',
  })
}

// 根据用户ID获取知识点数据（GET）
export function getUserKnowledgeData(userId: number): Promise<ApiResponse<GetUserKnowledgeDataResponse>> {
  return request<GetUserKnowledgeDataResponse>({
    url: `/user/userKnowledgeData/${userId}`,
    method: 'get',
  })
}

// 根据用户ID获取题目数据（GET）
export function getUserQuestions(userId: number): Promise<ApiResponse<unknown>> {
  return request<unknown>({
    url: `/user/userQuestions/${userId}`,
    method: 'get',
  })
}

// 页面数据汇总上报（5秒自动触发一次）
export function reportPageData(
  data: ReportPageDataRequest,
): Promise<ApiResponse<ReportPageDataResponse>> {
  return request<ReportPageDataResponse>({
    url: '/user/reportPageData',
    method: 'post',
    data,
  })
}

// 生成专属题目（耗时操作，设置5分钟超时）
export function generateQuestions(
  data: GenerateQuestionsRequest,
): Promise<ApiResponse<string>> {
  return request<string>({
    url: '/agent/generateQuestions',
    method: 'post',
    data,
    timeout: 300000, // 5分钟超时
  })
}

// 重新导出类型
export type {
  GenerateQuestionsRequest,
  GenerateQuestionsResponse,
  GeneratedQuestion,
}

// 删除用户技能
export function deleteUserSkill(
  data: DeleteSkillRequest,
): Promise<ApiResponse<void>> {
  return request<void>({
    url: '/user/deleteSkill',
    method: 'post',
    data,
  })
}

// 提交题目答案（更新知识点评分和答题状态）
export function submitQuestionAnswer(
  data: SubmitQuestionAnswerRequest,
): Promise<ApiResponse<void>> {
  return request<void>({
    url: '/user/submitQuestionAnswer',
    method: 'post',
    data,
  })
}
