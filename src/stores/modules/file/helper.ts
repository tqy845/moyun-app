import File from '@/models/File/File'
import { MoYunModeEnum } from '@/constants'
import { useFileStore, useSettingStore } from '@/stores'

export interface MoYunStore {
  reading: boolean
  mode: MoYunModeEnum
  upload: boolean
  rawList: File[]
  selectedList: Map<number, File>
  actionList: Map<number, File>
  downloadPath: string
  searchKey: string
}


export const resetMode = () => {
  const settingStore = useSettingStore()
  const fileStore = useFileStore()
  if (settingStore.fileSize < MoYunModeEnum.SMALL_ICON) {
    settingStore.fileSize = MoYunModeEnum.SMALL_ICON
    // 切换列表模式
    fileStore.mode = MoYunModeEnum.LIST
  } else if (settingStore.fileSize >= MoYunModeEnum.SUPER_BIG_ICON) {
    fileStore.mode = settingStore.fileSize = MoYunModeEnum.SUPER_BIG_ICON
  } else if (settingStore.fileSize >= MoYunModeEnum.BIG_ICON) {
    fileStore.mode = MoYunModeEnum.BIG_ICON
  } else if (settingStore.fileSize >= MoYunModeEnum.MEDIUM_ICON) {
    fileStore.mode = MoYunModeEnum.MEDIUM_ICON
  } else if (settingStore.fileSize >= MoYunModeEnum.SMALL_ICON) {
    // 切换图标模式
    fileStore.mode = MoYunModeEnum.SMALL_ICON
  }
}
