import { UploadEventFromEnum, usePathStore, useFileStore } from '@/stores'

// 标签类型
type TagTheme = 'default' | 'success' | 'primary' | 'warning' | 'danger'
// 通知的优先级对应的标签类型
export const NOTIFICATION_TYPES: Map<string, TagTheme> = new Map([
  ['low', 'primary'],
  ['middle', 'warning'],
  ['high', 'danger']
])

export type UploadFileStatus = 'await' | 'calcHash' | 'uploading' | 'uploaded' | 'error' | 'paused'
export type UploadFile = {
  id: number
  no: number
  raw: File
  status: UploadFileStatus
  hashPercent: number
  uploadPercent: number
  uploadedChunks?: string[]
  abort?: Function
}

// 通用请求头
export enum ContentTypeEnum {
  Json = 'application/json',
  FormURLEncoded = 'application/x-www-form-urlencoded',
  FormData = 'multipart/form-data'
}

export enum GroupEnum {
  SYSTEM = 0,
  USER = 1
}

export enum FileLevelEnum {
  FIRST,
  OTHER
}

export enum AppRunPlatformEnum {
  'WEB' = 'web',
  'TAURI' = 'tauri'
}

export enum MoYunModeEnum {
  SUPER_BIG_ICON = 250,
  BIG_ICON = 80,
  MEDIUM_ICON = 60,
  SMALL_ICON = 45,
  LIST = 4
}

export enum MoYunAssembleEnum {
  ALL = 0,
  CUSTOM = 1
}

export enum MouseDownTypeEnum {
  LEFT = 1,
  MID = 2,
  RIGHT = 3
}

export enum FileBuildTaskResult {
  SUCCESS = 'success',
  ERROR = 'error',
  EXIST = 'exist'
}

export enum FileExtensionEnum {
  UPLOAD = 'upload',
  MAIN = 'main',
  FILE = 'file',
  FOLDER = 'folder'
}

export enum FlagEnum {
  USER = 'u', // 普通
  QUICK = 'q', // 快速访问
  ASIDE = 'a', // 待上传
  SYSTEM = 's', // 系统与用户目录/文件的分割线
  MAIN = 'm', // 主目录
  CLASSIFY = 'c' // 分类
}

export enum SortModeEnum {
  UP = 'up',
  DOWN = 'down'
}

export const modeOptions = [
  {
    content: '超大图标',
    size: '20',
    value: MoYunModeEnum.SUPER_BIG_ICON,
    prefixIcon: `component-grid`
  },
  {
    content: '大图标',
    size: '16',
    value: MoYunModeEnum.BIG_ICON,
    prefixIcon: `component-grid`
  },
  {
    content: '中图标',
    size: '13',
    value: MoYunModeEnum.MEDIUM_ICON,
    prefixIcon: `component-grid`
  },
  {
    content: '小图标',
    size: '10',
    value: MoYunModeEnum.SMALL_ICON,
    prefixIcon: `component-grid`
  },
  {
    content: '列表',
    size: 'medium',
    value: MoYunModeEnum.LIST,
    prefixIcon: `list`
  }
]

export const assembleOptions = [
  {
    content: '全部显示',
    value: MoYunAssembleEnum.ALL,
    divider: true
  },
  {
    content: '添加新集合',
    value: MoYunAssembleEnum.CUSTOM
  }
]

export const newOptions: Array<{
  content: string
  value: Exclude<FileExtensionEnum, FileExtensionEnum.MAIN>
  prefixIcon: string
  moreIcon?: boolean
  divider?: boolean
  action: () => void
}> = [
  {
    content: '上传文件',
    value: FileExtensionEnum.UPLOAD,
    prefixIcon: `cloudupload-fill`,
    moreIcon: true,
    divider: true,
    action: () => {
      const { showUploadArea } = useFileStore()
      showUploadArea()
    }
  },
  {
    content: '文件夹',
    value: FileExtensionEnum.FOLDER,
    prefixIcon: `folder`,
    action: () => {
      const { createFolder } = useFileStore()
      createFolder()
    }
  },
  {
    content: '文本文档',
    value: FileExtensionEnum.FILE,
    prefixIcon: `file-1`,
    action: () => {
      const { createDocument } = useFileStore()
      createDocument()
    }
  }
]

export enum SortTypeEnum {
  NAME = 'name',
  EXTENSION = 'extension',
  SIZE = 'size',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt'
}

export const sortOptions: Array<{ content: string; attr: SortTypeEnum; divider?: boolean }> = [
  { content: '名称', attr: SortTypeEnum.NAME },
  { content: '类型', attr: SortTypeEnum.EXTENSION },
  { content: '大小', attr: SortTypeEnum.SIZE },
  { content: '创建时间', attr: SortTypeEnum.CREATED_AT },
  { content: '修改时间', attr: SortTypeEnum.UPDATED_AT, divider: true }
]

export const sortModeOptions: Array<{ content: string; value: SortModeEnum; divider?: boolean }> = [
  { content: '递增', value: SortModeEnum.UP },
  { content: '递减', value: SortModeEnum.DOWN }
]

export const moreOptions: Array<{
  content: string
  value: string
  prefixIcon?: string
  action: () => void
  divider?: boolean
}> = [
  {
    content: '撤销',
    value: 'repeal',
    prefixIcon: `rollback`,
    divider: true,
    action: () => {}
  },
  {
    content: '固定到快捷访问',
    value: 'fixed-quick',
    prefixIcon: `pin`,
    // FileService.getInstance().quick(file)
    action: () => '',
    divider: true
  },
  {
    content: '全部选择',
    value: 'all',
    prefixIcon: `check-circle`,
    action: () => {
      const { allSelected } = usePathStore()
      allSelected()
    }
  },
  {
    content: '全部取消',
    value: 'all-cancel',
    prefixIcon: `minus-circle`,
    action: () => {
      const { clearSelected } = usePathStore()
      clearSelected()
    }
  },
  {
    content: '反向选择',
    value: 'reverse',
    prefixIcon: `error-circle`,
    action: () => {
      const { reverseSelected } = usePathStore()
      reverseSelected()
    }
  }
]

export type CONTEXT_MENU_ITEM = {
  id: number
  type: 'text' | 'icon'
  name: string
  icon: string
  shortcutKey?: string
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'
  action: Function
}

export const explorerContextMenuList: Array<CONTEXT_MENU_ITEM> = [
  {
    id: 1,
    type: 'text',
    name: '刷新',
    icon: 'refresh',
    color: 'primary',
    shortcutKey: `F5`,
    action: () => {
      const { children } = usePathStore()
      children.peek()!.refresh()
    }
  },
  {
    id: 2,
    type: 'text',
    name: '上传',
    icon: 'cloud-upload',
    color: 'primary',
    shortcutKey: ``,
    action: () => {
      const { triggerUpload } = useFileStore()
      triggerUpload(UploadEventFromEnum.outside)
    }
  },
  {
    id: 3,
    type: 'text',
    name: '新建文件夹',
    icon: 'folder',
    color: 'primary',
    shortcutKey: ``,
    action: () => {
      const { createFolder } = useFileStore()
      createFolder()
    }
  },
  {
    id: 4,
    type: 'text',
    name: '新建文本文档',
    icon: 'file-1',
    color: 'primary',
    shortcutKey: ``,
    action: () => {
      const { createDocument } = useFileStore()
      createDocument()
    }
  }
]

export enum FILE_MODE {
  LOCAL = 0 // 仅本地
}

export enum STORE_NAME {
  FILE = 'file-store',
  SYSTEM = 'system-store',
  USER = 'user-store',
  SETTING = 'setting-store'
}
