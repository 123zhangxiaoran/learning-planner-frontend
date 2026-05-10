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

// 保存岗位请求
export interface SaveJobRequest {
  jobs: string[]
  userId?: number
  jobToken?: string // 前端生成的凭证
}

// 职业推荐响应（后端返回的是JSON字符串）
export interface CareerRecommendResponse {
  jobs: string
}

// RAG 搜索请求
export interface RAGSearchRequest {
  jobs: string[]
  userId?: number
  jobToken?: string // 保存岗位后返回的凭证
  newData?: boolean // 是否首次调用
}

// 技能详情
export interface SkillDetail {
  name: string
  description: string
  difficulty?: number
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

// 回答用户问题请求
export interface AnswerUserQuestionRequest {
  text: string
  job_names?: string[]
  selected_skill?: string
}

// 回答用户问题响应（后端返回的是JSON字符串）
export interface AnswerUserQuestionResponse {
  type: string // 题目类型，如 "true_false" / "choice" 等
  stem: string // 题目题干
  options: string[] // 选项列表
  answer: string // 正确答案
  explanation: string // 答案解析
  code_snippet: string // 代码片段（如果有）
}

// 获取用户岗位数据响应
export interface GetUserJobDataResponse {
  query: string[]
  skills: SkillItem[]
}
