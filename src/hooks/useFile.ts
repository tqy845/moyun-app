import { useDownloadStore, usePathStore } from '@/stores'
import {
  getChunkDownloadUrl,
  getChunkPostUrl,
  postBuildDownloadTask,
  postBuildUploadTask,
  postMergeChunks
} from '@/api/file'
import type { UploadFile } from '@/constants'
import Base from '@/models/File/Base'
import { request } from '@/utils/request'
import MYFile from '@/models/File/File'
import { exists } from '@tauri-apps/plugin-fs'
import { DialogPlugin } from 'tdesign-vue-next'
import { FetchResponse } from '@/utils/request/utils'
import { invoke } from '@tauri-apps/api/core'

const CHUNK_SIZE = 5 * 1024 * 1024

export type UseFileType = ReturnType<typeof useFile>

function useFile() {
  const { children } = usePathStore()

  const _getChunkName = (hash: string, index: number) => {
    return `chunk-${hash}-${index}.moyun`
  }

  const calculateSHA256WithWorkers = async (
    uploadFile: UploadFile,
    progress: (value: number) => void,
    numWorkers = 3,
    maxConcurrentReads = 3
  ) => {
    const file = uploadFile.raw
    const chunks = Math.ceil(file.size / CHUNK_SIZE)
    const workers: Worker[] = []
    const results = new Array(chunks)
    const workerScriptUrl = new URL('@/workers/sha256.js', import.meta.url)
    let activeReads = 0
    let count = 0
    let _resolve: (value: string) => void
    let uploadAborted = false // 标志位：是否中断上传
    const abort = () => {
      // 中断上传任务
      uploadAborted = true
      workers.forEach((worker) => worker.terminate()) // 中断所有子线程
    }

    const mergeSHA256 = () => {
      // 关闭所有Worker
      workers.forEach((worker) => worker.terminate())

      // 合并所有分片的哈希值
      const combinedHash = new Uint8Array(32)
      for (const hashArray of results) {
        if (hashArray) {
          for (let j = 0; j < combinedHash.length; j++) {
            combinedHash[j] = (combinedHash[j] + hashArray[j]) % 256
          }
        }
      }

      // 转换为十六进制字符串
      return Array.from(combinedHash)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('')
    }

    const processChunk = async (index: number) => {
      if (uploadAborted) return // 如果上传中断，直接返回
      if (index >= chunks) return
      const start = index * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, file.size)
      const chunk = file.slice(start, end)

      const worker = workers[index % numWorkers]
      try {
        worker.onmessage = function (event) {
          if (uploadAborted) return // 如果上传中断，直接返回
          const { hashBuffer, error, index } = event.data
          if (error) {
            console.error(`计算分片出错 ${index}: ${error}`)
            // Retry or handle the error
          } else {
            results[index] = new Uint8Array(hashBuffer)
            count++
            progress(parseInt(((count / chunks) * 100).toFixed(2), 10))
            activeReads--
            if (count >= chunks && !uploadAborted) {
              _resolve(mergeSHA256())
            } else if (activeReads < maxConcurrentReads && !uploadAborted) {
              processChunk(count + activeReads) // 执行下一个任务
            }
          }
        }
        worker.postMessage({ chunk, index })
      } catch (e) {
        console.error('Worker error:', e)
      }
    }

    const event = new Promise<string>((resolve) => {
      // 创建Worker线程
      for (let i = 0; i < numWorkers; i++) {
        workers.push(new Worker(workerScriptUrl))
      }

      // 初始化处理
      for (let i = 0; i < maxConcurrentReads; i++) {
        processChunk(i)
        activeReads++
      }

      _resolve = resolve
    })

    return {
      abort,
      event
    }
  }

  /**
   * 上传文件预检查
   */
  const uploadPreCheck = async (
    file: File,
    sha256: string,
    parentId: number = children.peek()!.id
  ) => {
    return await postBuildUploadTask({
      chunkSize: CHUNK_SIZE,
      fileSize: file.size,
      filename: file.name,
      hash: sha256,
      parentId: parentId,
      totalChunks: Math.ceil(file.size / CHUNK_SIZE)
    })
  }

  /** */
  const upload = async (
    uploadFile: UploadFile,
    sha256: string,
    progress: (value: number) => void,
    maxConcurrentUploads: number = 4 // 最大并发上传数
  ) => {
    const workerScriptUrl = new URL('@/workers/upload.js', import.meta.url)
    const file = uploadFile.raw!
    const chunks = Math.ceil(file.size / CHUNK_SIZE)
    const results = new Array(chunks).fill(false) // 初始化结果数组
    const workers: Worker[] = []
    let activeUploads = 0
    let count = 0
    let uploadAborted = false // 标志位：是否中断上传
    const abort = () => {
      // 中断上传任务
      uploadAborted = true
      // 中断所有上传请求
      request.fetchCanceler.removePendingByKey(sha256)
      // request.fetchCanceler.removePendingByKey(`moyun-bucket`)
      workers.forEach((worker) => worker.terminate()) // 中断所有子线程
    }
    const uploadedFn = (index: number) => {
      activeUploads--
      results[index] = true
      const percent = ((results.filter(Boolean).length / chunks) * 100).toFixed(2)
      progress(parseInt(percent, 10))
    }

    const processChunk = async (worker: Worker) => {
      if (uploadAborted) return // 如果上传中断，直接返回
      if (count >= chunks) return // 确保不超过总分片数

      if (activeUploads >= maxConcurrentUploads) return // 控制最大并发上传数
      activeUploads++ // 上传任务开始时增加计数

      const index = count // 获取当前索引
      count++ // 先获取后递增，避免多个分片争抢同一索引

      const start = index * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, file.size)
      const chunk = file.slice(start, end)

      const chunkName = _getChunkName(sha256, index + 1)

      if (uploadFile.uploadedChunks?.includes(chunkName)) {
        uploadedFn(index)
        return processChunk(worker) // 递归处理下一个分片
      }

      const { url, formData } = await getChunkPostUrl({
        chunkName,
        hash: sha256
      })
      const _formData = new FormData()
      for (const key in formData) {
        if (Object.hasOwn(formData, key)) {
          _formData.append(key, formData[key])
        }
      }
      _formData.append('file', chunk, chunkName)
      worker.postMessage({ chunk, chunkName, url, formData, index })
    }

    const event = new Promise((resolve, reject) => {
      for (let i = 0; i < maxConcurrentUploads; i++) {
        if (i >= chunks) return
        const worker = new Worker(workerScriptUrl, {
          type: 'module'
        })
        workers.push(worker)

        worker.onmessage = async (event) => {
          if (uploadAborted) return // 如果上传中断，直接返回

          const { success, error, index } = event.data

          if (success) {
            // 上传分片成功，更新进度
            uploadedFn(index)
          } else {
            activeUploads--
            abort()
            console.error(`上传分片失败 ${index + 1}`, error)
            reject(`上传分片失败 ${index + 1}: ${error}`)
            return
          }

          // 如果还有剩余的分片，继续处理下一个分片
          if (count < chunks && !uploadAborted) {
            await processChunk(worker)
          } else if (activeUploads === 0 && !uploadAborted) {
            // 如果所有上传完成
            workers.forEach((w) => w.terminate()) // 终止所有 Worker
            if (results.every((res) => res === true)) {
              // 合并分片
              try {
                const { file } = await postMergeChunks(sha256)
                resolve(file)
              } catch (mergeError) {
                reject(`合并分片失败: ${mergeError}`)
              }
            } else {
              reject('未能上传所有分片')
            }
          }
        }

        // 初始化启动 Worker 上传第一个分片
        processChunk(worker)
      }
    })

    return {
      abort,
      event
    }
  }

  const downloadPreCheck = async (file: MYFile) => {
    const { setSavePath } = useDownloadStore()
    const { savePath } = storeToRefs(useDownloadStore())
    if (!savePath.value) {
      await setSavePath()
    }
    if (!savePath.value) {
      throw new Error('请先设置下载路径')
    }
    const filePath = `${savePath.value}/${file.name}`
    const exist = await exists(filePath)

    const _buildTask = async () => {
      const { currentDir } = usePathStore()
      // 置空
      // await writeFile(filePath, new Uint8Array(0))
      await invoke(`create_sparse_file`, { path: filePath, totalSize: file.size })
      return postBuildDownloadTask({
        filename: file.name,
        hash: file.hash,
        parentId: currentDir.id
      })
    }

    return new Promise<FetchResponse<any>>((resolve, reject) => {
      if (exist) {
        const confirmDia = DialogPlugin.confirm({
          header: '重复提示',
          body: `注意：文件【${file.name}】已存在，要继续下载吗？`,
          confirmBtn: '重新下载',
          cancelBtn: '不了',
          onConfirm: () => {
            confirmDia.destroy()
            resolve(_buildTask())
          },
          onClose: () => {
            confirmDia.hide()
            reject({ fail: 1, message: 'cancel' } as FetchResponse<any>)
          }
        })
      } else {
        resolve(_buildTask())
      }
    })
  }

  const download = async (
    file: Base,
    chunkTotal: number,
    progressFn: (value: number) => void,
    maxWorkers: number = 6
  ) => {
    const workerPool: Worker[] = []
    const { savePath } = useDownloadStore()
    const workerScriptUrl = new URL('@/workers/download.js', import.meta.url)
    const activeDownloads: Array<Promise<void>> = []
    const writeFiles: Array<Promise<void>> = []
    let chunkCount = 1
    let downloadedChunkNumber = 0

    // 下载分片的逻辑
    const downloadChunk = async (index: number, worker: Worker) => {
      const chunkName = _getChunkName(file.hash, index)
      const { url } = await getChunkDownloadUrl({ filename: file.name, hash: chunkName })

      return new Promise<void>((resolve, reject) => {
        worker.postMessage({ url, index })

        worker.onmessage = (event) => {
          const { type, data, index: chunkIndex } = event.data
          if (type === 'complete') {
            // 使用 requestAnimationFrame 更新进度
            const updateProgress = () => {
              progressFn((++downloadedChunkNumber / chunkTotal) * 100)
            }
            requestAnimationFrame(updateProgress)
            const filePath = `${savePath}/${file.name}`
            const offset = (chunkIndex - 1) * CHUNK_SIZE

            // 将数据写入文件
            writeFiles.push(invoke(`write_at_offset`, { filePath, offset, data }))

            // 继续分配新任务
            if (chunkCount <= chunkTotal) {
              resolve(downloadChunk(chunkCount++, worker))
            } else {
              resolve()
            }
          }
        }

        worker.onerror = (error) => {
          console.error(`Worker error for chunk ${index}:`, error)
          reject(error)
        }
      })
    }

    // 分配任务给worker
    const assignWorkerTasks = () => {
      for (let i = 0; i < maxWorkers && chunkCount <= chunkTotal; i++) {
        const worker = new Worker(workerScriptUrl, { type: 'module' })
        workerPool.push(worker)
        activeDownloads.push(downloadChunk(chunkCount++, worker))
      }
    }

    // 开始下载并处理进度
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<void>(async (resolve, reject) => {
      try {
        assignWorkerTasks()
        // 等待所有下载完成
        await Promise.all(activeDownloads)
        await Promise.all(writeFiles)
        console.log('Download completed successfully.')
        workerPool.forEach((worker) => worker.terminate())
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  return {
    calculateSHA256WithWorkers,
    uploadPreCheck,
    upload,
    downloadPreCheck,
    download
  }
}

export default useFile
