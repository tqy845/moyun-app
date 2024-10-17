import { request } from '@/utils/request'
import { FileRawModel } from '@/api/models/fileModel'
import { QueryDirectoryModel, AsideMenuModel, FolderCopyOptionModel } from '@/api/models/dirModel'
import { FetchResponse } from '@/utils/request/utils'
import { EventSourcePolyfill } from "event-source-polyfill";
import { useUserStore } from '@/stores';


const BASE_URL = import.meta.env.VITE_APP_BASE_API

const Api = {
  NewFolder: (parentId: number) => `/dir/${parentId}`,
  AsideMenu: `/dir/menu/aside/list`,
  QuickById: (id: number) => `/dir/${id}/quick`,
  PutFixedQuickFolder: (folderId: number) => `/dir/${folderId}/folder/fixed/quick`,
  RenameFolderName: (folderId: number) => `/dir/${folderId}/folder/name`,
  CopyFolder: (folderId: number) => `/dir/${folderId}/folder/copy`,
  CutFolder: (folderId: number) => `/dir/${folderId}/folder/cut`,
  RemoveFolder: (folderId: number) => `/dir/${folderId}/folder`,
  Remove: (id: number) => `/dir/${id}`,
  GetById: (id: number) => `/dir/${id}`,
  GetFileList: (id: number) => `/dir/${id}`,
  GetDirList: (id: number) => `/dir/${id}/list`,
  GetPhotoList: (id: number) => `/dir/photo/${id}/list`,
  SearchFolder: (id: number, keyword: string) => `${BASE_URL}/dir/${id}/search?keyword=${keyword}`
}

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

export const postCopyFolder = (folderId: number, options: FolderCopyOptionModel) => {
  return request.post<FetchResponse<any>>(Api.CopyFolder(folderId), {
    body: options
  }, {
    isTransformResponse: false
  })
}

export const postCutFolder = (folderId: number, targetDirId: number) => {
  return request.post<FetchResponse<any>>(Api.CutFolder(folderId), {
    body: {
      targetDirId
    }
  }, {
    isTransformResponse: false
  })
}

export const putFixedQuickFolder = (folderId: number, isFixed: boolean = true) => {
  return request.put<FetchResponse<{ flag: string }>>(Api.PutFixedQuickFolder(folderId), {
    body: {
      isFixed
    }
  }, {
    isTransformResponse: false
  })
}


let searchFolderEventSource: EventSource | null = null
export const sseSearchFolder = (folderId: number, keyword: string, callback: (data: { files: Array<FileRawModel> }) => void) => {
  if (searchFolderEventSource) searchFolderEventSource.close()
  return new Promise<FetchResponse<{ files: Array<FileRawModel> }>>((resolve, reject) => {
    const userStore = useUserStore()
    searchFolderEventSource = new EventSourcePolyfill(Api.SearchFolder(folderId, keyword), {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    // 文件搜索
    searchFolderEventSource.addEventListener(`content`, (event) => {
      const { data } = event as MessageEvent
      const result = JSON.parse(data) as FetchResponse<{ files: Array<FileRawModel> }>
      console.log("成功", result);
      callback?.(result.data!)
    })
    // 完成
    searchFolderEventSource.addEventListener(`complete`, (event) => {
      const { data } = event as MessageEvent
      const result = JSON.parse(data) as FetchResponse<{ files: Array<FileRawModel> }>
      searchFolderEventSource?.close()
      resolve(result)
    })
    // 失败
    searchFolderEventSource.addEventListener(`error`, (event) => {
      const { data } = event as MessageEvent
      const result = JSON.parse(data) as FetchResponse<{ files: Array<FileRawModel> }>
      searchFolderEventSource?.close()
      reject(result)
    })
  })
}

export function getById<T>(id: number) {
  return request.get<T>(Api.GetById(id), {})
}

export function putQuickById<T>(id: number) {
  return request.get<T>(Api.QuickById(id), {})
}

export function postNewFolder(parentId: number) {
  return request.post<{ file: FileRawModel }>(Api.NewFolder(parentId))
}

export function putRenameFolderName(folderId: number, body: { name: string }) {
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

export function putRemoveFolder(folderId: number) {
  return request.put<FetchResponse<any>>(Api.RemoveFolder(folderId), {}, {
    isTransformResponse: false
  })
}
