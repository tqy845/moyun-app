import { request } from '@/utils/request'
import { FileRawModel } from '@/api/models/fileModel'
import { QueryDirectoryModel, AsideMenuModel } from '@/api/models/dirModel'

const Api = {
  NewFolder: (parentId: number) => `/dir/${parentId}`,
  AsideMenu: `/dir/menu/aside/list`,
  QuickById: (id: number) => `/dir/${id}/quick`,
  Update: `/dir`,
  Remove: (id: number) => `/dir/${id}`,
  GetById: (id: number) => `/dir/${id}`,
  GetFileList: (id: number) => `/dir/${id}`,
  GetDirList: (id: number) => `/dir/${id}/list`,
  GetPhotoList: (id: number) => `/dir/photo/${id}/list`
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

export function getById<T>(id: number) {
  return request.get<T>(Api.GetById(id), {})
}

export function putQuickById<T>(id: number) {
  return request.get<T>(Api.QuickById(id), {})
}

export function postNewFolder(parentId: number) {
  return request.post<{ file: FileRawModel }>(Api.NewFolder(parentId))
}

export function putUpdate<T>(body: File) {
  return request.put<T>(Api.Update, {
    body
  })
}

export function deleteRemove<T>(id: number) {
  return request.delete<T>(Api.Remove(id), {})
}
