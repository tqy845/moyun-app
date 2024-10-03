import { FileRawModel } from '@/api/models/fileModel'

export interface QueryDirectoryModel {
  page: number
  size: number
}


export interface AsideMenuModel {
  name:string
  children: Array<FileRawModel>
}
