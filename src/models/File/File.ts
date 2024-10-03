import { CONTEXT_MENU_ITEM, FileExtensionEnum, FileLevelEnum, GroupEnum } from '@/constants'
import Base from './Base'
import { singleContextmenuFactory } from './enum'
import { Prototype } from './interface'
import { FileRawModel } from '@/api/models/fileModel'
import { fileUtils } from '@/utils/functions'
import { usePreviewStore } from '@/stores'

/**
 * 文件类
 */
export default class File extends Base {
  readonly __prototype__: {
    // 类型
    type: FileExtensionEnum
    // 组
    group: GroupEnum
    // 级别
    level: number
    // 菜单项
    menuItems: Array<CONTEXT_MENU_ITEM>
  }

  constructor(object: FileRawModel, options?: Prototype) {
    super(object)
    this.__prototype__ = Object.assign({
      group: options?.group ?? GroupEnum.USER,
      level: options?.level ?? FileLevelEnum.OTHER,
      type: FileExtensionEnum.FILE,
      menuItems: singleContextmenuFactory(this, ...(options?.menuItems || []))
    })
  }

  /**
   * 文件名，不带后缀
   */
  get notExtName() {
    return fileUtils.getNotExtName(this.name)
  }

  /**
   * 菜单项
   */
  get menuItems() {
    return this.__prototype__.menuItems
  }

  /**
   * 打开文件，在线预览
   */
  open = async () => {
    // 是否为图片
    console.log('打开', this.extension)
    const { visible, file } = storeToRefs(usePreviewStore())
    visible.value = true
    file.value = this
  }

  quick = async () => {
    throw new Error('文件不支持挂载到快速访问')
  }


}
