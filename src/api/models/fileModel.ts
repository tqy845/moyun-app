import { FileBuildTaskResult, FlagEnum } from '@/constants'

export interface FileMetadataModel {
  filename: string
  hash: string
  parentId: number
  fileSize: number
  totalChunks: number
  uploadedChunks?: Array<string>
  chunkSize: number
  preview?: string
}

export interface BuildFileDownModel {
  filename: string
  hash: string
  parentId: number
}

export interface FileChunkDownloadModel {
  filename: string
  hash: string
}

export interface BuildFileUploadResultModel {
  status: FileBuildTaskResult
  metadata: FileMetadataModel
  formData?: Record<string, string>
  thumbnailUrl?: string
}

export interface FileChunkModel {
  file: FormData
}

export interface FileChunkUploaded {
  chunkName: string
  hash: string
}

export interface FileRawModel {
  id: number
  parentId: number
  flag: FlagEnum
  name: string
  icon: string
  hash: string
  extension: string
  size?: number
  createdAt?: string
  updatedAt?: string
}

export interface FileGetUploadAddressModel {
  hash: string
  filename: string
  parentId: number
}

export interface DownloadURLModel {
  Scheme: string
  Opaque: string
  User: null
  Host: string
  Path: string
  RawPath: string
  OmitHost: boolean
  ForceQuery: boolean
  RawQuery: string
  Fragment: string
  RawFragment: string
}


export interface FileCopyOptionModel {
  newName: string
  targetDirId: number
}