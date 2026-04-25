import axios from 'axios'
import type { AxiosResponse } from 'axios'
import router from '@/router'
import { usePlayerStore } from '@/stores/user'

/**
 * 通用 API 响应结构接口
 * @template T 响应数据的类型
 */
export interface ApiResponse<T = unknown> {
  code: number // 业务状态码
  data: T // 响应数据
  message: string // 响应消息
}

// 创建 axios 实例，配置基础 URL 和超时时间
const hostname = window.location.hostname
const isLocal = hostname === 'localhost' ||
                hostname === '127.0.0.1' ||
                hostname.startsWith('192.168.') ||
                hostname.startsWith('10.')
const baseURL = isLocal ? '/api' : 'http://192.168.253.1:8820/api'

const request = axios.create({
  baseURL,
  timeout: 60000,
  withCredentials: true,
})

// 不需要token的接口列表
const noTokenUrls = [
  '/user/code',
  '/user/phoneLogin',
  '/user/accountLogin',
  '/user/sendRegisterCode',
  '/user/token',
]

/**
 * 解析JWT token的payload
 * @param token JWT token字符串
 * @returns 解析后的payload对象，解析失败返回null
 */
function parseJwtPayload(token: string): { exp: number } | null {
  try {
    const parts = token.split('.')
    const payloadPart = parts[1]
    if (!payloadPart) return null

    return JSON.parse(atob(payloadPart))
  } catch {
    return null
  }
}

/**
 * 检查短token是否已过期（绝对过期）
 * @returns true表示已过期，false表示未过期
 */
function isAccessTokenExpired(): boolean {
  const token = usePlayerStore().accessToken
  if (!token) return true

  const payload = parseJwtPayload(token)
  if (!payload) return true

  const expTime = payload.exp * 1000
  const now = Date.now()

  return expTime < now
}

/**
 * 检查短token是否即将过期（剩余时间 < 30分钟）
 * @returns true表示即将过期，false表示还有足够时间
 */
function isAccessTokenExpiringSoon(): boolean {
  const token = usePlayerStore().accessToken
  if (!token) return true

  const payload = parseJwtPayload(token)
  if (!payload) return true

  const expTime = payload.exp * 1000
  const now = Date.now()
  const thirtyMinutes = 30 * 60 * 1000

  return expTime - now < thirtyMinutes
}

// 刷新短token的锁和promise
let isRefreshing = false
let refreshPromise: Promise<boolean | undefined> | null = null

/**
 * 刷新短token
 * @param isLogout 是否是退出操作，退出时不存储新token
 * @returns Promise<boolean> 刷新成功返回true，失败返回false
 *
 * 流程说明：
 * 1. 如果正在刷新，返回已有的promise（防止并发刷新）
 * 2. 使用当前短token + 长token（cookie）向后端请求新短token
 * 3. 成功后存储新token到 pinia + localStorage（如果不是退出操作）
 * 4. 如果长token也过期（401），清除token并跳转登录页
 */
async function refreshAccessToken(isLogout: boolean = false): Promise<boolean> {
  // 如果正在刷新，返回已有的promise，避免并发请求
  if (isRefreshing && refreshPromise) {
    return refreshPromise as Promise<boolean>
  }

  isRefreshing = true

  refreshPromise = (async () => {
    const playerStore = usePlayerStore()
    const currentToken = playerStore.accessToken
    const userId = playerStore.playerInfo?.id

    // 如果没有token或用户ID，无法刷新
    if (!currentToken || !userId) {
      return false
    }

    try {
      const { refreshToken } = await import('@/api/token/index.ts')
      const res = await refreshToken(userId, currentToken, isLogout)

      // 退出操作：只要 code === 200 就视为成功（后端可能返回 data: null）
      if (res.code === 200) {
        if (isLogout) {
          return true
        }
        // 正常刷新：需要返回新token
        if (res.data) {
          const newToken = typeof res.data === 'string' ? res.data : res.data.accessToken
          if (newToken) {
            playerStore.setAccessToken(newToken)
          }
        }
        return true
      }

      // 刷新失败：业务逻辑错误
      return false
    } catch (error) {
      // 如果是401，说明长token也过期了，需要重新登录
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        playerStore.setAccessToken('')
        playerStore.setPlayerInfo(null)
        // 清除职业存储
        const { useCareerStore } = await import('@/stores/career')
        useCareerStore().clearJobNames()
        router.replace({ name: 'user-login' })
      }
      return false
    } finally {
      // 无论成功或失败，都要重置刷新状态
      isRefreshing = false
    }
  })()

  return refreshPromise as Promise<boolean>
}

/**
 * 请求拦截器
 * 功能：
 * 1. 跳过不需要token的接口
 * 2. 处理token过期和即将过期的逻辑
 * 3. 自动添加Authorization请求头
 */
request.interceptors.request.use(
  async (config) => {
    // 不需要token的接口直接跳过
    const isNoTokenApi = noTokenUrls.some((url) => config.url?.includes(url))
    if (isNoTokenApi) {
      return config
    }

    const playerStore = usePlayerStore()

    // 场景1：短token已过期，阻塞等待刷新
    if (isAccessTokenExpired()) {
      const isLogout = config.url?.includes('/user/logout')
      const success = await refreshAccessToken(isLogout)
      if (!success) {
        return Promise.reject(new Error('Token已过期，请重新登录'))
      }
      // 刷新成功，使用新token
      const newToken = playerStore.accessToken
      if (newToken) {
        config.headers['Authorization'] = `Bearer ${newToken}`
      }
      return config
    }

    // 场景2：短token未过期但还剩 < 30分钟，后台异步刷新（不阻塞当前请求）
    if (isAccessTokenExpiringSoon()) {
      refreshAccessToken()
    }

    // 场景3：短token还剩 > 30分钟，直接使用当前token
    const token = playerStore.accessToken
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

/**
 * 响应拦截器
 * 功能：
 * 1. 从响应体中提取并存储token
 * 2. 处理401未授权错误，清除token并跳转登录页
 */
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data as ApiResponse

    // 从响应体的data中获取token（登录、注册等接口会返回新token）
    if (data.data && typeof data.data === 'object' && 'accessToken' in data.data) {
      const token = (data.data as { accessToken?: string }).accessToken
      if (token) {
        // 存储到 pinia（内存） + localStorage（持久化）
        usePlayerStore().setAccessToken(token)
      }
    }

    return response.data
  },
  (error) => {
    // 处理401未授权错误
    if (error.response?.status === 404) {
      // 清除token并跳转登录页
      usePlayerStore().setAccessToken('')
      router.replace({ name: 'user-login' })
    }
    return Promise.reject(error)
  },
)

/**
 * 封装请求方法
 * @param config axios请求配置
 * @returns Promise<ApiResponse<T>> 返回API响应数据
 */
export default <T>(config: {
  method: string
  url: string
  data?: unknown
  params?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}): Promise<ApiResponse<T>> => {
  return request(config)
}
