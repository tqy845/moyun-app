import { getFileList, sseSearchFolder } from '@/api/dir'
import Folder from './Folder'
import { FileRawModel } from '@/api/models/fileModel'
import { useDirStore, useFileMapStore, usePathStore } from '@/stores'
import { fileUtils } from '@/utils/functions'

export default class Dir {
  name: string
  id: number
  rawFolder: Folder

  constructor(folder: Folder) {
    this.name = folder.name
    this.id = folder.id
    this.rawFolder = folder
  }

  /**
   * 刷新当前目录文件列表
   *
   * 清空当前目录文件列表，然后调用readDir方法重新加载目录内容
   */
  refresh = async () => {
    const { isBaseLayout, readPhotoAlbum } = useDirStore()
    if (isBaseLayout) {
      const { currentDirFiles } = storeToRefs(usePathStore())
      currentDirFiles.value.length = 0
      await this.readDir()
    } else {
      // 图库
      await readPhotoAlbum()
    }
  }

  /**
   * 搜索文件夹
   * @param keyword 关键字
   */
  search = async (keyword: string) => {
    this.clear()
    await sseSearchFolder(this.id, keyword, ({ files }) => files.forEach(file => this.appendFile(file)))
  }

  /**
   * 读取当前目录下的文件
   */
  readDir = async () => {
    const fileMapStore = useFileMapStore()
    const { isLoading, currentDirFiles, currentDirSelectedFiles } = storeToRefs(usePathStore())
    isLoading.value = true

    // 初始化
    currentDirFiles.value.clear()
    currentDirSelectedFiles.value.clear()

    const { sort } = usePathStore()
    const { files } = await getFileList(this.id, {
      page: 1,
      size: 5
    })
    // 将源数据转换为实例
    const fileInstances = files.map(fileUtils.metadataConversionFileInstance)
    // 添加到渲染列表
    currentDirFiles.value.push(...fileInstances)
    // 按需排序
    sort()
    // 缓存到文件哈希表
    fileMapStore.addItem(...fileInstances)
    isLoading.value = false
    return
  }


  /**
   * 追加一个文件到本目录
   * @param fileRawModel 文件元数据
   * @returns 返回文件实例
   */
  appendFile = async (fileRawModel: FileRawModel, reSort: boolean = true) => {
    const fileMapStore = useFileMapStore()
    const { isLoading, currentDirFiles } = storeToRefs(usePathStore())
    const { sort } = usePathStore()
    isLoading.value = true
    // 将源数据转换为实例
    const fileInstance = fileUtils.metadataConversionFileInstance(fileRawModel)
    // 添加到渲染列表
    currentDirFiles.value.push(fileInstance)
    // 按需排序
    if (reSort) sort()
    // 缓存到文件哈希表
    fileMapStore.addItem(fileInstance)
    isLoading.value = false
    return fileInstance
  }

  go = async () => {
    const { historyChildren, children } = storeToRefs(usePathStore())
    // 清空历史路径
    historyChildren.value.length = 0
    // 系统目录切换到当前路径
    const currentIndex = children.value.findIndex((dir) => dir.id === this.id)
    children.value.length = currentIndex + 1
  }

  clear = () => {
    const { currentDirFiles, currentActionFiles, currentDirSelectedFiles } = storeToRefs(usePathStore())
    // 初始化
    currentDirFiles.value.clear()
    currentActionFiles.value.clear()
    currentDirSelectedFiles.value.clear()
  }
}
