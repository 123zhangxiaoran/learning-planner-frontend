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

// RAG 搜索请求
export interface RAGSearchRequest {
  jobs: string[]
}

// 技能详情
export interface SkillDetail {
  name: string
  description: string
}

// RAG 搜索返回的技能项
export interface SkillItem {
  job_name: string
  skills: SkillDetail[]
  major: string
  score: number
}

// RAG 搜索响应（后端返回的是JSON字符串）
export interface RAGSearchResponse {
  skills: SkillItem[]
}
