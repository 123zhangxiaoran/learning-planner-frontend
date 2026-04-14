export const ResponseCode = {
  // 成功
  SUCCESS: 200,
  // 参数错误
  PARAM_ERROR: 400,
  // 失败
  FAIL: 401,
  // 无权限
  FORBIDDEN: 402,
  // 资源不存在
  NOT_FOUND: 403,
  // 未登录
  UNAUTHORIZED: 404,
  // 操作频繁
  TOO_MANY_REQUESTS: 405,
  // 系统异常
  SYSTEM_ERROR: 406,

  // 手机号格式错误
  PHONE_INVALID: 4001,
  // 验证码格式错误
  CODE_INVALID: 4002,
  // 密码格式错误
  PASSWORD_INVALID: 4003,
  // 确认密码格式错误
  REPASSWORD_INVALID: 4004,
  // 两次密码不一致
  PASSWORD_MISMATCH: 4005,
  // 账号已存在
  ACCOUNT_EXISTS: 4006,
  // 验证码错误
  CODE_MISMATCH: 4007,
  // 账号不存在
  ACCOUNT_NOT_EXISTS: 4008,
  // 密码错误
  PASSWORD_NOT: 4009,
  //  密码未设置
  PASSWORD_NOT_SET: 4010,
} as const;

export type ResponseCode = typeof ResponseCode[keyof typeof ResponseCode];
