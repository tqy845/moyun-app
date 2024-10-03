import Folder from '@/models/File/Folder.ts'

export type AsideMenuType = {
  // 侧边菜单索引
  index: number
  // 侧边菜单项
  menus: Array<Folder>
}
