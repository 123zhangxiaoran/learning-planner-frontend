// 职业选项（后端返回的原始数据）
export interface JobInfo {
  job_name: string
  job_description: string
  major: string
  similarity: number
}

// 职业选项（前端展示用）
export interface CareerOption {
  id: number
  title: string
  description: string
  major: string
  similarity: number
}

// 发送消息请求
export interface SendMessageRequest {
  major: string
}

// 职业推荐响应（后端返回的是JSON字符串）
export interface CareerRecommendResponse {
  jobs: string
}
