import { FileBuildTaskResult, UploadFile } from '@/constants'
import useFile from '@/hooks/useFile'
import { usePathStore } from '@/stores'
import { uploadThumbnail } from '@/api/file'
import { fileUtils } from '@/utils/functions'

export const useUploadStore = defineStore(`upload-store`, () => {
  const maxConcurrentUploads = ref(3)
  const activeUploads = ref(0)
  const uploadQueue = ref<Array<{ file: UploadFile; index: number }>>([])
  const fileList = ref<Array<UploadFile>>([])
  const { calculateSHA256WithWorkers, uploadPreCheck, upload } = useFile()
  const { currentDir } = usePathStore()


  const _uploadThumbnail = (
    file: File,
    {
      thumbnailUrl,
      formData
    }: {
      thumbnailUrl: string
      formData: Record<string, string>
    }
  ) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        // 生成缩略图
        const ext = fileUtils.getExtName(file.name)
        const notExt = fileUtils.getNotExtName(file.name)
        const thumbnail = await fileUtils.generateThumbnail(file, ext)
        const blob = await fileUtils.dataURLtoBlob(thumbnail)

        const _formData = new FormData()
        for (const key in formData) {
          if (Object.hasOwn(formData, key)) {
            _formData.append(key, formData[key])
          }
        }
        _formData.append('file', blob, `${notExt}.webp`)

        // 上传缩略图
        await uploadThumbnail(_formData, thumbnailUrl)
        resolve(true)
      } catch (e) {
        console.error('Error uploading thumbnail:', e) // 打印错误信息
        reject(e) // 传递错误
      }
    })
  }

  const checkQueue = () => {
    while (activeUploads.value < maxConcurrentUploads.value && uploadQueue.value.length > 0) {
      const { file, index } = uploadQueue.value.shift()!
      eventUpload(file, index)
      activeUploads.value++
    }
  }
  const _nextQueueTask = () => {
    if (activeUploads.value) activeUploads.value--
    checkQueue()
  }

  const _scrollToUploadingFirstItem = () => {
    // 视图滚动到第一个正在处理的文件
    const el = document.querySelector(`[data-first-item="true"]`)
    el?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }

  const eventRemove = useThrottleFn((uploadFile: UploadFile) => {
    const fileIndex = fileList.value.findIndex((f) => f.id === uploadFile.id)
    if (fileIndex !== -1) {
      fileList.value.splice(fileIndex, 1)
    }
    const queueIndex = uploadQueue.value.findIndex((item) => item.file.id === uploadFile.id)
    if (queueIndex !== -1) {
      uploadQueue.value.splice(queueIndex, 1)
      _nextQueueTask()
    }
  }, 200)

  const eventPause = useThrottleFn((uploadFile: UploadFile) => {
    if (!['await', 'uploaded', 'error'].includes(uploadFile.status)) {
      const queueIndex = uploadQueue.value.findIndex((item) => item.file.id === uploadFile.id)
      if (queueIndex !== -1) {
        uploadQueue.value.splice(queueIndex, 1)
      }
      _nextQueueTask()
    }
    uploadFile.status = 'paused'
    uploadFile.abort?.()
  }, 200)

  const eventRetry = useThrottleFn((uploadFile: UploadFile) => {
    uploadFile.status = 'await'
    uploadFile.hashPercent = 0
    uploadQueue.value.push({ file: uploadFile, index: uploadFile.no - 1 })
    _nextQueueTask()
  }, 200)

  const eventContinue = useThrottleFn((uploadFile: UploadFile) => {
    uploadFile.status = 'await'
    uploadFile.hashPercent = 0
    uploadQueue.value.push({ file: uploadFile, index: uploadFile.no - 1 })
    checkQueue()
  }, 200)

  const eventAllPause = useThrottleFn(() => {
    const confirmDia = DialogPlugin({
      header: '确认暂停',
      body: '确认要暂停所有上传中的任务吗？',
      confirmBtn: '确认',
      cancelBtn: '不了',
      onConfirm: () => {
        // 初始化上传队列
        activeUploads.value = 0
        uploadQueue.value.length = 0
        fileList.value.forEach((MYFile) => {
          // 过滤所有未上传成功和已经上传成功的任务
          if (!['uploaded', 'error'].includes(MYFile.status)) {
            MYFile.status = 'paused'
            MYFile.abort?.()
          }
        })

        confirmDia.hide()
      },
      onClose: () => {
        confirmDia.hide()
      }
    })
  }, 200)

  // 恢复所有暂停的任务
  const eventAllContinue = useThrottleFn(() => {
    fileList.value.forEach((MYFile) => {
      if (MYFile.status === 'paused') {
        MYFile.status = 'await'
        MYFile.hashPercent = 0
        uploadQueue.value.push({ file: MYFile, index: MYFile.no - 1 })
      }
    })
    // 确保只在上传数未超出限制时才触发上传
    checkQueue()
  }, 200)

  const eventAllCancel = useThrottleFn(() => {
    const confirmDia = DialogPlugin({
      header: '确认取消',
      body: '确认要取消所有上传中的任务吗？',
      confirmBtn: '确认',
      cancelBtn: '不了',
      onConfirm: () => {
        // 停止所有上传并取消所有记录
        uploadQueue.value.length = 0
        fileList.value.forEach((MYFile) => {
          MYFile.abort?.()
        })
        fileList.value.length = 0
        activeUploads.value = 0
        confirmDia.hide()
      },
      onClose: () => {
        confirmDia.hide()
      }
    })
  }, 200)

  const eventCancel = useThrottleFn((uploadFile: UploadFile) => {
    uploadFile.abort?.()
    if (!['await', 'uploaded', 'error'].includes(uploadFile.status)) {
      // 上传中取消
      _nextQueueTask()
    }
    eventRemove(uploadFile)
  }, 200)

  const eventUpload = async (uploadFile: UploadFile, index: number) => {
    const file = uploadFile.raw
    const MYFile = fileList.value[index]
    try {
      // 计算 Hash
      MYFile.status = 'calcHash'
      const hashTask = await calculateSHA256WithWorkers(uploadFile, (progress: number) => {
        MYFile.hashPercent = progress
      })
      MYFile.abort = hashTask.abort
      const sha256 = await hashTask.event

      // 预请求构建一个文件上传任务
      const { fail, message, data } = await uploadPreCheck(file, sha256)
      if (fail) {
        new Error(message)
      }

      // 获取预请求结果，处理妙传/断点续传/新上传
      const { status, metadata, thumbnailUrl, formData } = data!

      if (status === FileBuildTaskResult.EXIST) {
        // 秒传
        MYFile.uploadPercent = 100
        MYFile.status = 'uploaded'
        return
      }

      if (status === FileBuildTaskResult.SUCCESS) {
        // 断点续传/新上传
        if (metadata) {
          // 断点续传：同步已上传的分片信息，上传自动跳过
          uploadFile.uploadedChunks = metadata.uploadedChunks
        }
        // 上传缩略图
        if (thumbnailUrl) {
          await _uploadThumbnail(file, {
            thumbnailUrl,
            formData: formData!
          })
        }
        MYFile.status = 'uploading'
      }

      // 上传文件
      const uploadTask = await upload(uploadFile, sha256, (progress: number) => {
        MYFile.uploadPercent = progress
      })

      // 上传中断控制器
      MYFile.abort = uploadTask.abort
      // 等待上传事件完成
      const fileRawModel = await uploadTask.event
      MYFile.status = 'uploaded'

      // 实例化元信息，添加到当前目录下
      await currentDir.appendFile(fileRawModel)
    } catch (e) {
      // 出错了
      MYFile.status = 'error'
      console.error(e)
    } finally {
      _nextQueueTask()
      _scrollToUploadingFirstItem()
    }
  }

  // 批量上传时，将文件添加到上传队列中
  const eventBatchUpload = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const fileExists = fileList.value.some(
        (f) => f.raw.name === file.name && f.raw.size === file.size
      )
      if (!fileExists) {
        const index = fileList.value.length
        const uploadFile: UploadFile = {
          raw: file,
          hashPercent: 0,
          uploadPercent: 0,
          status: 'await',
          uploadedChunks: [],
          no: index + 1,
          id: Date.now()
        }
        fileList.value.push(uploadFile)
        uploadQueue.value.push({ file: uploadFile, index })
      }
    })
    checkQueue()
  }

  const uploadedList = computed(() =>
    fileList.value.filter((file) => file.status === 'uploaded').sort((a, b) => b.no + a.no)
  )
  const unUploadList = computed(() =>
    fileList.value.filter((file) => file.status !== 'uploaded').sort((a, b) => b.no + a.no)
  )

  return {
    fileList,
    uploadQueue,
    activeUploads,
    maxConcurrentUploads,
    uploadedList,
    unUploadList,

    eventBatchUpload,

    checkQueue,
    eventUpload,
    eventContinue,
    eventPause,
    eventRemove,
    eventCancel,
    eventRetry,

    eventAllPause,
    eventAllContinue,
    eventAllCancel
  }
})
