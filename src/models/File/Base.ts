import { FileRawModel } from '@/api/models/fileModel'
import { useDownloadStore } from '@/stores'
import { FlagEnum } from '@/constants'

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
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        // @ts-ignore
        this[key] = file[key]
      }
    })
  }

  /**
   * 判断是否拥有flag
   * @param flag FlagEnum
   */
  hasFlag = (flag: FlagEnum) => {
    return this.flag.split('').includes(flag)
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
    this.isCopying.value = false
  }

  /**
   * 重命名此文件/文件夹
   */
  rename = async (newName: string) => {
    this.isRenaming.value = false
    if (this.name === newName) return

    console.log('重命名', newName)
  }

  /**
   * 同步此文件/文件夹
   */
  sync = async () => {}

  /**
   * 删除此文件/文件夹
   */
  delete = async () => {
    // if (this.type === FlagEnum.QUICK) {
    //   // 从快速访问从删除
    //   this.fileService.quick(this)
    // }
    // if (await this.fileService.delete(this)) {
    //   useFileStore().deleted(this)
    // }
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
