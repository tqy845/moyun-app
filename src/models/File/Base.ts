import { FileRawModel } from '@/api/models/fileModel'
import { useDownloadStore, useFileAttrStore, usePathStore } from '@/stores'
import { FileExtensionEnum, FlagEnum } from '@/constants'
import { putRemoveFolder, putRenameFolderName } from '@/api/dir'
import { putRemoveFile, putRenameFileName } from '@/api/file'

export default class Base {
  public parentId!: number
  public id!: number
  public name!: string
  public icon!: string
  public size?: number
  public extension!: string
  public flag!: string
  public hash!: string
  public chunkTotal!: number

  public createdAt?: string
  public updatedAt?: string
  public deletedAt?: string

  public isDownloading = false
  public isCutting = false
  public isCopying = false
  public isRenaming = false
  // 进度条
  public progress = 0
  // 绑定元素
  public el: Element | null = null

  /**
   * 构造方法
   */
  constructor(file: FileRawModel) {
    // 将合法属性赋给File
    Object.keys(file).forEach((key) => {
      if (Object.hasOwn(this, key)) {
        // @ts-ignore
        this[key] = file[key]
      }
    })
    this.name = file.name
  }

  get isFolder() {
    return Object.is(this.extension, FileExtensionEnum.FOLDER)
  }

  get type() {
    return this.isFolder ? '文件夹' : `${this.extension} 文件`
  }

  setEl(el: Element) {
    this.el = el
  }

  /**
   * 判断是否拥有flag
   * @param flag FlagEnum
   */
  hasFlag = (flag: FlagEnum) => {
    return this.flag.toString().split('').includes(flag)
  }

  /**
   * 查看此文件/文件夹详情
   */
  detail = async () => {
    const { show } = useFileAttrStore()
    return show(this)
  }

  /**
   * 分享此文件/文件夹
   */
  shear = async () => {
  }

  /**
   * 复制此文件/文件夹
   */
  copy = async () => {
    this.isCopying = false
  }

  /**
   * 重命名此文件/文件夹
   */
  rename = async (newName: string) => {
    try {
      if (this.name === newName) new Error('无改动')
      const { fail } = await (this.isFolder
        ? putRenameFolderName(this.id, { name: newName })
        : putRenameFileName(this.id, { name: newName }))
      if (!fail) {
        this.name = newName
      }
    } finally {
      await nextTick()
      this.isRenaming = false
    }
  }

  /**
   * 同步此文件/文件夹
   */
  sync = async () => {
  }

  /**
   * 删除此文件/文件夹
   */
  delete = async () => {
    try {
      const { fail } = await (this.isFolder ? putRemoveFolder(this.id) : putRemoveFile(this.id))
      if (!fail) {
        // 从目录中删除
        const { removeCurrentDirFile } = usePathStore()
        console.log('删除成功', this)
        removeCurrentDirFile(this)
        // 从快速访问中删除
      }
    } finally {
      console.log(1)
    }
    console.log('删除')
  }

  /**
   * 下载此文件/文件夹
   * @returns
   */
  download = async () => {
    // 添加到任务队列
    const { appendDownloadTask } = useDownloadStore()
    appendDownloadTask(this)
  }
}
