import { FileExtensionEnum, SortModeEnum, SortTypeEnum } from '@/constants'
import Dir from '@/models/File/Dir'
import Folder from '@/models/File/Folder'
import File from '@/models/File/File'
import { fileUtils } from '@/utils/functions'
import { useDirStore, useFileMapStore, useFileStore, useSettingStore } from '@/stores'
import Base from '@/models/File/Base.ts'
import { cloneDeep } from 'lodash'
import { postCopyFile, postCutFile } from '@/api/file'
import { sseCopyFolder, postCutFolder, getPathJump } from '@/api/dir'

export type AggregateFile = (File & any) | (Folder & any)

export const usePathStore = defineStore(
  'path-store',
  () => {
    const children = ref<Array<Dir & any>>([])
    const currentDir = computed<AggregateFile>(() => children.value.peek())
    const historyChildren = ref<Array<number>>([]) // 装入目录的ID
    const isLoading = ref(false)
    const currentDirFiles = ref<Array<AggregateFile>>([])
    const currentDirSelectedFiles = ref<Array<AggregateFile>>([])
    const currentActionFiles = ref<Array<AggregateFile>>([])
    const { isBaseLayout, asideMenuObjectCurrentIndexItem } = storeToRefs(useDirStore())
    const { readPhotoAlbum } = useDirStore()
    const { fileSortMode, fileSortType } = storeToRefs(useSettingStore())
    const keyword = ref('')
    const isSearchMode = ref(false)
    const { getItemById } = useFileMapStore()

    const isSelected = (file: File | Folder) => {
      return currentDirSelectedFiles.value.includes(file)
    }
    const clearSelected = () => {
      console.warn('123')

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
      const index = currentDirSelectedFiles.value.findIndex(
        (_file: File | Folder) => !(fileRaw.hash === _file.hash)
      )
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

    const pathJump = async (stringPath: string) => {
      const id = asideMenuObjectCurrentIndexItem.value.id
      const name = asideMenuObjectCurrentIndexItem.value.name
      const { dirs } = await getPathJump(id, stringPath.substring(name.length + 1))
      if (!dirs.isEmpty()) {
        // 读取目标路径文件夹
        console.log('读取目标路径文件夹', dirs)
        // 重新实例化目录ID列表
        const dirList = dirs.map((rawDir) => new Dir(new Folder(rawDir)))
        children.value.length = 1
        children.value.push(...dirList)
      } else {
        const confirmDia = DialogPlugin({
          header: '跳转失败',
          theme: 'danger',
          body: `找不到路径“${stringPath}”，请检查拼写并重试。`,
          confirmBtn: '确定',
          cancelBtn: null,
          onConfirm: () => {
            confirmDia.hide()
          }
        })
      }
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
      const promises = []
      let isCutAction = false

      for (let i = 0; i < currentActionFiles.value.length; i++) {
        const file = currentActionFiles.value[i]
        const newFile = cloneDeep(file)
        newFile.isCutting = false
        newFile.isCopying = false

        const oldFile = currentDirFiles.value.find(
          (_file) => _file.name === file.name && _file.type === file.type
        )

        // 剪切操作
        if (file.isCutting) {
          isCutAction = true
          if (oldFile) {
            const confirmDia = DialogPlugin({
              header: '源文件名和目标文件名相同',
              body: `文件名：${file.name}\n\n项目类型：${file.extension}\n${file.size}`,
              confirmBtn: '确认',
              cancelBtn: null,
              onConfirm: () => {
                confirmDia.hide()
              }
            })
            continue // 文件重名时跳过操作，避免继续执行
          }

          const fn = file.isFolder ? postCutFolder : postCutFile
          promises.push(fn(file.id, currentDir.value.id)) // 收集异步操作
        }

        // 复制操作
        if (file.isCopying) {
          const { switchCopyHint } = useFileStore()
          const { copyOptionsRef } = storeToRefs(useFileStore())
          const targetDirId = currentDir.value.id
          newFile.parentId = targetDirId

          const fn = file.isFolder ? sseCopyFolder : postCopyFile
          const copyPromise = fn(
            file.id,
            { newName: newFile.name, targetDirId },
            ({ type, data }: any) => {
              console.log('type = ', type)
              switch (type) {
                case 'start':
                  const { name, totalNumber } = data
                  newFile.name = name
                  copyOptionsRef.value.totalNumber = totalNumber
                  break
                case 'progress':
                  const { progress } = data
                  copyOptionsRef.value.progress = progress
                  if (progress == 100) {
                    switchCopyHint(false)
                    // newFile.progress = 0
                  }
                  break
              }
            }
          )
          promises.push(
            copyPromise.then(({ fail, data }) => {
              if (!fail) {
                newFile.id = data.id
              }
            })
          )

          // 将新文件添加到当前目录文件列表
          currentDirFiles.value.push(newFile)
          switchCopyHint(true)
        }
      }

      // 等待所有异步操作完成
      await Promise.all(promises)

      // 如果有剪切操作，清空粘贴文件
      if (isCutAction) {
        currentActionFiles.value.clear()
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
      keyword,
      isSearchMode,

      isSelected,
      clearSelected,
      addSelected,
      removeSelected,
      removeCurrentDirFile,
      allSelected,
      reverseSelected,
      back,
      forward,
      pathJump,
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
