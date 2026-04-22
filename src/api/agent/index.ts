import request, { type ApiResponse } from '@/utils/request'
import type {
  CareerOption,
  SendMessageRequest,
  CareerRecommendResponse,
} from './types'


// 发送聊天消息，获取职业推荐
export function sendChatMessage(
  data: SendMessageRequest,
): Promise<ApiResponse<CareerRecommendResponse>> {
  return request<CareerRecommendResponse>({
    url: '/agent/jobs',
    method: 'post',
    data,
  })
}

// 获取职业详情
export function getCareerDetail(careerId: number): Promise<ApiResponse<CareerOption>> {
  return request<CareerOption>({
    url: `/agent/career/${careerId}`,
    method: 'get',
  })
}

// 选择职业
export function selectCareer(careerId: number): Promise<ApiResponse<void>> {
  return request<void>({
    url: '/agent/career/select',
    method: 'post',
    data: { careerId },
  })
}

// 获取用户已选择的职业
export function getSelectedCareer(): Promise<ApiResponse<CareerOption>> {
  return request<CareerOption>({
    url: '/agent/career/selected',
    method: 'get',
  })
}
