import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 1. 定义类型，注意后端返回的是 id 数字
export interface PlayerInfo {
  id: number
  nickname: string
}

export const usePlayerStore = defineStore('player', () => {
  const playerInfo = ref<PlayerInfo | null>(null)

  // 从localStorage初始化accessToken
  const accessToken = ref<string>(localStorage.getItem('accessToken') || '')

  const setPlayerInfo = (data: PlayerInfo | null) => {
    playerInfo.value = data
  }

  const setAccessToken = (token: string) => {
    accessToken.value = token
    // 同步存储到localStorage
    if (token) {
      localStorage.setItem('accessToken', token)
    } else {
      localStorage.removeItem('accessToken')
    }
  }

  const getAccessToken = computed(() => accessToken.value)

  return {
    playerInfo,
    accessToken,
    setPlayerInfo,
    setAccessToken,
    getAccessToken,
  }
}, {
  persist: {
    key: 'player-store',
    storage: localStorage,
    pick: ['playerInfo'], // 只持久化playerInfo，不持久化accessToken
  }
});
