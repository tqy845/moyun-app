import isString from 'lodash/isString'
import merge from 'lodash/merge'

import { ContentTypeEnum } from '@/constants'
import { useUserStore } from '@/stores'

import { VFetch } from './VFetch'
import type { CreateFetchOptions, FetchTransform } from './FetchTransform'
import { formatRequestDate, joinTimestamp, setObjToUrlParams } from './utils'

const host = import.meta.env.VITE_APP_BASE_API
const successStyle = 'background: #2ba471;color:white; font-weight: bold;padding:2px'
const errorStyle = 'background: #d54941;color:white; font-weight: bold;padding:2px'

// 数据处理，方便区分多种处理方式
const transform: FetchTransform = {
  // 处理请求数据。如果数据不是预期格式，可直接抛出错误
  transformRequestHook: async ({ config, response, responseData, notify }, options) => {
    const { isTransformResponse, isReturnNativeResponse } = options

    // 是否返回原生响应头 比如：需要获取响应头时使用该属性
    if (isReturnNativeResponse) {
      return response
    }

    // 如果204无内容直接返回
    const method = config.method?.toLowerCase()
    if (response.status === 204 && ['post', 'put', 'patch', 'delete'].includes(method)) {
      return response
    }

    // 判断请求是否成功
    if (responseData && responseData.fail === 0) {
      console.info('%cResponse', successStyle, responseData)
    } else {
      if (![401].includes(response.status)) {
        notify(responseData.message)
      }
      console.info('%cResponse', errorStyle, responseData)
    }

    // 不进行任何处理，直接返回
    // 用于页面代码可能需要直接获取code，data，message这些信息时开启
    if (!isTransformResponse) {
      return responseData
    }

    // 这里逻辑可以根据项目进行修改
    const hasSuccess = responseData && responseData.fail === 0
    if (hasSuccess) {
      return responseData.data
    }
  },

  // 请求前处理配置
  beforeRequestHook: (config, options) => {
    const {
      apiUrl,
      isJoinPrefix,
      urlPrefix,
      joinParamsToUrl,
      formatDate,
      joinTime = true
    } = options

    // 添加接口前缀
    if (isJoinPrefix && urlPrefix && isString(urlPrefix)) {
      config.url = `${urlPrefix}${config.url}`
    }

    // 将baseUrl拼接
    if (apiUrl && isString(apiUrl)) {
      config.url = `${apiUrl}${config.url}`
    }
    const params = config.params || {}
    const body = config.body || false

    if (formatDate && body && !isString(body)) {
      formatRequestDate(body)
    }
    if (config.method?.toUpperCase() === 'GET') {
      if (!isString(params)) {
        // 给 get 请求加上时间戳参数，避免从缓存中拿数据。
        config.params = Object.assign(params || {}, joinTimestamp(joinTime, false))
        config.url = `${config.url + `?` + new URLSearchParams(params)}`
      } else {
        // 兼容restful风格
        config.url = `${config.url + params}${joinTimestamp(joinTime, true)}`
        config.params = undefined
      }
    } else if (!isString(params)) {
      if (formatDate) {
        formatRequestDate(params)
      }
      if (
        Reflect.has(config, 'body') &&
        config.body &&
        (Object.keys(config.body).length > 0 || body instanceof FormData)
      ) {
        config.body = body
        config.params = params
      } else {
        // 非GET请求如果没有提供body，则将params视为body
        config.body = params
        config.params = undefined
      }
      if (joinParamsToUrl) {
        config.url = setObjToUrlParams(config.url as string, { ...config.params, ...config.body })
      }
    } else {
      // 兼容restful风格
      config.url += params
      config.params = undefined
    }
    return config
  },

  // 请求拦截器处理
  requestInterceptors: (config, options) => {
    // 请求之前处理config
    const userStore = useUserStore()
    const { token } = userStore

    if (token && config.requestOptions.withToken !== false) {
      // jwt token
      config.headers.Authorization = options.authenticationScheme
        ? `${options.authenticationScheme} ${token}`
        : token
    }
    return config
  },

  //响应拦截器处理
  responseInterceptors: async (res): Promise<Response> => {
    return res
  },

  // 响应错误处理
  responseInterceptorsCatch: async (error: any) => {
    const { config } = error
    if (!config || !config.requestOptions.retry) return Promise.reject(error)

    config.retryCount = config.retryCount || 0

    if (config.retryCount >= config.requestOptions.retry.count) return Promise.reject(error)

    config.retryCount += 1

    const backoff = new Promise((resolve) => {
      setTimeout(() => {
        resolve(config)
      }, config.requestOptions.retry.delay || 1)
    })
    config.headers = { ...config.headers, 'Content-Type': ContentTypeEnum.Json }
    // @ts-ignore
    return backoff.then((config) => fetchRequest(config, config.requestOptions))
  }
}

async function fetchRequest(config: RequestInit & { url: string }) {
  return await fetch(config.url, config)
}

function createFetch(opt?: Partial<CreateFetchOptions>) {
  return new VFetch(
    merge(
      <CreateFetchOptions>{
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes
        // 例如: authenticationScheme: 'Bearer'
        authenticationScheme: 'Bearer',
        // 超时
        timeout: 10 * 1000,
        // 携带Cookie
        credentials: 'include',
        // 头信息
        headers: { 'Content-Type': ContentTypeEnum?.Json || `application/json;charset=UTF-8` },
        // 数据处理方式
        transform,
        // 配置项，下面的选项都可以在独立的接口请求中覆盖
        requestOptions: {
          // 接口地址
          apiUrl: host,
          // 是否自动添加接口前缀
          isJoinPrefix: true,
          // 接口前缀
          // 例如: https://www.baidu.com/api
          // urlPrefix: import.meta.env.VITE_API_URL_PREFIX,
          urlPrefix: import.meta.env.VITE_API_URL_PREFIX,
          // 是否返回原生响应头 比如：需要获取响应头时使用该属性
          isReturnNativeResponse: false,
          // 需要对返回数据进行处理
          isTransformResponse: true,
          // post请求的时候添加参数到url
          joinParamsToUrl: false,
          // 格式化提交参数时间
          formatDate: true,
          // 是否加入时间戳
          joinTime: true,
          // 是否忽略请求取消令牌
          // 如果启用，则重复请求时不进行处理
          // 如果禁用，则重复请求时会取消当前请求
          ignoreCancelToken: true,
          // 是否携带 token
          withToken: true,
          // 重试
          retry: {
            count: 3,
            delay: 1000
          },
          // 是否为白名单请求
          whileList: false
        }
      },
      opt || {}
    )
  )
}

export const request = createFetch()
