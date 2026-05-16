<template>
  <div class="me-container">
    <!-- 噪点纹理背景 -->
    <div class="noise-bg"></div>
    <!-- 手绘网格背景 -->
    <svg class="hand-drawn-grid" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path
            d="M 60 0 L 0 0 0 60"
            fill="none"
            stroke="#1a3a3a"
            stroke-width="0.5"
            stroke-dasharray="2,3"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>

    <!-- 顶部导航栏 - 复用组件 -->
    <NavBar />

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 用户信息卡片 -->
      <section class="profile-section">
        <div class="profile-card">
          <!-- 几何图案头像 - 使用组件 -->
          <GeoAvatar :user-id="playerStore.playerInfo?.id || 0" :size="80" />

          <div class="profile-info">
            <h2 class="username">{{ playerStore.playerInfo?.nickname }}</h2>
            <p class="user-id">学路ID: {{ String(playerStore.playerInfo?.id).padStart(8, '0') }}</p>
          </div>

          <button class="btn-logout" @click="handleLogout">放松一下</button>
        </div>
      </section>

      <!-- 知识岗位栏 -->
      <section class="career-section">
        <div class="section-header">
          <h3 class="section-title">我的职业岗位</h3>
          <span class="course-count">已选 {{ careerStore.selectedJobNames.length }} 个岗位</span>
        </div>
        <div class="career-list">
          <details
            class="career-item"
            v-for="(job, index) in careerStore.selectedJobNames"
            :key="index"
          >
            <summary class="career-header">
              <div class="career-title-row">
                <h4 class="career-name">{{ job }}</h4>
                <span class="expand-arrow">▶</span>
              </div>
              <div class="career-progress">
                <span class="progress-label">已学 {{ getJobSkills(job).length }} 个技能</span>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: Math.min(getJobSkills(job).length * 25, 100) + '%' }"
                  ></div>
                </div>
              </div>
            </summary>
            <div class="career-content">
              <div v-if="getJobSkills(job).length > 0" class="knowledge-list">
                <div v-for="(skill, idx) in getJobSkills(job)" :key="idx" class="skill-row">
                  <details class="knowledge-item">
                    <summary class="knowledge-summary">
                      <span class="knowledge-name">{{ skill.skill_name }}</span>
                      <span class="knowledge-status">综合测评 {{ skill.score }}</span>
                      <span class="expand-arrow">▶</span>
                    </summary>
                    <div
                      class="knowledge-detail"
                      v-if="skill.dimensions && skill.dimensions.length > 0"
                    >
                      <div class="dimension-title">知识点：</div>
                      <div class="dimension-list">
                        <div
                          v-for="(dim, dIdx) in skill.dimensions"
                          :key="dIdx"
                          class="dimension-item"
                        >
                          <span class="dimension-name">{{ dim }}</span>
                          <span class="dimension-score">评分 {{ skill.score }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="knowledge-detail" v-else>
                      <div class="dimension-title">暂无知识点数据</div>
                    </div>
                  </details>
                  <span class="btn-delete-skill">删除</span>
                </div>
              </div>
              <div v-else class="knowledge-list">
                <div class="knowledge-item pending">
                  <span class="knowledge-name">还未规划学习技能</span>
                </div>
              </div>
            </div>
          </details>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/layout/NavBar.vue'
import GeoAvatar from '@/components/layout/GeoAvatar.vue'
import { usePlayerStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { logout } from '@/api/user'
import { useCareerStore } from '@/stores/career'
import { useSkillResultsStore } from '@/stores/skillResults'
import type { SkillResult } from '@/stores/skillResults'

const playerStore = usePlayerStore()
const careerStore = useCareerStore()
const skillResultsStore = useSkillResultsStore()
const router = useRouter()

// 退出登录
function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const token = playerStore.getAccessToken
      if (token) await logout()
      // 清除 pinia 中的用户信息和token
      playerStore.setPlayerInfo(null)
      playerStore.setAccessToken('')
      // 清除 cookie 中的 refreshToken
      document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      // 清除职业存储
      careerStore.clearJobNames()
      // 清除技能学习结果
      skillResultsStore.clearAll()
      // 使用 replace 跳转到登录页，防止回退到已登录页面
      router.replace({ name: 'user-login' })
    })
    .catch(() => {
      // 用户取消
    })
}

// 获取某个岗位已学习的技能列表
function getJobSkills(jobName: string): SkillResult[] {
  return skillResultsStore.getSkillResultsByJob(jobName)
}
</script>

<style scoped>
/* ========= 颜色变量 ========= */
:root {
  --bg-dark: #0d1b1e;
  --bg-card: #162a2e;
  --accent-orange: #ff6b35;
  --accent-yellow: #f7c548;
  --accent-teal: #2ec4b6;
  --text-primary: #e8f1f2;
  --text-secondary: #95a5a6;
  --border-color: #1a3a3a;
}

/* ========= 容器 ========= */
.me-container {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  background-color: var(--bg-dark);
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  color: var(--text-primary);
  padding-bottom: 4rem;
  user-select: none;
}

/* ========= 噪点背景 ========= */
.noise-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.03;
  z-index: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}

/* ========= 手绘网格背景 ========= */
.hand-drawn-grid {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  opacity: 0.4;
}

/* ========= 主内容区 ========= */
.main-content {
  position: relative;
  z-index: 10;
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 5% 3rem 8%;
}

/* ========= 用户信息卡片 ========= */
.profile-section {
  margin-bottom: 3rem;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.profile-info {
  flex: 1;
  min-width: 200px;
}

.username {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.3rem;
}

.user-id {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.8rem;
}

/* ========= 退出按钮 ========= */
.btn-logout {
  padding: 0.6rem 1.4rem;
  font-size: 1rem;
  font-weight: 600;
  background: transparent;
  border: 1px solid var(--text-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  margin-left: auto;
}

.btn-logout:hover {
  border-color: var(--accent-orange);
  color: var(--accent-orange);
  transform: scale(1.02);
  box-shadow: 0 10px 30px rgba(255, 107, 53, 0.4);
  background: var(--bg-dark);
}

/* ========= 区块通用样式 ========= */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 60%;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-orange), transparent);
  border-radius: 2px;
}

.section-title::before {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 5px;
  width: 40%;
  height: 2px;
  background: var(--accent-yellow);
  border-radius: 2px;
}

/* ========= 职业岗位栏 ========= */
.career-section {
  margin-bottom: 3rem;
}

.career-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.career-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.career-item[open] > .career-header .expand-arrow {
  transform: rotate(90deg);
}

.career-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  cursor: pointer;
  list-style: none;
  transition: background 0.3s;
}

.career-header:hover {
  background: rgba(255, 107, 53, 0.05);
}

.career-header::-webkit-details-marker {
  display: none;
}

.career-title-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.career-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.expand-arrow {
  font-size: 0.8rem;
  color: var(--text-secondary);
  transition: transform 0.3s;
}

.career-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.progress-bar {
  width: 150px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent-orange);
  border-radius: 10px;
  transition: width 0.5s ease;
}

.career-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding-top: 1rem;
}

/* ========= 技能行（含删除按钮） ========= */
.skill-row {
  display: flex;
  align-items: flex-start;
  gap: 0;
}

.btn-delete-skill {
  flex-shrink: 0;
  width: 64px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  background: #ef4444;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  border-radius: 0 8px 8px 0;
  position: relative;
  overflow: hidden;
}

.btn-delete-skill:hover {
  background: #dc2626;
  width: 68px;
}

.btn-delete-skill:hover {
  background: #b91c1c;
}

.knowledge-item {
  flex: 1;
  border: 1px solid var(--border-color);
  transition: all 0.3s;
  overflow: hidden;
}

.knowledge-item[open] {
  border-color: var(--accent-teal);
}

.knowledge-item[open] .expand-arrow {
  transform: rotate(90deg);
}

.knowledge-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1rem;
  cursor: pointer;
  list-style: none;
  font-weight: 500;
  background: rgba(46, 196, 182, 0.06);
}

.knowledge-summary::-webkit-details-marker {
  display: none;
}

.knowledge-detail {
  padding: 0 1rem 0.8rem 1rem;
  border-top: 1px solid var(--border-color);
  margin-top: 0;
}

.dimension-title {
  font-size: 0.8rem;
  color: var(--accent-teal);
  font-weight: 600;
  padding: 0.6rem 0 0.4rem 0;
}

.dimension-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.dimension-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  padding: 0.5rem 0.6rem;
  background: rgba(255, 255, 255, 0.03);
  border-left: 2px solid var(--accent-teal);
  line-height: 1.4;
  transition: all 0.2s;
  cursor: default;
  user-select: text;
}

.dimension-item:hover {
  border-left-color: var(--accent-orange);
  background: rgba(255, 107, 53, 0.05);
}

.dimension-item:hover .dimension-score {
  background: rgba(255, 107, 53, 0.2);
  color: var(--accent-orange);
  border-color: rgba(255, 107, 53, 0.3);
}

.dimension-name {
  flex: 1;
  color: var(--text-primary);
  user-select: text;
}

.dimension-score {
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  background: rgba(46, 196, 182, 0.2);
  color: var(--accent-teal);
  border: 1px solid rgba(46, 196, 182, 0.3);
  border-radius: 3px;
  user-select: none;
}

.knowledge-status {
  padding: 0.2rem 0.6rem;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 3px;
  min-width: 60px;
  text-align: center;
  background: rgba(46, 196, 182, 0.2);
  color: var(--accent-teal);
  border: 1px solid rgba(46, 196, 182, 0.3);
}

.knowledge-item.pending .knowledge-status {
  background: rgba(149, 165, 166, 0.2);
  color: var(--text-secondary);
  border: 1px solid rgba(149, 165, 166, 0.3);
}

.knowledge-name {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.02em;
}

.knowledge-link {
  font-size: 0.8rem;
  color: var(--accent-orange);
  text-decoration: none;
  padding: 0.3rem 0.8rem;
  border: 1px dashed var(--accent-orange);
  transition: all 0.3s;
}

.knowledge-link:hover {
  background: var(--accent-orange);
  color: var(--bg-dark);
}

/* ========= 响应式适配 ========= */
@media (max-width: 1024px) {
  .main-content {
    padding: 2rem 3%;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1.5rem 1rem;
  }

  .profile-section {
    margin-bottom: 2rem;
  }

  .profile-card {
    padding: 1.5rem;
    gap: 1.2rem;
  }

  .username {
    font-size: 1.5rem;
  }

  .user-id {
    font-size: 0.8rem;
  }

  .btn-logout {
    font-size: 0.9rem;
    padding: 0.5rem 1.2rem;
  }

  .section-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .section-title {
    font-size: 1.3rem;
  }

  .course-count {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .career-header {
    flex-direction: column;
    gap: 0.8rem;
    align-items: flex-start;
    padding: 1rem;
  }

  .career-title-row {
    width: 100%;
    justify-content: space-between;
  }

  .career-name {
    font-size: 1.1rem;
  }

  .career-progress {
    width: 100%;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .progress-label {
    font-size: 0.8rem;
  }

  .progress-bar {
    flex: 1;
    min-width: 100px;
    height: 8px;
  }

  .career-content {
    padding: 0 1rem 1rem 1rem;
  }

  .knowledge-item {
    gap: 0.6rem;
  }

  .knowledge-summary {
    flex-wrap: wrap;
    gap: 0.4rem;
    padding: 0.6rem 0.8rem;
  }

  .knowledge-status {
    font-size: 0.65rem;
    padding: 0.15rem 0.5rem;
    min-width: 50px;
  }

  .knowledge-name {
    font-size: 0.85rem;
    order: 1;
    width: 100%;
  }

  .knowledge-link {
    font-size: 0.75rem;
    padding: 0.25rem 0.6rem;
    order: 2;
  }

  .hand-drawn-grid {
    display: none;
  }

  .noise-bg {
    opacity: 0.02;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 1rem 0.8rem;
  }

  .profile-card {
    padding: 1.2rem;
  }

  .username {
    font-size: 1.3rem;
  }

  .user-id {
    font-size: 0.75rem;
  }

  .btn-logout {
    font-size: 0.85rem;
    padding: 0.45rem 1rem;
    width: 100%;
  }

  .section-title {
    font-size: 1.2rem;
  }

  .career-item {
    margin-bottom: 0.8rem;
  }

  .career-header {
    padding: 0.8rem;
  }

  .career-name {
    font-size: 1rem;
  }

  .progress-label {
    font-size: 0.75rem;
  }

  .progress-bar {
    height: 6px;
  }

  .knowledge-list {
    gap: 0.6rem;
  }

  .knowledge-item {
    gap: 0.6rem;
  }

  .knowledge-summary {
    flex-wrap: wrap;
    gap: 0.4rem;
    padding: 0.6rem 0.8rem;
  }

  .knowledge-detail {
    padding: 0 0.8rem 0.6rem 0.8rem;
  }

  .dimension-item {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }

  .knowledge-status {
    font-size: 0.6rem;
    min-width: 45px;
  }

  .knowledge-name {
    font-size: 0.8rem;
  }

  .knowledge-link {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
  }
}
</style>
