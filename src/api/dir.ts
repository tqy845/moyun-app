import { request } from '@/utils/request'
import { FileRawModel } from '@/api/models/fileModel'
import { QueryDirectoryModel, AsideMenuModel, FolderCopyOptionModel } from '@/api/models/dirModel'
import { FetchResponse } from '@/utils/request/utils'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { useUserStore } from '@/stores'

const BASE_URL = import.meta.env.VITE_APP_BASE_API

const Api = {
  NewFolder: (parentId: number) => `/dir/${parentId}`,
  AsideMenu: `/dir/menu/aside/list`,
  GetPathJump: (folderId: number) => `/dir/${folderId}/jump`,
  PutFixedQuickFolder: (folderId: number) => `/dir/${folderId}/folder/fixed/quick`,
  RenameFolderName: (folderId: number) => `/dir/${folderId}/folder/name`,
  CopyFolder: (folderId: number) => `${BASE_URL}/dir/${folderId}/folder/copy`,
  CutFolder: (folderId: number) => `/dir/${folderId}/folder/cut`,
  RemoveFolder: (folderId: number) => `/dir/${folderId}/folder`,
  Remove: (folderId: number) => `/dir/${folderId}`,
  GetFileList: (folderId: number) => `/dir/${folderId}`,
  GetDirList: (folderId: number) => `/dir/${folderId}/list`,
  GetPhotoList: (folderId: number) => `/dir/photo/${folderId}/list`,
  SearchFolder: (folderId: number, keyword: string) =>
      `${BASE_URL}/dir/${folderId}/search?keyword=${keyword}`,
}

const EventSources = new WeakMap<any, EventSource>()

export function getAsideMenu() {
  return request.get<{ menus: Array<AsideMenuModel> }>(Api.AsideMenu)
}

export const getFileList = (dirId: number, params: QueryDirectoryModel) => {
  return request.get<{ files: FileRawModel[] }>(
    Api.GetFileList(dirId),
    {
      params
    },
    {
      whileList: true
    }
  )
}

export const getPhotoList = (dirId: number, params: QueryDirectoryModel) => {
  return request.get<{ files: FileRawModel[] }>(Api.GetPhotoList(dirId), {
    params
  })
}

export const getDirList = (dirId: number, params: QueryDirectoryModel) => {
  return request.get<{ files: FileRawModel[] }>(Api.GetDirList(dirId), {
    params
  })
}

export const sseCopyFolder = (
  folderId: number,
  options: FolderCopyOptionModel,
  callback: (data: any) => void
) => {
  // 注销上一个事件
  EventSources.get(callback)?.close()
  // 注册新事件
  return new Promise<FetchResponse<{ files: Array<FileRawModel> }>>((resolve, reject) => {
    const userStore = useUserStore()
    const querys = new URLSearchParams(options as unknown as Record<string, any>).toString()
    const connect = new EventSourcePolyfill(Api.CopyFolder(folderId).concat(`?${querys}`), {
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    })
    // 缓存事件
    EventSources.set(callback, connect)
    connect.addEventListener(`start`, (event) => {
      const { data } = event as MessageEvent
      const result = JSON.parse(data) as FetchResponse<{ progress: number }>
      console.log('start成功', result.data)
      callback?.({
        type: 'start',
        data: result.data!
      })
    })
    connect.addEventListener(`progress`, (event) => {
      const { data } = event as MessageEvent
      const result = JSON.parse(data) as FetchResponse<{ progress: number }>
      console.log('progress成功', result.data)
      callback?.({
        type: 'progress',
        data: result.data!
      })
    })
    connect.addEventListener(`complete`, (event) => {
      const { data } = event as MessageEvent
      const result = JSON.parse(data) as FetchResponse<{ files: Array<FileRawModel> }>
      connect?.close()
      resolve(result)
    })
    connect.addEventListener(`error`, (event) => {
      const { data } = event as MessageEvent
      const result = JSON.parse(data) as FetchResponse<{ files: Array<FileRawModel> }>
      connect?.close()
      reject(result)
    })
  })
}

export const postCutFolder = (folderId: number, targetDirId: number) => {
  return request.post<FetchResponse<any>>(
    Api.CutFolder(folderId),
    {
      body: {
        targetDirId
      }
    },
    {
      isTransformResponse: false
    }
  )
}

export const putFixedQuickFolder = (folderId: number, isFixed: boolean = true) => {
  return request.put<FetchResponse<{ flag: string }>>(
    Api.PutFixedQuickFolder(folderId),
    {
      body: {
        isFixed
      }
    },
    {
      isTransformResponse: false
    }
  )
}

export const sseSearchFolder = (
  folderId: number,
  keyword: string,
  callback: (data: { files: Array<FileRawModel> }) => void
) => {
  // 注销上一个事件
  EventSources.get(callback)?.close()
  // 注册新事件
  return new Promise<FetchResponse<{ files: Array<FileRawModel> }>>((resolve, reject) => {
    const userStore = useUserStore()
    const connect = new EventSourcePolyfill(Api.SearchFolder(folderId, keyword), {
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    })
    // 缓存事件
    EventSources.set(callback, connect)
    // 文件搜索
    connect.addEventListener(`content`, (event) => {
      const { data } = event as MessageEvent
      const result = JSON.parse(data) as FetchResponse<{ files: Array<FileRawModel> }>
      console.log('成功', result)
      callback?.(result.data!)
    })
    // 完成
    connect.addEventListener(`complete`, (event) => {
      const { data } = event as MessageEvent
      const result = JSON.parse(data) as FetchResponse<{ files: Array<FileRawModel> }>
      connect?.close()
      resolve(result)
    })
    // 失败
    connect.addEventListener(`error`, (event) => {
      const { data } = event as MessageEvent
      const result = JSON.parse(data) as FetchResponse<{ files: Array<FileRawModel> }>
      connect?.close()
      reject(result)
    })
  })
}

export const getPathJump = (folderId: number, path: string) => {
  return request.get<{ dirs: Array<FileRawModel> }>(Api.GetPathJump(folderId), {
    params: { path }
  })
}

export const postNewFolder = (parentId: number) => {
  return request.post<{ file: FileRawModel }>(Api.NewFolder(parentId))
}

export const putRenameFolderName = (folderId: number, body: { name: string }) => {
  return request.put<FetchResponse<any>>(
    Api.RenameFolderName(folderId),
    {
      body
    },
    {
      isTransformResponse: false
    }
  )
}

export const putRemoveFolder = (folderId: number) => {
  return request.put<FetchResponse<any>>(
    Api.RemoveFolder(folderId),
    {},
    {
      isTransformResponse: false
    }
  )
}

export const getDustbinList = (dirId: number, params: QueryDirectoryModel) => {
  return request.get<{ files: Array<FileRawModel> }>(Api.GetFileList(dirId), {
    params
  })
}
