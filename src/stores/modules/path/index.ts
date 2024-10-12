import { FileExtensionEnum, SortModeEnum, SortTypeEnum } from '@/constants'
import Dir from '@/models/File/Dir'
import Folder from '@/models/File/Folder'
import File from '@/models/File/File'
import { fileUtils } from '@/utils/functions'
import { useDirStore, useFileMapStore, useSettingStore } from '@/stores'
import Base from '@/models/File/Base.ts'
import { cloneDeep } from 'lodash'
import { postCopyFile, postCutFile } from '@/api/file'
import { postCopyFolder, postCutFolder } from '@/api/dir'

export type AggregateFile = (File & any) | (Folder & any)

export const usePathStore = defineStore(
  'path-store',
  () => {
    const children = ref<Array<Dir & any>>([])
    const currentDir = computed(() => children.value.peek())
    const historyChildren = ref<Array<number>>([]) // 装入目录的ID
    const isLoading = ref(false)
    const currentDirFiles = ref<Array<AggregateFile>>([])
    const currentDirSelectedFiles = ref<Array<AggregateFile>>([])
    const currentActionFiles = ref<Array<AggregateFile>>([])
    const { isBaseLayout } = storeToRefs(useDirStore())
    const { readPhotoAlbum } = useDirStore()
    const { fileSortMode, fileSortType } = storeToRefs(useSettingStore())
    const { getItemById } = useFileMapStore()

    const isSelected = (file: File | Folder) => {
      return currentDirSelectedFiles.value.includes(file)
    }
    const clearSelected = () => {
      currentDirSelectedFiles.value.length = 0
    }
    const addSelected = (...file: Array<File | Folder>) => {
      currentDirSelectedFiles.value.push(...file)
    }
    const removeCurrentDirFile = (fileRaw: Base) => {
      removeSelected(fileRaw)
      const index = currentDirFiles.value.findIndex((_file) => _file.hash === fileRaw.hash)
      if (index !== -1) {
        currentDirFiles.value.splice(index, 1)
      }
    }
    const removeSelected = (fileRaw: Base) => {
      const index = currentDirSelectedFiles.value.findIndex((_file: File | Folder) => !(fileRaw.hash === _file.hash))
      if (index !== -1) {
        currentDirSelectedFiles.value.splice(index, 1)
      }
    }
    const allSelected = () => {
      clearSelected()
      addSelected(...currentDirFiles.value)
    }
    const reverseSelected = () => {
      const existList = [...currentDirSelectedFiles.value]
      clearSelected()
      currentDirFiles.value.forEach((file) => {
        if (!existList.includes(file)) {
          addSelected(file)
        }
      })
    }
    const back = () => {
      // 获取当前系统路径IDS
      const ids = children.value.map((dir) => dir.id)
      // 弹出系统路径栈中弹出最后一个目录
      children.value.pop()
      // 将原来的IDS装入历史路径栈中
      historyChildren.value.push(...ids)
    }

    const forward = () => {
      // 弹出历史路径栈的最后一个目录ID，重新装入系统路径栈中
      const peekDirArray = historyChildren
      // 重新实例化目录ID列表
      const peekDirList = peekDirArray.value.map(
        (dirId) => new Dir(getItemById(dirId, FileExtensionEnum.FOLDER) as Folder)
      )
      // 重新装入系统路径栈
      children.value.length = 0
      children.value.push(...peekDirList)
      // 清空历史路径
      peekDirArray.value.length = 0
    }

    /**
     *  排序
     * 
     * @param type - 排序类型，默认为文件夹在前
     * @param mode - 排序模式，默认为升序
     */
    const sort = (
      type: SortTypeEnum = fileSortType.value,
      mode: SortModeEnum = fileSortMode.value
    ) => {
      currentDirFiles.value.sort(fileUtils.compareByAttr(type, mode))
      fileSortType.value = type
      fileSortMode.value = mode
    }

    /**
     * 粘贴文件
     */
    const paste = async () => {
      console.log(currentActionFiles.value);
      for (let i = 0; i < currentActionFiles.value.length; i++) {
        const file = currentActionFiles.value[i]
        const newFile = cloneDeep(file)
        const oldFile = currentDirFiles.value.find(_file => _file.name === file.name && _file.__prototype__.type === file.__prototype__.type)
        if (file.isCutting) {
          file.isCutting = false
          if (oldFile) {
            const confirmDia = DialogPlugin({
              header: '源文件名和目标文件名相同',
              body: `文件名：${file.name}\n\n项目类型：${file.extension}\n${file.size}`,
              confirmBtn: '确认',
              cancelBtn: null,
              onConfirm: () => {
                confirmDia.hide()
              },
            })
            continue
          }
          const fn = file.isFolder ? postCutFolder : postCutFile
          fn(file.id, currentDir.value.id)
        }
        if (file.isCopying) {
          // file.isCopying = false
          const targetDirId = currentDir.value.id
          // 在当前目录下是否存在同名文件
          if (oldFile) {
            const baseName = `${newFile.notExtName} - 副本`;
            // xxx - 副本，xxx - 副本(2)，xxx - 副本(3) ...
            newFile.name = fileUtils.generateNewName(baseName, newFile)
            newFile.parentId = targetDirId
          }
          const fn = file.isFolder ? postCopyFolder : postCopyFile
          const { fail, data } = await fn(file.id, {
            newName: newFile.name,
            targetDirId,
          })
          if (!fail) {
            newFile.id = data.id
          }
        }
        currentDirFiles.value.push(newFile)
      }
    }

    // 监听 path.children 的变化并触发异步加载当前目录下的文件
    watch(
      () => children.value.peek(),
      async (newTop) => {
        if (isBaseLayout.value) {
          // 普通目录，加载目录文件
          await newTop?.readDir()
        } else {
          // 图库
          await readPhotoAlbum()
        }
        // 取消原选中文件/文件夹
        currentDirSelectedFiles.value.length = 0
      }
    )

    return {
      children,
      historyChildren,
      isLoading,
      currentDir,
      currentDirFiles,
      currentDirSelectedFiles,
      currentActionFiles,

      isSelected,
      clearSelected,
      addSelected,
      removeSelected,
      removeCurrentDirFile,
      allSelected,
      reverseSelected,
      back,
      forward,
      sort,
      paste
    }
  },
  {
    persist: [
      {
        storage: sessionStorage,
        paths: ['children', 'historyChildren'],
        afterRestore: (ctx) => {
          const fileMapStore = useFileMapStore()
          ctx.store.children = ctx.store.children.map(
            (dir: any) => new Dir(fileMapStore.getItemById(dir.id, FileExtensionEnum.FOLDER))
          )
        }
      }
    ]
  }
)
