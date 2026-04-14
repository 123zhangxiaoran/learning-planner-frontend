import request, { type ApiResponse } from '@/utils/request'
import type { TokenInfo } from './types'

export function refreshToken(id: number, currentToken: string, isLogout: boolean = false): Promise<ApiResponse<TokenInfo>> {
  return request<TokenInfo>({
    url: '/user/token',
    data: { id, isLogout },
    method: 'post',
    headers: {
      Authorization: `Bearer ${currentToken}`,
    },
  })
}
