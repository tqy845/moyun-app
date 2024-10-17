import { ContentMenuItem, FileExtensionEnum, FileLevelEnum, FlagEnum, GroupEnum } from '@/constants'
import Base from './Base'
import { useDirStore, usePathStore } from '@/stores'
import Dir from './Dir'
import { Prototype } from './interface'
import { FileRawModel } from '@/api/models/fileModel'
import { ContextMenu } from '../ContextMenu'
import { putFixedQuickFolder } from '@/api/dir'

export default class Folder extends Base {
  readonly __prototype__: {
    // 类型
    type: FileExtensionEnum
    // 组
    group: GroupEnum
    // 级别
    level: number
    // 菜单项
    menuItems: Array<ContentMenuItem>
  }

  constructor(object: FileRawModel, options?: Prototype) {
    super(object)
    const menuItems = ContextMenu.builder()
      .appendOpen()
      .appendLookAttr()
      .build()

    this.__prototype__ = Object.assign({
      group: options?.group ?? GroupEnum.USER,
      level: options?.level ?? FileLevelEnum.OTHER,
      type: FileExtensionEnum.FOLDER,
      menuItems
    })
  }

  get notExtName() {
    return this.name
  }

  /**
   * 菜单项
   */
  getMenuItems(flag?: FlagEnum): any {
    const builder = ContextMenu.builder()

    if (this.hasFlag(FlagEnum.ASIDE)) {
      if (this.hasFlag(FlagEnum.QUICK)) {
        builder.appendCancelFixedQuick()
      }

    } else {
      // 快速访问
      if (this.hasFlag(FlagEnum.QUICK) && flag === FlagEnum.QUICK) {
        builder.appendCancelFixedQuick()
      } else {
        builder.appendFixedQuick()
          .appendDownload()
          .appendCut()
          .appendCopy()
          .appendRename()
          .appendDelete()
      }
    }
    return this.__prototype__.menuItems.concat(builder.build())
  }

  /**
   * 打开文件夹（自动添加到系统路径，系统路径会自动加载目录数据）
   * 一级目录会清空系统目录再打开
   */
  open = async () => {
    const { asideMenuObject } = useDirStore()
    const { children, historyChildren } = storeToRefs(usePathStore())
    if (this.__prototype__.level === FileLevelEnum.FIRST) {
      // 一级目录
      children.value.clear() // 清空
      // 更新侧边栏目录索引
      if (asideMenuObject.index !== this.id) {
        asideMenuObject.index = this.id
      }
    }
    // 添加到系统路径
    children.value.push(new Dir(this))
    // 清空历史路径
    historyChildren.value.length = 0
  }

  quick = async (isFixed: boolean = true) => {
    const { fail, data } = await putFixedQuickFolder(this.id, isFixed)
    if (!fail && data) {
      this.flag = data.flag
    }
  }
}
