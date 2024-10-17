import Folder from "@/models/File/Folder"

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

export const modeOptions: Array<{
  content: string,
  size: string,
  value: MoYunModeEnum,
  prefixIcon: string,
  divider?: boolean
}> = [
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

export type ContentMenuItemType = 'text' | 'icon'
export type ContentMenuItem = {
  type: ContentMenuItemType
  name: string
  action: (folder?: Folder) => any
  icon?: string
  prefixIcon?: string
  shortcutKey?: string
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'
  value?: string
  moreIcon?: boolean
  divider?: boolean
}

export enum FILE_MODE {
  LOCAL = 0 // 仅本地
}

export enum STORE_NAME {
  FILE = 'file-store',
  SYSTEM = 'system-store',
  USER = 'user-store',
  SETTING = 'setting-store'
}
