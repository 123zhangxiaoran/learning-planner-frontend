<template>
  <div class="login-container">
    <!-- 噪点纹理背景 -->
    <div class="noise-bg"></div>
    <!-- 手绘网格背景 -->
    <svg class="hand-drawn-grid" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path
            d="M 60 0 L 0 0 0 60"
            fill="none"
            stroke="#7eb8d4"
            stroke-width="1"
            stroke-dasharray="4,4"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>

    <div class="login-layout">
      <!-- 左侧：风景画布 -->
      <div class="left-scene">
        <canvas ref="sceneCanvas" class="scene-canvas"></canvas>
      </div>

      <!-- 右侧：登录表单 -->
      <div class="login-form-container">
        <div class="form-content">
          <div class="form-header">
            <span class="form-title">学路规划</span>
            <span class="form-subtitle">CAREER PATH</span>
          </div>

          <div v-if="mode === 'login'" class="login-tabs">
            <button
              :class="['tab-btn', { active: loginType === 'password' }]"
              @click="loginType = 'password'"
            >
              手机密码
            </button>
            <button
              :class="['tab-btn', { active: loginType === 'sms' }]"
              @click="loginType = 'sms'"
            >
              手机验证码
            </button>
          </div>

          <!-- 账号密码登录 -->
          <div v-if="mode === 'login' && loginType === 'password'">
            <form @submit.prevent="handlePwdLogin">
              <div class="input-group">
                <input
                  type="text"
                  class="input-field"
                  v-model="pwdLoginForm.account"
                  placeholder="手机号"
                  autocomplete="username"
                  @input="clearPwdLoginFieldError('account')"
                />
                <div v-if="pwdLoginError.account" class="error-hint">
                  {{ pwdLoginError.account }}
                </div>
              </div>
              <div class="input-group">
                <input
                  type="password"
                  class="input-field"
                  v-model="pwdLoginForm.password"
                  placeholder="密码"
                  autocomplete="current-password"
                  @input="clearPwdLoginFieldError('password')"
                />
                <div v-if="pwdLoginError.password" class="error-hint">
                  {{ pwdLoginError.password }}
                </div>
              </div>
              <button type="submit" class="btn-primary" :disabled="pwdLoginLoading">
                {{ pwdLoginLoading ? '进入中...' : '开启学习之旅' }}
              </button>
            </form>
            <div class="toggle-text">
              还没有账号？
              <span class="toggle-link" @click="mode = 'register'">立即注册</span>
            </div>
          </div>

          <!-- 手机号+验证码登录 -->
          <div v-if="mode === 'login' && loginType === 'sms'">
            <form @submit.prevent="handleSmsLogin">
              <div class="input-group">
                <input
                  type="tel"
                  class="input-field"
                  v-model="smsLoginForm.mobile"
                  placeholder="手机号"
                  autocomplete="tel"
                  @input="clearSmsLoginFieldError('mobile')"
                />
                <div v-if="smsLoginError.mobile" class="error-hint">{{ smsLoginError.mobile }}</div>
              </div>
              <div class="input-group code-group">
                <input
                  type="text"
                  class="input-field code-input"
                  v-model="smsLoginForm.code"
                  placeholder="验证码"
                  @input="clearSmsLoginFieldError('code')"
                />
                <button
                  type="button"
                  class="send-code-btn"
                  :disabled="smsCodeCountdown > 0"
                  @click="sendSmsLoginCode"
                >
                  {{ smsCodeCountdown > 0 ? `${smsCodeCountdown}秒后重试` : '获取验证码' }}
                </button>
                <div v-if="smsLoginError.code" class="error-hint">
                  {{ smsLoginError.code }}
                </div>
              </div>
              <button type="submit" class="btn-primary" :disabled="smsLoginLoading">
                {{ smsLoginLoading ? '进入中...' : '开启学习之旅' }}
              </button>
            </form>
            <div class="toggle-text">
              还没有学路账号？
              <span class="toggle-link" @click="mode = 'register'">立即注册</span>
            </div>
          </div>

          <!-- 注册表单 -->
          <div v-if="mode === 'register'">
            <form @submit.prevent="handleRegister">
              <div class="input-group">
                <input
                  type="text"
                  class="input-field"
                  v-model="registerForm.mobile"
                  placeholder="手机号"
                  @input="clearRegisterFieldError('mobile')"
                />
                <div v-if="registerError.mobile" class="error-hint">{{ registerError.mobile }}</div>
              </div>
              <div class="input-group">
                <input
                  type="password"
                  class="input-field"
                  v-model="registerForm.password"
                  placeholder="密码"
                  @input="clearRegisterFieldError('password')"
                />
                <div v-if="registerError.password" class="error-hint">
                  {{ registerError.password }}
                </div>
              </div>
              <div class="input-group">
                <input
                  type="password"
                  class="input-field"
                  v-model="registerForm.confirmPwd"
                  placeholder="确认密码"
                  @input="clearRegisterFieldError('confirmPwd')"
                />
                <div v-if="registerError.confirmPwd" class="error-hint">
                  {{ registerError.confirmPwd }}
                </div>
              </div>
              <div class="input-group code-group">
                <input
                  type="text"
                  class="input-field code-input"
                  v-model="registerForm.code"
                  placeholder="验证码"
                  @input="clearRegisterFieldError('code')"
                />
                <button
                  type="button"
                  class="send-code-btn"
                  :disabled="smsCodeCountdown > 0"
                  @click="sendRegisterCode"
                >
                  {{ smsCodeCountdown > 0 ? `${smsCodeCountdown}秒后重试` : '获取验证码' }}
                </button>
              </div>
              <div v-if="registerError.code" class="error-hint">
                {{ registerError.code }}
              </div>
              <button type="submit" class="btn-primary" :disabled="registerLoading">
                {{ registerLoading ? '账号创建中...' : '创建学路账号' }}
              </button>
            </form>
            <div class="toggle-text">
              已有学路账号？
              <span class="toggle-link" @click="((mode = 'login'), (loginType = 'password'))"
                >返回登录</span
              >
            </div>
          </div>

          <div class="demo-note">探索专业 · 规划未来</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { accountLogin, phoneLogin, sendCode, sendUser } from '@/api/user'
import { ResponseCode } from '@/constants/responseCode.ts'
import router from '@/router'
import { usePlayerStore } from '@/stores/user'

// 绘制风景画布
onMounted(() => {
  drawScene()
  window.addEventListener('resize', drawScene)
})

// 画布引用
const sceneCanvas = ref<HTMLCanvasElement | null>(null)

// 绘制风景画
function drawScene(): void {
  const canvas = sceneCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置画布尺寸
  const rect = canvas.parentElement?.getBoundingClientRect()
  if (rect) {
    canvas.width = rect.width
    canvas.height = rect.height
  }
  const w = canvas.width
  const h = canvas.height

  // 清空画布
  ctx.clearRect(0, 0, w, h)
  ctx.strokeStyle = '#000000'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // 设置缩放比例
  const scale = 0.2

  // 正态分布随机函数（Box-Muller transform）
  function randomNormal(mean: number, stdDev: number): number {
    const u1 = Math.random()
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return z * stdDev + mean
  }

  // 整体向左偏移
  const offsetX = w * 0.15

  // 整体向上偏移
  const offsetY = h * 0.08

  // ===== 上半部分：天空（留白） =====

  // ===== 中上部：山脉轮廓 =====
  // 左侧高山脉
  drawMountainLayer(ctx, w * 0.08 - offsetX, h * 0.55 - offsetY, w * 0.35, h * 0.2, 2 * scale)
  // 中间山脉
  drawMountainLayer(ctx, w * 0.28 - offsetX, h * 0.52 - offsetY, w * 0.3, h * 0.16, 1.8 * scale)
  // 右侧平缓山脉
  drawMountainLayer(ctx, w * 0.52 - offsetX, h * 0.5 - offsetY, w * 0.4, h * 0.12, 1.5 * scale)
  // 最右侧低山脉
  drawMountainLayer(ctx, w * 0.82 - offsetX, h * 0.53 - offsetY, w * 0.2, h * 0.1, 1.2 * scale)

  // ===== 装饰线条：增加层次感 =====
  // 淡的远山轮廓
  ctx.lineWidth = 0.8 * scale
  ctx.strokeStyle = '#555555'
  drawMountainLayer(ctx, -offsetX, h * 0.38 - offsetY, w * 0.45, h * 0.1, 0.8 * scale)
  drawMountainLayer(ctx, w * 0.5 - offsetX, h * 0.4 - offsetY, w * 0.5, h * 0.08, 0.7 * scale)

  // 装饰性短线：路边标记（正态分布）
  ctx.lineWidth = 1.5 * scale
  ctx.strokeStyle = '#222222'
  for (let i = 0; i < 15; i++) {
    ctx.beginPath()
    const x = w * randomNormal(0.4, 0.15) - offsetX
    const y = h * randomNormal(0.7, 0.1) - offsetY
    const len = w * (0.01 + Math.random() * 0.02)
    ctx.moveTo(x, y)
    ctx.lineTo(x - len, y - len * 0.5)
    ctx.stroke()
  }

  // 装饰性点：星星或远处灯光（正态分布）
  ctx.fillStyle = '#888888'
  for (let i = 0; i < 12; i++) {
    ctx.beginPath()
    const x = w * randomNormal(0.4, 0.2) - offsetX
    const y = h * randomNormal(0.25, 0.08) - offsetY
    const r = Math.abs(randomNormal(2, 1))
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // ===== 中下部：S型河流/道路 =====
  ctx.lineWidth = 1.5 * scale

  // 道路向左偏移更多（比山脉多10%）
  const roadOffsetX = offsetX + w * 0.1

  // 第一条S型曲线（左边）
  ctx.beginPath()
  // 起点：底部中央
  const startX = w * 0.5 - roadOffsetX
  const startY = h - offsetY
  ctx.moveTo(startX, startY)

  // S型曲线控制点
  const cp1x = w * 0.7 - roadOffsetX,
    cp1y = h * 0.75 - offsetY
  const cp2x = w * 0.3 - roadOffsetX,
    cp2y = h * 0.6 - offsetY
  const cp3x = w * 0.6 - roadOffsetX,
    cp3y = h * 0.48 - offsetY
  const endX = w * 0.45 - roadOffsetX,
    endY = h * 0.4 - offsetY

  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, cp3x, cp3y)
  ctx.bezierCurveTo(w * 0.72 - roadOffsetX, h * 0.36 - offsetY, endX, endY, endX, endY)
  ctx.stroke()

  // 第二条S型曲线（右边）- 越往上间距越小
  ctx.beginPath()
  // 起点偏移大
  ctx.moveTo(startX + w * 0.35, startY)
  // 中间偏移减小
  ctx.bezierCurveTo(cp1x + w * 0.28, cp1y, cp2x + w * 0.18, cp2y, cp3x + w * 0.12, cp3y)
  // 终点几乎汇合
  ctx.bezierCurveTo(
    w * 0.72 - roadOffsetX + w * 0.08,
    h * 0.36 - offsetY,
    endX + w * 0.05,
    endY,
    endX + w * 0.05,
    endY,
  )
  ctx.stroke()
}

/**
 * 绘制山脉层次
 * @param ctx 画布上下文
 * @param startX 起始X坐标
 * @param startY 起始Y坐标（基线）
 * @param width 山脉宽度
 * @param peakHeight 山峰高度
 * @param lineWidth 线宽
 */
function drawMountainLayer(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  width: number,
  peakHeight: number,
  lineWidth: number,
): void {
  ctx.lineWidth = lineWidth
  ctx.beginPath()

  const points: number[] = []
  // 生成自然的起伏点
  const segments = 8
  for (let i = 0; i <= segments; i++) {
    const x = startX + (width / segments) * i
    const progress = i / segments
    // 中间高两边低，模拟山峰
    const baseY = startY - peakHeight
    const peakY = startY - peakHeight * 1.5
    const y =
      progress < 0.5
        ? baseY + (peakY - baseY) * (progress * 2)
        : peakY + (baseY - peakY) * ((progress - 0.5) * 2)
    // 添加随机起伏
    const noise = Math.sin(i * 1.5) * peakHeight * 0.15
    points.push(x, y + noise)
  }

  // 绘制连贯的波浪线
  ctx.moveTo(points[0]!, points[1]!)
  for (let i = 2; i < points.length; i += 2) {
    const x = points[i]!
    const y = points[i + 1]!
    ctx.lineTo(x, y)
  }
  ctx.stroke()
}

// ======================== 表单类型定义 ========================
type Mode = 'login' | 'register'
type LoginType = 'password' | 'sms'

interface PwdLoginForm {
  account: string
  password: string
}

interface SmsLoginForm {
  mobile: string
  code: string
}

interface RegisterForm {
  password: string
  confirmPwd: string
  mobile: string
  code: string
}

interface PwdLoginErrors {
  account: string
  password: string
}

interface SmsLoginErrors {
  mobile: string
  code: string
}

interface RegisterErrors {
  mobile: string
  password: string
  confirmPwd: string
  code: string
}

const mode = ref<Mode>('login')
const loginType = ref<LoginType>('password')

const isSending = ref(false)
const pwdLoginForm = ref<PwdLoginForm>({ account: '', password: '' })
const pwdLoginError = ref<PwdLoginErrors>({ account: '', password: '' })
const pwdLoginLoading = ref(false)
const smsLoginLoading = ref(false)
const registerLoading = ref(false)

const smsLoginForm = ref<SmsLoginForm>({ mobile: '', code: '' })
const smsLoginError = ref<SmsLoginErrors>({ mobile: '', code: '' })

const registerForm = ref<RegisterForm>({
  mobile: '',
  password: '',
  confirmPwd: '',
  code: '',
})
const registerError = ref<RegisterErrors>({
  mobile: '',
  password: '',
  confirmPwd: '',
  code: '',
})

const smsCodeCountdown = ref<number>(0)
let smsTimer: number | null = null

function clearPwdLoginFieldError(field: keyof PwdLoginErrors): void {
  pwdLoginError.value[field] = ''
}
function clearSmsLoginFieldError(field: keyof SmsLoginErrors): void {
  smsLoginError.value[field] = ''
}
function clearRegisterFieldError(field: keyof RegisterErrors): void {
  registerError.value[field] = ''
}

//  发送验证码
async function sendSmsLoginCode(): Promise<void> {
  if (smsCodeCountdown.value > 0) return
  const mobile = smsLoginForm.value.mobile
  smsLoginError.value.mobile = ''
  if (!mobile) {
    smsLoginError.value.mobile = '请填写手机号码'
    return
  }
  if (!/^1[3-9]\d{9}$/.test(mobile)) {
    smsLoginError.value.mobile = '手机号格式不正确（11位数字，1开头）'
    return
  }
  isSending.value = true
  try {
    const res = await sendCode(mobile)
    if (res.code === ResponseCode.PHONE_INVALID) {
      smsLoginError.value.mobile = res.message
      isSending.value = false
      return
    } else if (res.code === ResponseCode.TOO_MANY_REQUESTS) {
      smsLoginError.value.mobile = res.message
      isSending.value = false
      return
    }
    smsLoginError.value.mobile = ''
    alert('验证码认证信息:' + res.data)
    //启动倒计时
    smsCodeCountdown.value = 60
    if (smsTimer) clearInterval(smsTimer)
    smsTimer = window.setInterval(() => {
      if (smsCodeCountdown.value > 0) {
        smsCodeCountdown.value--
      } else {
        if (smsTimer) clearInterval(smsTimer)
        smsTimer = null
        isSending.value = false
      }
    }, 1000)
  } catch (err: unknown) {
    //恢复验证码发送按钮
    isSending.value = false

    const axiosErr = err as { response?: unknown }
    if (!axiosErr.response) {
      alert('网络异常，请检查网络后重试，或稍后再试')
    }
  }
}
//  发送注册验证码
async function sendRegisterCode(): Promise<void> {
  if (smsCodeCountdown.value > 0) return
  const mobile = registerForm.value.mobile
  registerError.value.mobile = ''
  if (!mobile) {
    registerError.value.mobile = '请填写手机号码'
    return
  }
  if (!/^1[3-9]\d{9}$/.test(mobile)) {
    registerError.value.mobile = '手机号格式不正确（11位数字，1开头）'
    return
  }
  isSending.value = true
  try {
    const res = await sendCode(mobile)
    if (res.code === ResponseCode.PHONE_INVALID) {
      registerError.value.mobile = res.message
      isSending.value = false
      return
    } else if (res.code === ResponseCode.TOO_MANY_REQUESTS) {
      registerError.value.mobile = res.message
      isSending.value = false
      return
    }
    registerError.value.mobile = ''
    alert('验证码认证信息:' + res.data)
    //启动倒计时
    smsCodeCountdown.value = 60
    if (smsTimer) clearInterval(smsTimer)
    smsTimer = window.setInterval(() => {
      if (smsCodeCountdown.value > 0) {
        smsCodeCountdown.value--
      } else {
        if (smsTimer) clearInterval(smsTimer)
        smsTimer = null
        isSending.value = false
      }
    }, 1000)
  } catch (err) {
    console.log(err)
  }
}
// 登录
async function handlePwdLogin(): Promise<void> {
  pwdLoginError.value = { account: '', password: '' }
  const { account, password } = pwdLoginForm.value
  const playerStore = usePlayerStore()
  let hasError = false
  if (!account.trim()) {
    pwdLoginError.value.account = '手机号不能为空'
    hasError = true
  } else if (!/^1[3-9]\d{9}$/.test(account)) {
    pwdLoginError.value.account = '手机号格式不正确(11位数字，1开头)'
    hasError = true
  }
  if (!password) {
    pwdLoginError.value.password = '密码不能为空'
    hasError = true
  } else if (password.length < 6) {
    pwdLoginError.value.password = '密码至少6位'
    hasError = true
  }
  if (hasError) return
  pwdLoginLoading.value = true
  try {
    const res = await accountLogin(account, password)
    //验证手机格式
    if (res.code === ResponseCode.PHONE_INVALID) {
      pwdLoginError.value.account = res.message
      hasError = true
    } else if (res.code === ResponseCode.ACCOUNT_NOT_EXISTS) {
      pwdLoginError.value.account = res.message
      hasError = true
    }
    //验证密码格式
    if (res.code === ResponseCode.PASSWORD_NOT_SET) {
      pwdLoginError.value.password = res.message
      hasError = true
    } else if (res.code === ResponseCode.PASSWORD_INVALID) {
      pwdLoginError.value.password = res.message
      hasError = true
    } else if (res.code === ResponseCode.PASSWORD_NOT) {
      pwdLoginError.value.password = res.message
      hasError = true
    }
    if (hasError) return

    playerStore.setPlayerInfo(res.data)
    playerStore.setAccessToken(res.data.accessToken)
    setTimeout(() => router.replace('/'), 0)
  } catch (err) {
    console.log('登录失败', err)
    alert('登录失败: ' + err)
  } finally {
    pwdLoginLoading.value = false
  }
}
// 手机验证码登录
async function handleSmsLogin(): Promise<void> {
  smsLoginError.value = { mobile: '', code: '' }
  const { mobile, code } = smsLoginForm.value
  const playerStore = usePlayerStore()
  let hasError = false
  if (!mobile) {
    smsLoginError.value.mobile = '手机号不能为空'
    hasError = true
  } else if (!/^1[3-9]\d{9}$/.test(mobile)) {
    smsLoginError.value.mobile = '手机号格式不正确(11位数字，1开头)'
    hasError = true
  }
  if (!code) {
    smsLoginError.value.code = '验证码不能为空'
    hasError = true
  } else if (code.length !== 6) {
    smsLoginError.value.code = '验证码为6位数字'
    hasError = true
  }
  if (hasError) return
  smsLoginLoading.value = true

  //把数据传给后端
  try {
    const res = await phoneLogin(mobile, Number(code))
    // 手机格式错误
    if (res.code === ResponseCode.PHONE_INVALID) {
      smsLoginError.value.mobile = res.message
      isSending.value = false
      hasError = true
    }
    // 验证码格式错误，两次验证码是否一致
    if (res.code === ResponseCode.CODE_INVALID) {
      smsLoginError.value.code = res.message
      isSending.value = false
      hasError = true
    } else if (res.code === ResponseCode.CODE_MISMATCH) {
      smsLoginError.value.code = res.message
      isSending.value = false
      hasError = true
    }
    //操作失败
    if (res.code === ResponseCode.FAIL) {
      smsLoginError.value.mobile = res.message
      isSending.value = false
      hasError = true
    }
    if (hasError) return

    playerStore.setPlayerInfo(res.data)
    playerStore.setAccessToken(res.data.accessToken)
    setTimeout(() => router.replace('/'), 0)
  } catch (err) {
    console.log(err)
  } finally {
    smsLoginLoading.value = false
  }
}
//  注册
async function handleRegister(): Promise<void> {
  registerError.value = {
    mobile: '',
    password: '',
    confirmPwd: '',
    code: '',
  }
  const { mobile, password, confirmPwd, code } = registerForm.value
  const playerStore = usePlayerStore()
  let hasError = false

  if (!mobile.trim()) {
    registerError.value.mobile = '手机号不能为空'
    hasError = true
  } else if (!/^1[3-9]\d{9}$/.test(mobile)) {
    registerError.value.mobile = '手机号格式不正确(11位数字，1开头)'
    hasError = true
  }
  if (!code) {
    registerError.value.code = '验证码不能为空'
    hasError = true
  } else if (code.length !== 6) {
    registerError.value.code = '验证码为6位数字'
    hasError = true
  }
  if (!password) {
    registerError.value.password = '密码不能为空'
    hasError = true
  } else if (password.length < 6) {
    registerError.value.password = '密码至少6位'
    hasError = true
  }
  if (confirmPwd.length < 6) {
    registerError.value.confirmPwd = '确认密码至少6位'
    hasError = true
  } else if (password !== confirmPwd) {
    registerError.value.confirmPwd = '两次输入的密码不一致'
    hasError = true
  }
  if (hasError) return
  registerLoading.value = true

  // 传入数据给后端
  try {
    const res = await sendUser(mobile, password, confirmPwd, Number(code))
    //手机格式验证
    if (res.code === ResponseCode.PHONE_INVALID) {
      registerError.value.mobile = res.message
      hasError = true
    }
    //密码格式验证
    if (res.code === ResponseCode.PASSWORD_INVALID) {
      registerError.value.password = res.message
      hasError = true
    }
    //确认密码格式验证
    if (res.code === ResponseCode.REPASSWORD_INVALID) {
      registerError.value.confirmPwd = res.message
      hasError = true
    } else if (res.code === ResponseCode.PASSWORD_MISMATCH) {
      //两次密码不一致
      registerError.value.confirmPwd = res.message
      hasError = true
    }
    //验证码格式错误
    if (res.code === ResponseCode.CODE_INVALID) {
      registerError.value.code = res.message
      hasError = true
    } else if (res.code === ResponseCode.CODE_MISMATCH) {
      //验证码错误
      registerError.value.code = res.message
      hasError = true
    }
    //账号已存在
    if (res.code === ResponseCode.ACCOUNT_EXISTS) {
      registerError.value.mobile = res.message
      hasError = true
    }
    //操作失败
    if (res.code === ResponseCode.FAIL) {
      registerError.value.mobile = res.message
      hasError = true
    }
    if (hasError) return

    playerStore.setPlayerInfo(res.data)
    playerStore.setAccessToken(res.data.accessToken)
    setTimeout(() => {
      router.replace('/')
      registerForm.value = { mobile: '', password: '', confirmPwd: '', code: '' }
    }, 0)
  } catch (err) {
    console.log(err)
  } finally {
    registerLoading.value = false
  }
}

// 清理计时器
onUnmounted(() => {
  if (smsTimer) clearInterval(smsTimer)
})
</script>

<style scoped>
/* ========= 基础重置 ========= */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* ========= CSS 变量 ========= */
:root {
  --bg-dark: #e8f4f8;
  --bg-card: #ffffff;
  --border-color: #a0c4d4;
  --accent-orange: #ff6b35;
  --accent-yellow: #f7c548;
  --accent-teal: #2ec4b6;
  --text-primary: #2c3e50;
  --text-secondary: #7f8c9a;
}

/* ========= 容器 ========= */
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-dark);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

/* ========= 噪点背景 ========= */
.noise-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.08;
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
  opacity: 0.6;
}

/* ========= 布局：左风景右登录 ========= */
.login-layout {
  position: relative;
  z-index: 10;
  display: flex;
  width: 100%;
  height: 100%;
  gap: 0;
}

/* ========= 左侧：风景画布 ========= */
.left-scene {
  flex: 0 0 45%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.scene-canvas {
  width: 100%;
  height: 100%;
}

/* ========= 右侧：登录表单 ========= */
.login-form-container {
  flex: 0 0 35%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0;
  width: 100%;
  margin-left: 5%;
}

/* 表单内容包装器 */
.form-content {
  width: 100%;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ========= 表单头部 ========= */
.form-header {
  text-align: center;
  margin-bottom: 1.5rem;
  width: 100%;
}

.form-title {
  display: block;
  font-size: 1.8rem;
  font-weight: 900;
  color: var(--accent-orange);
  letter-spacing: -0.02em;
  margin-bottom: 0.3rem;
}

.form-subtitle {
  font-size: 0.7rem;
  letter-spacing: 3px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* ========= 登录标签 ========= */
.login-tabs {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  margin-bottom: 1.2rem;
  width: 100%;
}

.tab-btn {
  background: transparent;
  border: 1px dashed #000000;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #d0e8f0;
  border-style: solid;
  color: var(--accent-orange);
  box-shadow: 0 4px 15px rgba(46, 196, 182, 0.2);
}

.tab-btn:hover:not(.active) {
  background: #d0e8f0;
  border-style: solid;
}

/* ========= 输入框 ========= */
.input-group {
  position: relative;
  margin-bottom: 0.6rem;
  width: 100%;
}

.input-field {
  width: 100%;
  background: #ffffff;
  border: 1px dashed #000000;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
  transition: all 0.3s;
  font-family: inherit;
  box-sizing: border-box;
  height: 48px;
}

.input-field:focus {
  background: #ffffff;
  border-color: var(--accent-orange);
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
  outline: none;
}

.input-field::placeholder {
  color: var(--text-secondary);
  font-weight: 400;
}

.error-hint {
  font-size: 0.75rem;
  margin-top: 4px;
  margin-left: 4px;
  margin-bottom: 8px;
  color: var(--accent-orange);
  letter-spacing: 0.2px;
}

/* ========= 验证码组 ========= */
.code-group {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 0.6rem;
}

.code-input {
  flex: 1;
}

.send-code-btn {
  background: transparent;
  border: 1px solid var(--accent-orange);
  border-radius: 12px;
  padding: 0 16px;
  height: 48px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent-orange);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.send-code-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-code-btn:not(:disabled):hover {
  background: var(--accent-orange);
  color: var(--bg-dark);
}

/* ========= 按钮 ========= */
.btn-primary {
  background: #e8f4f8;
  border: 1px dashed #000000;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 700;
  color: #000000;
  cursor: pointer;
  width: 100%;
  transition: all 0.35s;
  font-family: inherit;
  margin-top: 0.5rem;
}

.btn-primary:hover {
  background: #d0e8f0;
  border-style: solid;
  box-shadow: 0 4px 15px rgba(46, 196, 182, 0.2);
}

.btn-primary:active {
  background: #b8dce8;
}

.btn-primary:disabled {
  opacity: 0.6;
  transform: none;
  cursor: not-allowed;
}

/* ========= 切换文字 ========= */
.toggle-text {
  text-align: center;
  margin-top: 1.4rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.toggle-link {
  color: var(--accent-teal);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-link:hover {
  color: var(--accent-orange);
  letter-spacing: 0.3px;
}

.demo-note {
  text-align: center;
  font-size: 0.75rem;
  margin-top: 1.5rem;
  color: var(--text-secondary);
  opacity: 0.7;
}

/* ========= 响应式 ========= */
@media (max-width: 1024px) {
  .login-layout {
    flex-direction: column;
  }

  .left-scene {
    flex: 0 0 35%;
    min-height: 200px;
  }

  .login-form-container {
    flex: 1;
    margin-left: 0;
    justify-content: flex-start;
    padding-top: 2rem;
  }
}

@media (max-width: 768px) {
  .login-layout {
    height: auto;
    min-height: 100vh;
  }

  .left-scene {
    flex: 0 0 30vh;
    min-height: 180px;
  }

  .login-form-container {
    padding: 1.5rem 1rem;
  }

  .form-content {
    max-width: 100%;
  }

  .form-header {
    margin-bottom: 1rem;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .form-subtitle {
    font-size: 0.6rem;
  }

  .login-tabs {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .tab-btn {
    padding: 0.4rem 1rem;
    font-size: 0.85rem;
  }

  .input-group {
    margin-bottom: 0.5rem;
  }

  .input-field {
    height: 44px;
    padding: 10px 14px;
    font-size: 0.9rem;
  }

  .code-group {
    flex-direction: column;
    gap: 0.5rem;
  }

  .code-input {
    width: 100%;
  }

  .send-code-btn {
    width: 100%;
    height: 44px;
    font-size: 0.85rem;
  }

  .btn-primary {
    height: 46px;
    font-size: 0.95rem;
    margin-top: 0.3rem;
  }

  .toggle-text {
    margin-top: 1rem;
    font-size: 0.8rem;
  }

  .demo-note {
    font-size: 0.7rem;
    margin-top: 1.2rem;
  }

  .hand-drawn-grid {
    display: none;
  }

  .noise-bg {
    opacity: 0.04;
  }
}

@media (max-width: 480px) {
  .left-scene {
    flex: 0 0 25vh;
    min-height: 150px;
  }

  .login-form-container {
    padding: 1.2rem 0.8rem;
  }

  .form-title {
    font-size: 1.3rem;
  }

  .form-subtitle {
    letter-spacing: 2px;
  }

  .tab-btn {
    padding: 0.35rem 0.8rem;
    font-size: 0.8rem;
    border-radius: 15px;
  }

  .input-field {
    height: 42px;
    padding: 8px 12px;
    font-size: 0.85rem;
    border-radius: 10px;
  }

  .send-code-btn {
    height: 42px;
    font-size: 0.8rem;
    border-radius: 10px;
  }

  .btn-primary {
    height: 44px;
    font-size: 0.9rem;
    border-radius: 10px;
  }

  .toggle-text {
    font-size: 0.75rem;
  }

  .toggle-link {
    display: inline-block;
  }

  .demo-note {
    font-size: 0.65rem;
  }
}
</style>
