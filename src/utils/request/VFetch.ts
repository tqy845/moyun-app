import { fetch } from '@tauri-apps/plugin-http'
import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'
import isFunction from 'lodash/isFunction'
import throttle from 'lodash/throttle'
import { stringify } from 'qs'

import { ContentTypeEnum } from '@/constants'
import { RequestOptions, Result } from '@/types/axios'

import FetchCanceler from './FetchCancel'
import { CreateFetchOptions } from './FetchTransform'
import { NotifyPlugin } from 'tdesign-vue-next'
import { ERROR_MESSAGES, getErrorMessage } from './error'

interface FetchRequestInit extends RequestInit {
  body?: any
  params?: Record<string, any>
}

interface InternalFetchRequestConfig extends RequestInit {
  url: string
  requestOptions?: RequestOptions
}

/**
 * Fetch 模块
 */
export class VFetch {
  readonly fetchCanceler = FetchCanceler
  /**
   * Fetch配置
   * @private
   */
  private readonly options: CreateFetchOptions

  constructor(options: CreateFetchOptions) {
    this.options = options
  }

  /**
   * 设置公共头部信息
   * @param headers
   */
  setHeader(headers: Record<string, string>): void {
    if (!headers) return
    Object.assign(this.options.headers, headers)
  }

  /**
   * 支持 FormData 请求格式
   * @param config
   */
  supportFormData(config: InternalFetchRequestConfig) {
    const headers = (config.headers || this.options.headers) as Record<string, string>
    const contentType = headers?.['Content-Type'] || headers?.['content-type']

    // 如果是FormData类型，不进行JSON序列化
    if (contentType === ContentTypeEnum.FormData || config.body instanceof FormData) {
      // 删除 Content-Type，浏览器会自动设置为 multipart/form-data 并带上 boundary
      delete headers['Content-Type']
      return config
    }

    // 其他类型处理逻辑保持不变
    if (
      contentType !== ContentTypeEnum.FormURLEncoded ||
      !Reflect.has(config, 'body') ||
      config.method?.toUpperCase() === 'GET'
    ) {
      return {
        ...config,
        body: JSON.stringify(config.body) // 如果不是FormData，才进行JSON序列化
      }
    }

    return {
      ...config,
      body: stringify(config.body, { arrayFormat: 'brackets' })
    }
  }

  /**
   * 支持 params 序列化
   * @param config
   */
  supportParamsStringify(config: InternalFetchRequestConfig) {
    const headers = (config.headers || this.options.headers) as Record<string, string>
    const contentType = headers?.['Content-Type'] || headers?.['content-type']

    if (contentType === ContentTypeEnum.FormURLEncoded || !Reflect.has(config, 'body')) {
      return config
    }

    return {
      ...config,
      paramsSerializer: (params: any) => stringify(params, { arrayFormat: 'brackets' })
    }
  }

  get<T = any>(url: string, config: FetchRequestInit = {}, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'GET', url }, options)
  }

  post<T = any>(url: string, config: FetchRequestInit = {}, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'POST', url }, options)
  }

  put<T = any>(url: string, config: FetchRequestInit = {}, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'PUT', url }, options)
  }

  delete<T = any>(
    url: string,
    config: FetchRequestInit = {},
    options?: RequestOptions
  ): Promise<T> {
    return this.request({ ...config, method: 'DELETE', url }, options)
  }

  patch<T = any>(url: string, config: FetchRequestInit = {}, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'PATCH', url }, options)
  }

  /**
   * 上传文件封装
   * @param formData 表单封装的文件
   * @param url 上传地址
   * @param config 请求配置
   * @param options 其他参数
   */
  upload<T = any>(
    formData: FormData,
    url: string,
    config: RequestInit = {},
    options?: RequestOptions
  ): Promise<T> {
    return this.request(
      {
        ...config,
        method: 'POST',
        headers: {
          'Content-Type': ContentTypeEnum.FormData
        },
        body: formData,
        url
      },
      options
    )
  }

  /**
   * 请求封装
   * @param config
   * @param options
   */

  request<T = any>(config: InternalFetchRequestConfig, options?: RequestOptions): Promise<T> {
    const { requestOptions } = this.options

    config.headers = {
      ...this.options.headers,
      ...config.headers
    }

    if (requestOptions?.throttle !== undefined && requestOptions?.debounce !== undefined) {
      throw new Error('节流和防抖不能同时设置')
    }

    if (requestOptions?.throttle && requestOptions?.throttle.delay !== 0) {
      return new Promise((resolve) => {
        throttle(
          () => resolve(this.synthesisRequest(config, options)),
          requestOptions.throttle?.delay
        )
      })
    }

    if (requestOptions?.debounce && requestOptions?.debounce.delay !== 0) {
      return new Promise((resolve) => {
        debounce(
          () => resolve(this.synthesisRequest(config, options)),
          requestOptions.debounce?.delay
        )
      })
    }

    return this.synthesisRequest(config, options)
  }

  /**
   * 获取数据处理类
   * @private
   */
  private getTransform() {
    const { transform } = this.options
    return transform
  }

  /**
   * 请求方法
   * @private
   */
  private async synthesisRequest<T = any>(
    config: InternalFetchRequestConfig,
    options?: RequestOptions
  ): Promise<T> {
    let conf: InternalFetchRequestConfig = cloneDeep(config)
    const transform = this.getTransform()

    const { requestOptions, headers } = this.options

    const opt: RequestOptions = { ...requestOptions, ...options }

    const {
      beforeRequestHook,
      requestCatchHook,
      transformRequestHook,
      requestInterceptors,
      responseInterceptors,
      responseInterceptorsCatch
    } = transform || {}

    conf.requestOptions = opt
    // 调用请求拦截器
    if (requestInterceptors && isFunction(requestInterceptors)) {
      conf = requestInterceptors(conf, this.options) as InternalFetchRequestConfig
    }

    if (beforeRequestHook && isFunction(beforeRequestHook)) {
      conf = beforeRequestHook(conf, opt) as InternalFetchRequestConfig
    }

    conf = this.supportFormData(conf)

    const notify = useThrottleFn((errorMessage) => {
      if (errorMessage) {
        NotifyPlugin('error', { title: '错误', content: errorMessage, closeBtn: true })
      }
    }, 1000)

    return new Promise<T>((resolve, reject) => {
      this.fetchCanceler.addPending(conf)
      // 发起请求
      fetch(conf.url, { headers, ...conf })
        .then(async (response) => {
          // 判断是否为 204 No Content
          if (response.status === 204) {
            // 204 没有内容，直接返回空值或处理成功状态
            resolve(null as unknown as T)
            return
          }
          const responseData: Result = await response.json()

          // 检查 HTTP 状态码
          if ((!response.ok && !Reflect.has(responseData, 'message')) || response.status === 401) {
            const errorMessage = getErrorMessage(response.status)
            notify(errorMessage)
            if (response.status !== 401) {
              throw new Error(errorMessage)
            } else {
              // 终止所有正在发起的请求
              this.fetchCanceler.removeAllPending()
            }
          }

          // 调用响应拦截器
          if (responseInterceptors && isFunction(responseInterceptors)) {
            response = await responseInterceptors(response)
          }

          if (transformRequestHook && isFunction(transformRequestHook)) {
            const ret = await transformRequestHook(
              { config: conf, response, responseData, notify },
              opt
            )
            resolve(ret)
            return
          }

          resolve(responseData as unknown as T)
        })
        .catch((e) => {
          // 捕获所有的错误，包括网络错误
          let errorMessage = ERROR_MESSAGES.unknownError // 默认未知错误

          if (e.name === 'AbortError') {
            errorMessage = `` // 请求被取消的错误
          } else if (e instanceof TypeError && e.message.includes('Failed to fetch')) {
            errorMessage = ERROR_MESSAGES.networkError // 处理服务器连接错误
          }

          // 调用请求错误拦截器
          if (responseInterceptorsCatch && isFunction(responseInterceptorsCatch)) {
            responseInterceptorsCatch(e)
          }

          if (requestCatchHook && isFunction(requestCatchHook)) {
            reject(requestCatchHook(e, opt))
            return
          }

          // 节流
          notify(errorMessage)
          reject(e)
        })
        .finally(() => {
          this.fetchCanceler.removePending(conf)
        })
    })
  }
}
