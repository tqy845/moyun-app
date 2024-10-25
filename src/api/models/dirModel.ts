import { FileCopyOptionModel, FileRawModel } from '@/api/models/fileModel'

export interface QueryDirectoryModel {
  page: number
  size: number
  containDeleted?: boolean
  queryAllDeleted?: boolean
}

export interface AsideMenuModel {
  name: string
  children: Array<FileRawModel>
}

export interface FolderCopyOptionModel extends FileCopyOptionModel {}
