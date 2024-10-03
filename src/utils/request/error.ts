// 定义错误提示
export const ERROR_MESSAGES = {
  networkError: '服务器连接失败，请检查网络设置。',
  timeoutError: '请求超时，请稍后重试。',
  serverError: '服务器内部错误，请稍后重试或联系管理员。',
  notFoundError: '请求的资源不存在，请检查 URL 是否正确。',
  forbiddenError: '您无权访问该资源。',
  unauthorizedError: '身份认证已过期，请重新登录。',
  badRequestError: '请求格式错误，请检查输入内容。',
  gatewayError: '服务器暂时不可用，请稍后重试。',
  unknownError: '发生未知错误，请联系管理员或稍后重试。'
}

export const getErrorMessage = (status: number): string => {
  switch (status) {
    case 400:
      return ERROR_MESSAGES.badRequestError
    case 401:
      return ERROR_MESSAGES.unauthorizedError
    case 403:
      return ERROR_MESSAGES.forbiddenError
    case 404:
      return ERROR_MESSAGES.notFoundError
    case 500:
      return ERROR_MESSAGES.serverError
    case 502:
    case 503:
    case 504:
      return ERROR_MESSAGES.gatewayError
    default:
      return ERROR_MESSAGES.unknownError
  }
}
