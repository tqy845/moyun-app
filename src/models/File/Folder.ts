import { CONTEXT_MENU_ITEM, FileExtensionEnum, FileLevelEnum, GroupEnum } from '@/constants'
import Base from './Base'
import { useDirStore, usePathStore } from '@/stores'
import Dir from './Dir'
import { singleContextmenuFactory } from './enum'
import { Prototype } from './interface'
import { FileRawModel } from '@/api/models/fileModel'

export default class Folder extends Base {
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
      type: FileExtensionEnum.FOLDER,
      menuItems: singleContextmenuFactory(this, ...(options?.menuItems || []))
    })
  }

  get notExtName() {
    return this.name
  }

  /**
   * 菜单项
   */
  get menuItems(): any {
    return this.__prototype__.menuItems
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

  quick = async () => {}
}
