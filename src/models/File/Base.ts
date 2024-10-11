import { FileRawModel } from '@/api/models/fileModel'
import { useDownloadStore, usePathStore } from '@/stores'
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
  public flag!: number
  public hash!: string
  public chunkTotal!: number

  public createdAt?: string
  public updatedAt?: string
  public deleteAt?: string

  public isDownloading = ref(false)

  public isShearing = ref(false)
  public isCopying = ref(false)
  public isRenaming = ref(false)
  // 进度条
  public progress = ref(0)

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
  detail = async () => {}

  /**
   * 分享此文件/文件夹
   */
  shear = async () => {}

  /**
   * 复制此文件/文件夹
   */
  copy = async () => {
    console.log(1);
    
    this.isCopying.value = false
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
      this.isRenaming.value = false
    }
  }

  /**
   * 同步此文件/文件夹
   */
  sync = async () => {}

  /**
   * 删除此文件/文件夹
   */
  delete = async () => {
    try {
      const { fail } = await (this.isFolder ? putRemoveFolder(this.id) : putRemoveFile(this.id))
      if (!fail) {
        // 从目录中删除
        const { removeCurrentDirFile } = usePathStore()
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

export type NonMethodKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K
}[keyof T]

export type NonMethodProperties<T> = Pick<T, NonMethodKeys<T>>
