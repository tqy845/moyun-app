import { request } from '@/utils/request'
import MYFile from '@/models/File/File'
import {
  BuildFileDownModel,
  BuildFileUploadResultModel, FileChunkDownloadModel, FileChunkUploaded, FileCopyOptionModel, FileRawModel
} from './models/fileModel'
import Base from '@/models/File/Base'
import { FetchResponse } from '@/utils/request/utils.ts'

const Api = {
  PutUploadAddress: `/file/presigned/put`,
  PostUploadAddress: `/file/presigned/post`,
  Add: `/file`,
  Update: `/file`,
  Remove: `/file`,
  GetById: (id: number) => `/dir/${id}`,
  Search: (parentId: number, filename: string) => `/file/search/${parentId}/${filename}`,
  UploadChunks: ``,
  BuildUploadTask: `/file/upload/build`,
  GetChunkPutUrl: `/file/chunk/post`,
  UploadedChunk: `/file/chunk/uploaded`,
  UpdateMetadata: `/file/upload/metadata`,
  MergeChunks: `/file/chunk/merge`,
  GetFileChunks: (filename: string, parentId: number) => `/file/chunk/${parentId}/${filename}/list`,
  BuildDownloadTask: `/file/download/build`,
  GetChunkDownload: `/file/chunk/download`,
  PostPreviewUrl: `/file/preview`,
  RenameFileName: (fileId: number) => `/file/${fileId}/file/name`,
  RemoveFile: (fileId: number) => `/file/${fileId}/file`,
  CopyFile: (fileId: number) => `/file/${fileId}/file/copy`,
  CutFile: (fileId: number) => `/file/${fileId}/file/cut`,
}

export const getById = <T>(id: number) => {
  return request.get<T>(Api.GetById(id), {})
}

export const search = <T>(parentId: number, filename: string) => {
  return request.get<T>(Api.Search(parentId, filename), {})
}

export const postAdd = <T>(body: MYFile) => {
  return request.post<T>(Api.Add, {
    body
  })
}

export const putUpdate = <T>(body: MYFile) => {
  return request.put<T>(Api.Update, {
    body
  })
}

export const deleteRemove = <T>(id: number) => {
  return request.delete<T>(Api.Remove + `/${id}`, {})
}

export const postPutUploadAddress = <T>(body: any) => {
  return request.post<T>(Api.PutUploadAddress, {
    body
  })
}

export const postPostUploadAddress = <T>(body: any) => {
  return request.post<T>(Api.PostUploadAddress, {
    body
  })
}

export const postBuildUploadTask = (body: BuildFileUploadModel) => {
  return request.post<FetchResponse<BuildFileUploadResultModel>>(
    Api.BuildUploadTask,
    {
      body
    },
    {
      isTransformResponse: false
    }
  )
}

export const getChunkPostUrl = (params: any) => {
  return request.get<{
    url: string
    formData: Record<string, string>
  }>(Api.GetChunkPutUrl, {
    params
  })
}

export const postUploadChunk = (url: string, body: any) => {
  return request.post(
    '',
    {
      body
    },
    {
      apiUrl: url,
      withToken: false,
      isReturnNativeResponse: true
    }
  )
}

export const putUploadedChunk = (body: FileChunkUploaded) => {
  return request.put(
    Api.UploadedChunk,
    {
      body
    },
    {
      isTransformResponse: false
    }
  )
}

export const postMergeChunks = (hash: string) => {
  return request.post<{ file: FileRawModel }>(Api.MergeChunks, {
    body: {
      hash
    }
  })
}

export const getFileChunks = ({ name, parentId }: Base) => {
  return request.get(Api.GetFileChunks(name, parentId))
}

export const postBuildDownloadTask = (body: BuildFileDownModel) => {
  return request.post(
    Api.BuildDownloadTask,
    {
      body
    },
    {
      isTransformResponse: false
    }
  )
}

export const getChunkDownloadUrl = (params: FileChunkDownloadModel) => {
  return request.get<{ url: string }>(Api.GetChunkDownload, {
    params
  })
}

export const postPreviewUrl = (body: FileChunkDownloadModel) => {
  return request.post<{ url: string }>(Api.PostPreviewUrl, {
    body
  })
}

export const uploadThumbnail = (formData: FormData, url: string) => {
  return request.upload(
    formData,
    url,
    {},
    {
      isReturnNativeResponse: true,
      isTransformResponse: false,
      withToken: false,
      apiUrl: ''
    }
  )
}

export const uploadFileChunk = (formData: FormData, url: string) => {
  return request.upload(
    formData,
    url,
    {},
    {
      isReturnNativeResponse: true,
      isTransformResponse: false,
      withToken: false,
      apiUrl: ''
    }
  )
}

export const postCopyFile = (fileId: number, options: FileCopyOptionModel) => {
  return request.post<FetchResponse<any>>(Api.CopyFile(fileId), {
    body: options
  }, {
    isTransformResponse: false
  })
}

export const postCutFile = (fileId: number, targetDirId: number) => {
  return request.post<FetchResponse<any>>(Api.CutFile(fileId), {
    body: {
      targetDirId
    }
  }, {
    isTransformResponse: false
  })
}


export const putRenameFileName = (fileId: number, body: { name: string }) => {
  return request.put<FetchResponse<any>>(Api.RenameFileName(fileId), {
    body
  }, {
    isTransformResponse: false
  })
}

export const putRemoveFile = (fileId: number) => {
  return request.put<FetchResponse<any>>(Api.RemoveFile(fileId), {}, {
    isTransformResponse: false
  })
}
