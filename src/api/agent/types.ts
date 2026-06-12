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
  skill_name: string
  job_name: string
  userinput: string
  dimensions?: string[][]
  user_id: number
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

// 获取技能知识点请求
export interface FetchSkillKnowledgePointsRequest {
  job_names: string[] // 技能所属的岗位名称
  selected_skill: string // 用户选择的技能
  user_id: number // 用户ID
}

// 获取技能知识点响应
export interface FetchSkillKnowledgePointsResponse {
  success: boolean
  skill_name: string
  dimensions: string[][] // 二维数组，每个子数组第一项为维度名，其余为知识点
  job_name: string // 技能所属的岗位名称
}

// 批量上报知识点评分请求
export interface ReportKnowledgePointsRequest {
  userid: number
  tags: string[] // 顺序标签 ["0", "1", "2", ...]
}

// 批量上报知识点评分响应项
export interface ReportKnowledgePointScore {
  tag: string
  score: number
}

// 生成学习路线请求
export interface GenerateLearningPathRequest {
  skill_name: string
  job_name: string
  dimensions: string[][]
  user_id: number
  userinput?: string
}

// 生成学习路线响应
export interface GenerateLearningPathResponse {
  data: string // base64编码的PPT文件数据
}

// 技能点展示上报请求（个人主页展示技能点顺序从1开始）
export interface ReportSkillPointViewRequest {
  userid: number
  skill_name: string
  items: {
    order: number
    knowledge_name: string
  }[]
}

// 页面数据汇总上报请求（5秒自动触发，聚合所有技能与知识点）
export interface ReportPageDataRequest {
  userid: number
  skills: {
    skill_name: string
    items: {
      order: number
      knowledge_name: string
    }[]
  }[]
}

// 页面数据汇总上报响应（后端返回各知识点评分，按order定位）
export interface ReportPageDataResponse {
  scores: {
    order: number
    score: number
  }[]
}

// 用户学习进度（从数据库直查）
export interface UserLearningProgress {
  userId: number
  skillName: string
  knowledgeName: string
  score: number
  jobName: string
}

// 知识点数据项
export interface KnowledgePointData {
  skillName: string
  knowledgeName: string
  content: string
  jobName: string
}

// 获取用户知识点数据响应
export interface GetUserKnowledgeDataResponse {
  knowledgePoints: KnowledgePointData[]
}

// 生成的题目项（扁平格式）
export interface GeneratedQuestion {
  type: string // 题目类型，如 "choice" / "judgment"
  stem: string // 题干
  options: string[] // 选项列表
  answer: string // 正确答案
  explanation: string // 答案解析
  code_snippet: string // 代码片段
}

// 生成专属题目响应（后端返回的是JSON字符串）
export interface GenerateQuestionsResponse {
  success: boolean
  data: GeneratedQuestion[]
  message?: string
}

// 后端实际返回的是这个接口的JSON字符串形式
export interface GenerateQuestionsApiResponse {
  code: number
  message: string
  data: string // JSON.stringify(GenerateQuestionsResponse)
}

// 生成专属题目请求
export interface GenerateQuestionsRequest {
  skill_name: string
  job_name: string
  dimensions: string[][]
  user_id: number
}

// 删除技能请求
export interface DeleteSkillRequest {
  user_id: number
  skill_name: string
  job_name: string
}

// 提交题目答案请求
export interface SubmitQuestionAnswerRequest {
  user_id: number
  question_id: string
  is_correct: number
  question_type: string
  job_name: string
  skill_name: string
  knowledge_name: string
}
