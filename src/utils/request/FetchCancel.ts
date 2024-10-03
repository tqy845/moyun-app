// 存储请求与取消令牌的键值对列表
let pendingMap = new Map<string, AbortController>()

export type Config = RequestInit & { url: string; params?: Record<string, any> }

/**
 * 获取请求Url
 * @param config
 */
export const getPendingUrl = (config: Config) => {
  let data = null
  if (config.body) data = JSON.stringify(config.body)
  else if (config?.params) data = JSON.stringify(config.params)
  return [config.method, config.url, data].join('&')
}

/**
 * @description 请求管理器
 */
export class FetchCanceler {
  /**
   * 添加请求到列表中
   * @param config
   */
  addPending(config: Config) {
    const url = getPendingUrl(config)
    const controller = new AbortController()
    config.signal = controller.signal
    if (!pendingMap.has(url)) {
      // 如果当前没有相同请求就添加
      pendingMap.set(url, controller)
    }
  }

  /**
   * 移除现有的所有请求
   */
  removeAllPending() {
    pendingMap.forEach((controller) => {
      if (controller) controller?.abort?.()
    })
    pendingMap.clear()
  }

  /**
   * 移除指定请求
   * @param config
   */
  removePending(config: Config) {
    const url = getPendingUrl(config)

    if (pendingMap.has(url)) {
      // 如果在pending中有当前请求标识
      // 需要取消当前请求并移除
      const controller = pendingMap.get(url)
      if (controller) controller.abort()
      pendingMap.delete(url)
    }
  }

  /**
   * 移除所有符合条件的请求
   * @param key 关键字
   */
  removePendingByKey(key: string) {
    pendingMap.forEach((controller, _key) => {
      if (_key.includes(key)) {
        controller.abort()
        pendingMap.delete(key)
      }
    })
  }

  /**
   * 重置
   */
  reset() {
    pendingMap = new Map<string, AbortController>()
  }
}

export default new FetchCanceler()
