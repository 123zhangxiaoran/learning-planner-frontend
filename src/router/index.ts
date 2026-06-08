import { createRouter, createWebHashHistory } from 'vue-router'
import { usePlayerStore } from '@/stores/user'

const routes = [
  // 首页 - 默认入口页面
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomePage.vue'),
  },
  // 登录页
  {
    path: '/login',
    name: 'user-login',
    component: () => import('@/views/LoginPage.vue'),
  },
  // 职业页面
  {
    path: '/user/career',
    name: 'user-career',
    component: () => import('@/views/CareerPage.vue'),
  },
  // 技能页面
  {
    path: '/user/skill',
    name: 'user-skill',
    component: () => import('@/views/SkillPage.vue'),
  },
  // 知识库存页面
  {
    path: '/user/knowledge',
    name: 'user-knowledge',
    component: () => import('@/views/KnowledgePage.vue'),
  },
  // 个人主页
  {
    path: '/user/me',
    name: 'user-me',
    component: () => import('@/views/MePage.vue'),
  },
  // 错题页面
  {
    path: '/user/wrong',
    name: 'user-wrong',
    component: () => import('@/views/WrongQuestionPage.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// 路由守卫：访问需要登录的页面时检查 token
router.beforeEach((to) => {
  const playerStore = usePlayerStore()
  const token = playerStore.accessToken

  // 如果已登录且要访问登录页，重定向到首页
  if (token && to.name === 'user-login') {
    return { name: 'home' }
  }

  // 未登录状态下访问首页，重定向到登录页
  if (!token && to.name === 'home') {
    return { name: 'user-login' }
  }

  // 如果要访问的页面不是登录页且没有 token，跳转登录页
  if (!token && to.name !== 'user-login') {
    return { name: 'user-login' }
  }

  // 其他情况允许导航
  return true
})

export default router
