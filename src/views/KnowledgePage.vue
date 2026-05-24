<template>
  <div class="knowledge-container">
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

    <!-- 顶部导航栏 -->
    <NavBar />

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 搜索栏 + 错题本入口 -->
      <div class="search-bar-wrapper">
        <section class="search-section">
          <div class="search-wrapper">
            <svg
              class="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              class="search-input"
              placeholder="搜索岗位或技能..."
              v-model="searchKeyword"
            />
          </div>
        </section>

        <!-- 错题本入口 -->
        <section class="wrong-book-section">
          <div class="wrong-book-card">
            <div class="wrong-book-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <path d="M12 6h6" />
                <path d="M12 10h6" />
                <path d="M12 14h6" />
              </svg>
            </div>
            <div class="wrong-book-info">
              <h4 class="wrong-book-title">专属题库</h4>
              <p class="wrong-book-desc">共 <span class="total-wrong">23</span> 道题待练习</p>
            </div>
            <button class="btn-wrong-book" @click="goToQuestion">查看全部</button>
          </div>
        </section>
      </div>

      <!-- 岗位技能列表 -->
      <section class="career-section">
        <div class="section-header">
          <h3 class="section-title">我的知识仓库</h3>
          <span class="career-count">{{ filteredCareers.length }} 个岗位</span>
        </div>

        <div class="career-list">
          <details class="career-item" v-for="(career, cIndex) in filteredCareers" :key="cIndex">
            <summary class="career-header">
              <div class="career-title-row">
                <h4 class="career-name">{{ career.name }}</h4>
                <span class="skill-count">{{ career.skills.length }} 个技能</span>
                <span class="expand-arrow">▶</span>
              </div>
            </summary>

            <div class="career-content">
              <!-- 无技能空状态 -->
              <div class="empty-state card-style" v-if="career.skills.length === 0">
                <span class="empty-text">还未规划学习技能</span>
              </div>
              <div class="skill-grid" v-else>
                <div class="skill-card" v-for="(skill, sIndex) in career.skills" :key="sIndex">
                  <div class="skill-header">
                    <span class="skill-name">{{ skill.name }}</span>
                  </div>

                  <div class="skill-actions">
                    <button class="btn-action btn-generate" @click="handleGenerate(cIndex, sIndex)">
                      AI智能出题
                    </button>
                    <button class="btn-action btn-question-bank">
                      专属题库
                      <span class="wrong-count" v-if="skill.wrongCount > 0">{{
                        skill.wrongCount
                      }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </details>

          <!-- 空状态 -->
          <div class="empty-state" v-if="filteredCareers.length === 0 && careersData.length === 0">
            <span class="empty-text">还未规划学习技能</span>
          </div>
          <div class="empty-state" v-else-if="filteredCareers.length === 0">
            <span class="empty-text">未找到匹配的知识仓库</span>
          </div>
        </div>
      </section>
    </main>

    <!-- AI出题弹窗 -->
    <div class="ai-dialog-overlay" v-if="showDialog">
      <div class="ai-dialog-panel">
        <div class="ai-dialog-header">
          <h3 class="ai-dialog-title">选择知识点维度</h3>
          <label class="checkbox-wrapper">
            <input
              type="checkbox"
              class="select-all-checkbox"
              :checked="isAllSelected"
              @change="toggleSelectAll"
            />
            <span class="checkbox-label">全选</span>
          </label>
        </div>
        <div class="ai-dialog-content">
          <div class="knowledge-dimensions-list">
            <button
              v-for="(dim, index) in currentSkillDimensions"
              :key="index"
              class="knowledge-dimension-btn"
              :class="{ selected: dim[0] ? isDimensionSelected(dim[0]) : false }"
              @click="dim[0] && toggleDimension(dim[0])"
            >
              {{ dim[0] }}
            </button>
          </div>
          <div class="dialog-buttons">
            <button
              class="btn-generate-questions"
              @click="handleGenerateQuestions"
              :disabled="isGenerating"
            >
              <span v-if="isGenerating" class="loading-text">
                生成中
                <WaveLoading />
              </span>
              <span v-else>生成专属题目</span>
            </button>
            <button class="btn-cancel" @click="closeDialog" :disabled="isGenerating">
              取消生成
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/layout/NavBar.vue'
import WaveLoading from '@/components/layout/WaveLoading.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCareerStore } from '@/stores/career'
import { useSkillResultsStore } from '@/stores/skillResults'

const router = useRouter()
const careerStore = useCareerStore()
const skillResultsStore = useSkillResultsStore()
const searchKeyword = ref('')

// 从 Pinia 获取岗位和技能数据
const careersData = computed(() => {
  return careerStore.selectedJobNames.map((jobName) => {
    const skills = skillResultsStore.getSkillResultsByJob(jobName)
    return {
      name: jobName,
      skills: skills.map((skill) => ({
        name: skill.skill_name,
        wrongCount: 0, // 暂时设为0，后续可以从其他 store 获取
      })),
    }
  })
})

// 搜索过滤
const filteredCareers = computed(() => {
  if (!searchKeyword.value.trim()) {
    return careersData.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return careersData.value
    .map((career) => ({
      ...career,
      skills: career.skills.filter((skill) => skill.name.toLowerCase().includes(keyword)),
    }))
    .filter((career) => career.name.toLowerCase().includes(keyword) || career.skills.length > 0)
})

// 页面加载时确保 Pinia 数据已获取
onMounted(async () => {
  // 如果 Pinia 中没有技能数据，可能需要触发数据加载
  if (Object.keys(skillResultsStore.skillResults).length === 0) {
    // 这里可以触发数据加载，具体看业务逻辑
    console.log('等待技能数据加载...')
  }
})

// 生成中状态
const isGenerating = ref(false)

// 弹窗显示状态
const showDialog = ref(false)

// 当前点击的技能信息
const currentJobIndex = ref<number>(-1)
const currentSkillIndex = ref<number>(-1)

// 选中的知识点维度（支持多选）
const selectedDimensions = ref<Set<string>>(new Set())

// 当前技能的知识点维度
const currentSkillDimensions = computed(() => {
  if (currentJobIndex.value === -1 || currentSkillIndex.value === -1) {
    return []
  }
  const career = careersData.value[currentJobIndex.value]
  if (!career) return []
  const skill = career.skills[currentSkillIndex.value]
  if (!skill) return []

  // 从 Pinia 获取完整技能数据，包含 dimensions
  const jobName = career.name
  const allSkills = skillResultsStore.getSkillResultsByJob(jobName)
  const fullSkill = allSkills.find((s) => s.skill_name === skill.name)
  return fullSkill?.dimensions || []
})

// 关闭弹窗
function closeDialog() {
  showDialog.value = false
  selectedDimensions.value.clear()
  isGenerating.value = false
}

// 跳转到题目页面
function goToQuestion() {
  router.push({ name: 'user-question' })
}

// 处理生成按钮点击
function handleGenerate(cIndex: number, sIndex: number) {
  currentJobIndex.value = cIndex
  currentSkillIndex.value = sIndex
  showDialog.value = true

  // 默认选中所有知识点维度
  const dimensions = currentSkillDimensions.value
  selectedDimensions.value = new Set(
    dimensions.filter((dim) => dim[0] !== undefined).map((dim) => dim[0]) as string[],
  )
}

// 切换知识点选中状态
function toggleDimension(dimension: string) {
  if (selectedDimensions.value.has(dimension)) {
    selectedDimensions.value.delete(dimension)
  } else {
    selectedDimensions.value.add(dimension)
  }
}

// 检查知识点是否选中
function isDimensionSelected(dimension: string): boolean {
  return selectedDimensions.value.has(dimension)
}

// 判断是否全部选中
const isAllSelected = computed(() => {
  if (currentSkillDimensions.value.length === 0) return false
  return currentSkillDimensions.value.every((dim) => dim[0] && selectedDimensions.value.has(dim[0]))
})

// 切换全选状态
function toggleSelectAll() {
  if (isAllSelected.value) {
    // 取消全选
    selectedDimensions.value.clear()
  } else {
    // 全选
    selectedDimensions.value = new Set(
      currentSkillDimensions.value
        .filter((dim) => dim[0] !== undefined)
        .map((dim) => dim[0]) as string[],
    )
  }
}

// 生成专属题目
function handleGenerateQuestions() {
  if (selectedDimensions.value.size === 0) {
    alert('请先选择至少一个知识点维度')
    return
  }

  isGenerating.value = true

  // TODO: 调用生成题目的API
  setTimeout(() => {
    isGenerating.value = false
    alert(`已生成：${Array.from(selectedDimensions.value).join('、')} 的专属题目`)
  }, 3000)
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
.knowledge-container {
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

/* ========= 背景 ========= */
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

/* ========= 搜索区域 ========= */
.search-bar-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.search-section {
  flex: 1;
  margin-bottom: 0;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1.2rem;
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  max-width: 250px;
  padding: 1rem 1rem 1rem 3.5rem;
  font-size: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  outline: none;
  transition: all 0.3s;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.search-input:focus {
  border-color: var(--accent-teal);
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

.career-count {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* ========= 岗位列表 ========= */
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
  gap: 1rem;
  flex: 1;
}

.career-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.skill-count {
  font-size: 0.85rem;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.08);
  padding: 0.25rem 0.7rem;
  border-radius: 12px;
}

.expand-arrow {
  font-size: 0.8rem;
  color: var(--text-secondary);
  transition: transform 0.3s;
  margin-left: auto;
}

.career-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

/* ========= 技能卡片网格 ========= */
.skill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding-top: 1rem;
}

.skill-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 1.2rem;
  transition: all 0.3s;
}

.skill-card:hover {
  border-color: var(--accent-teal);
  background: rgba(46, 196, 182, 0.05);
}

.skill-header {
  margin-bottom: 0.8rem;
}

.skill-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.skill-dimensions {
  margin-bottom: 1rem;
}

.dimension-label {
  font-size: 0.8rem;
  color: var(--accent-teal);
  font-weight: 600;
  display: block;
  margin-bottom: 0.5rem;
}

.dimension-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.dimension-tag {
  font-size: 0.75rem;
  color: var(--text-secondary);
  padding: 0.2rem 0.6rem;
  background: rgba(46, 196, 182, 0.1);
  border: 1px solid rgba(46, 196, 182, 0.2);
  border-radius: 4px;
}

.skill-actions {
  display: flex;
  gap: 0.6rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--border-color);
}

.btn-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action .icon {
  width: 14px;
  height: 14px;
}

.btn-generate {
  background: rgba(255, 107, 53, 0.15);
  color: var(--accent-orange);
  border: 1px solid rgba(255, 107, 53, 0.3);
}

.btn-generate:hover {
  background: var(--accent-orange);
  color: var(--bg-dark);
  transform: scale(1.02);
}

.btn-question-bank {
  background: rgba(46, 196, 182, 0.15);
  color: var(--accent-teal);
  border: 1px solid rgba(46, 196, 182, 0.3);
  position: relative;
}

.btn-question-bank:hover {
  background: var(--accent-teal);
  color: var(--bg-dark);
  transform: scale(1.02);
}

.wrong-count {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  color: #fff;
  border-radius: 9px;
  padding: 0 4px;
}

/* ========= 加载文字动画 ========= */
.loading-text {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

/* ========= AI出题弹窗 ========= */
.ai-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 2rem;
}

.ai-dialog-panel {
  background: #fff;
  width: 40vw;
  height: 80vh;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.ai-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.ai-dialog-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.select-all-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.checkbox-label {
  font-size: 0.9rem;
  color: #6b7280;
  cursor: pointer;
  user-select: none;
}

.ai-dialog-content {
  display: flex;
  flex-direction: column;
  height: calc(100% - 65px);
}

.knowledge-dimensions-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.knowledge-dimension-btn {
  padding: 1rem 1.25rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  height: 70px;
  display: flex;
  align-items: center;
}

.knowledge-dimension-btn:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.knowledge-dimension-btn.selected {
  border-color: #3b82f6;
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 600;
}

.dialog-buttons {
  display: flex;
  gap: 0.8rem;
  width: 100%;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-generate-questions {
  flex: 1;
  padding: 0.8rem 1rem;
  background: rgba(46, 196, 182, 0.12);
  color: #2ec4b6;
  border: 1.5px solid rgba(46, 196, 182, 0.3);
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.btn-generate-questions:hover:not(:disabled) {
  background: #2ec4b6;
  color: #fff;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(46, 196, 182, 0.3);
}

.btn-generate-questions:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-generate-questions:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  flex: 1;
  padding: 0.8rem 1rem;
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border: 1.5px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover:not(:disabled) {
  background: #ef4444;
  color: #fff;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-cancel:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ========= 空状态 ========= */
.empty-state {
  padding: 3rem;
  text-align: center;
}

.empty-text {
  font-size: 1rem;
  color: var(--text-secondary);
}

/* 无技能空状态（带边框样式） */
.empty-state.card-style {
  padding: 0.8rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-top: 1rem;
}

/* ========= 错题本入口 ========= */
.wrong-book-section {
  flex-shrink: 0;
  margin-top: 0;
  width: 320px;
}

.wrong-book-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.2rem;
  background: var(--bg-card);
  border: 1px solid rgba(46, 196, 182, 0.3);
  border-radius: 10px;
  transition: all 0.3s;
}

.wrong-book-card:hover {
  border-color: var(--accent-teal);
  box-shadow: 0 8px 30px rgba(46, 196, 182, 0.15);
}

.wrong-book-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(46, 196, 182, 0.15);
  border-radius: 50%;
  flex-shrink: 0;
}

.wrong-book-icon svg {
  width: 20px;
  height: 20px;
  color: var(--accent-teal);
}

.wrong-book-info {
  flex: 1;
  min-width: 0;
}

.wrong-book-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}

.wrong-book-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.total-wrong {
  color: var(--accent-teal);
  font-weight: 600;
}

.btn-wrong-book {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  background: transparent;
  border: 1px solid var(--accent-teal);
  color: var(--accent-teal);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-wrong-book:hover {
  background: var(--accent-teal);
  color: var(--bg-dark);
  transform: scale(1.02);
}

/* ========= 响应式适配 ========= */
@media (max-width: 1024px) {
  .main-content {
    padding: 2rem 3%;
  }

  .wrong-book-section {
    width: 260px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1.5rem 1rem;
  }

  .search-bar-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .wrong-book-section {
    width: 100%;
    margin-top: 0;
  }

  .search-input {
    max-width: 100%;
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

  .career-header {
    padding: 1rem;
  }

  .career-title-row {
    flex-wrap: wrap;
  }

  .skill-grid {
    grid-template-columns: 1fr;
  }

  .skill-card {
    padding: 1rem;
  }

  .wrong-book-card {
    flex-direction: column;
    text-align: center;
    padding: 1.2rem;
    gap: 1rem;
  }

  .wrong-book-info {
    text-align: center;
  }

  .btn-wrong-book {
    width: 100%;
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

  .skill-actions {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }
}
</style>
