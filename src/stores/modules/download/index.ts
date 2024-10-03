import { open } from '@tauri-apps/plugin-dialog'
import Base from '@/models/File/Base.ts'

export const useDownloadStore = defineStore(
  'download-store',
  () => {
    const savePath = ref('')
    // 下载队列
    const downloadQueue = ref([])
    const maxDownloadConcurrence = ref(3)
    const activeDownloadCount = ref(0)

    const setSavePath = async () => {
      const path = await open({
        directory: true
      })
      if (path) savePath.value = path
    }

    const appendDownloadTask = (file: Base) => {
      downloadQueue.value.push(file)
      eventDownload()
    }

    const eventDownload = async () => {
      if (!(activeDownloadCount.value < maxDownloadConcurrence.value && downloadQueue.length > 0)) return
      const file = downloadQueue.value.shift()
      console.log(file)
    }

    return {
      savePath,
      downloadQueue,
      maxDownloadConcurrence,

      setSavePath,
      appendDownloadTask
    }
  },
  {
    persist: [
      {
        paths: ['savePath'],
        storage: sessionStorage
      }
    ]
  }
)
