import Folder from '@/models/File/Folder'
import File from '@/models/File/File'
import { FileExtensionEnum } from '@/constants'
import { fileUtils } from '@/utils/functions'

export const useFileMapStore = defineStore(
  `fileMapStore`,
  () => {
    // 用于快速索引文件
    const fileHashMap = ref<{ [key: string]: Folder | File }>({})

    const addItem = (...files: Array<Folder | File>) => {
      files.forEach((file) => (fileHashMap.value[`${file.__prototype__.type}-${file.id}`] = file))
    }

    const getItemById = (folderId: number, fileType: FileExtensionEnum = FileExtensionEnum.FILE) => {
      return fileHashMap.value[`${fileType}-${folderId}`]
    }

    const deleteItemById = (id: number, fileType: FileExtensionEnum = FileExtensionEnum.FILE) => {
      delete fileHashMap.value[`${fileType}-${id}`]
    }

    const clearAll = () => {
      fileHashMap.value = {}
    }

    return {
      fileHashMap,
      addItem,
      getItemById,
      deleteItemById,
      clearAll
    }
  },
  {
    persist: [
      {
        debug: true,
        storage: sessionStorage,
        paths: ['fileHashMap'],
        afterRestore: (ctx) => {
          // 恢复 fileHashMap
          for (const key in ctx.store.fileHashMap) {
            ctx.store.fileHashMap[key] = fileUtils.newFileObject(ctx.store.fileHashMap[key])
          }
        }
      }
    ]
  }
)
