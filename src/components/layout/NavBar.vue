<template>
  <nav class="top-nav">
    <div class="logo-section">
      <span class="logo-text">学路规划</span>
      <span class="logo-tagline">/ 别走弯路</span>
    </div>
    <div class="nav-links">
      <router-link to="/" class="nav-link" :class="{ active: isActive('/') }">首页</router-link>
      <router-link to="/user/career" class="nav-link" :class="{ active: isActive('/user/career') }">职业探索</router-link>
      <router-link to="/user/skill" class="nav-link" :class="{ active: isActive('/user/skill') }">技能分析</router-link>
      <router-link to="/user/me" class="nav-link" :class="{ active: isActive('/user/me') }">个人中心</router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

function isActive(path: string): boolean {
  return route.path === path
}
</script>

<style scoped>
.top-nav {
  position: relative;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 3rem;
  border-bottom: 1px solid var(--border-color);
}

.logo-section {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.logo-tagline {
  font-size: 0.9rem;
  color: var(--accent-orange);
  font-weight: 500;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  position: relative;
  padding: 0.5rem 0.75rem;
  border: 1px solid transparent;
}

.nav-link:hover {
  color: var(--text-primary);
  border-color: var(--border-color);
  background: rgba(255, 255, 255, 0.03);
}

.nav-link.active {
  color: var(--text-primary);
}

.nav-link.active:hover {
  border-color: transparent;
}

@media (max-width: 768px) {
  .top-nav {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 1rem;
  }

  .logo-section {
    flex-shrink: 0;
  }

  .logo-text {
    font-size: 1.1rem;
  }

  .logo-tagline {
    font-size: 0.75rem;
  }

  .nav-links {
    gap: 0.3rem;
    flex-wrap: nowrap;
  }

  .nav-link {
    font-size: 0.75rem;
    padding: 0.3rem 0.4rem;
    white-space: nowrap;
  }
}
</style>
