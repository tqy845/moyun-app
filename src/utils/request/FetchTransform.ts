import type { RequestInit, Response } from 'node-fetch'
import { FetchError } from 'node-fetch'

import type { RequestOptions, Result } from '@/types/axios'

/**
 * @description 创建Fetch实例配置
 */
export interface CreateFetchOptions extends RequestInit {
  /**
   * 请求验证方案
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes
   */
  authenticationScheme?: string
  /**
   * 请求数据处理
   */
  transform: FetchTransform
  /**
   * 请求配置
   */
  requestOptions?: RequestOptions

  headers: HeadersInit
}

/**
 * Fetch请求数据处理 抽象类
 */
export abstract class FetchTransform {
  /**
   * 请求前钩子
   */
  beforeRequestHook?: (
    config: RequestInit & { url: string },
    options: RequestOptions
  ) => RequestInit & { url: string }

  /**
   * 数据处理前钩子
   */
  transformRequestHook?: <T = any>(res: Response, options: RequestOptions) => Promise<T>

  /**
   * 请求失败钩子
   */
  requestCatchHook?: <T = any>(e: Error | FetchError, options: RequestOptions) => Promise<T>

  /**
   * 请求拦截器
   */
  requestInterceptors?: (
    config: RequestInit & { url: string },
    options: CreateFetchOptions
  ) => RequestInit & { url: string }

  /**
   * 响应拦截器
   */
  responseInterceptors?: (res: Response, notify: Function) => Promise<Response>

  /**
   * 请求拦截器错误处理
   */
  requestInterceptorsCatch?: (error: FetchError) => void

  /**
   * 响应拦截器错误处理
   */
  responseInterceptorsCatch?: (error: FetchError) => void
}
