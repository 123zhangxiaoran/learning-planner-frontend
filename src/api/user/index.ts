import request, { type ApiResponse } from '@/utils/request'
import type { PlayerInfo } from '@/api/user/types.ts'

// 发送验证码
export function sendCode(phone: string): Promise<ApiResponse<string>> {
  return request<string>({
    url: '/user/code',
    method: 'post',
    data: { phone },
  })
}

// 手机验证码登录：发送手机号和验证码
export function phoneLogin(phone: string, code: number): Promise<ApiResponse<PlayerInfo>> {
  return request<PlayerInfo>({
    url: '/user/phoneLogin',
    method: 'post',
    data: { phone, code },
  })
}

// 手机号密码登录：发送手机号和密码
export function accountLogin(phone: string, password: string): Promise<ApiResponse<PlayerInfo>> {
  return request<PlayerInfo>({
    url: '/user/accountLogin',
    method: 'post',
    data: { phone, password },
  })
}

// 注册
export function sendUser(
  phone: string,
  password: string,
  confirmPwd: string,
  code: number,
): Promise<ApiResponse<PlayerInfo>> {
  return request<PlayerInfo>({
    url: '/user/sendRegisterCode',
    method: 'post',
    data: { phone, password, confirmPwd, code },
  })
}

// 退出登录
export function logout(): Promise<ApiResponse<void>> {
  return request<void>({
    url: '/user/logout',
    method: 'post'
  })
}
