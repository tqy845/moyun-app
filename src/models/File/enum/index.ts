import { CONTEXT_MENU_ITEM } from '@/constants'
import File from '@/models/File/File'
import Folder from '../Folder'

export enum MenuItemEnum {
  Cut,
  Copy,
  Rename,
  Delete,
  Quick,
  QuickCancel,
  Download
}

export function singleContextmenuFactory(
  file: File | Folder,
  ...args: Array<MenuItemEnum>
): Array<CONTEXT_MENU_ITEM> {
  const Download: CONTEXT_MENU_ITEM = {
    id: 9,
    type: 'icon',
    name: '下载',
    icon: 'cloud-download',
    color: 'primary',
    action: file.download
  }

  const Cut: CONTEXT_MENU_ITEM = {
    id: 3,
    type: 'icon',
    name: '剪切',
    icon: 'cut',
    shortcutKey: `Ctrl+X`,
    color: 'primary',
    action: () => (file.isShearing.value = true)
  }

  const Copy: CONTEXT_MENU_ITEM = {
    id: 4,
    type: 'icon',
    name: '复制',
    icon: 'copy',
    shortcutKey: `Ctrl+C`,
    color: 'primary',
    action: () => (file.isCopying.value = true)
  }

  const Rename: CONTEXT_MENU_ITEM = {
    id: 5,
    type: 'icon',
    name: '重命名',
    icon: 'edit-2',
    shortcutKey: `F2`,
    color: 'primary',
    action: () => (file.isRenaming.value = true) // 开启文件名称编辑
  }

  const Delete: CONTEXT_MENU_ITEM = {
    id: 6,
    type: 'icon',
    name: '删除',
    icon: 'delete',
    shortcutKey: `Delete`,
    color: 'danger',
    action: file.delete
  }

  const Quick: CONTEXT_MENU_ITEM = {
    id: 10,
    type: 'text',
    name: '固定到快捷访问',
    icon: 'pin',
    action: (file as Folder).quick
  }

  const QuickCancel: CONTEXT_MENU_ITEM = {
    id: 11,
    type: 'text',
    name: '从“快捷访问”取消固定',
    icon: 'pin',
    action: (file as Folder).quick
  }

  const items: Array<CONTEXT_MENU_ITEM> = [
    {
      id: 1,
      type: 'text',
      name: '打开',
      icon: 'gesture-up-1',
      shortcutKey: `Enter`,
      action: file.open
    },
    {
      id: 2,
      type: 'text',
      name: '属性',
      icon: 'tools',
      shortcutKey: `Alt+Enter`,
      action: file.detail
    }
  ]

  args.forEach((key) => {
    switch (key) {
      case MenuItemEnum.Cut:
        items.push(Cut)
        break
      case MenuItemEnum.Copy:
        items.push(Copy)
        break
      case MenuItemEnum.Rename:
        items.push(Rename)
        break
      case MenuItemEnum.Delete:
        items.push(Delete)
        break
      case MenuItemEnum.Quick:
        items.push(Quick)
        break
      case MenuItemEnum.QuickCancel:
        items.push(QuickCancel)
        break
      case MenuItemEnum.Download:
        items.push(Download)
        break
    }
  })

  return items
}

export function multipleContextmenuItemsFactory(
  files: Array<File | Folder>,
  ...args: Array<MenuItemEnum>
) {
  const Cut: CONTEXT_MENU_ITEM = {
    id: 3,
    type: 'icon',
    name: '剪切',
    icon: 'cut',
    shortcutKey: `Ctrl+X`,
    color: 'primary',
    action: () => {}
  }

  const Copy: CONTEXT_MENU_ITEM = {
    id: 4,
    type: 'icon',
    name: '复制',
    icon: 'copy',
    shortcutKey: `Ctrl+C`,
    color: 'primary',
    action: () => {}
  }

  const Delete: CONTEXT_MENU_ITEM = {
    id: 6,
    type: 'icon',
    name: '删除',
    icon: 'delete',
    shortcutKey: `Delete`,
    color: 'danger',
    action: () => {}
  }

  const items: Array<CONTEXT_MENU_ITEM> = [
    {
      id: 1,
      type: 'text',
      name: '打开',
      icon: 'gesture-up-1',
      shortcutKey: `Enter`,
      action: () => {}
    },
    {
      id: 2,
      type: 'text',
      name: '属性',
      icon: 'tools',
      shortcutKey: `Alt+Enter`,
      action: () => {}
    }
  ]

  args.forEach((key) => {
    switch (key) {
      case MenuItemEnum.Cut:
        items.push(Cut)
        break
      case MenuItemEnum.Copy:
        items.push(Copy)
        break
      case MenuItemEnum.Delete:
        items.push(Delete)
        break
    }
  })

  return items
}
