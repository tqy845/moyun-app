import { request } from '@/utils/request'
import { FileRawModel } from '@/api/models/fileModel'
import { QueryDirectoryModel, AsideMenuModel, FolderCopyOptionModel } from '@/api/models/dirModel'
import { FetchResponse } from '@/utils/request/utils.ts'

const Api = {
  NewFolder: (parentId: number) => `/dir/${parentId}`,
  AsideMenu: `/dir/menu/aside/list`,
  QuickById: (id: number) => `/dir/${id}/quick`,
  RenameFolderName: (folderId: number) => `/dir/${folderId}/folder/name`,
  CopyFolder: (folderId: number) => `/dir/${folderId}/folder/copy`,
  CutFolder: (folderId: number) => `/dir/${folderId}/folder/cut`,
  RemoveFolder: (folderId: number) => `/dir/${folderId}/folder`,
  Remove: (id: number) => `/dir/${id}`,
  GetById: (id: number) => `/dir/${id}`,
  GetFileList: (id: number) => `/dir/${id}`,
  GetDirList: (id: number) => `/dir/${id}/list`,
  GetPhotoList: (id: number) => `/dir/photo/${id}/list`,
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
