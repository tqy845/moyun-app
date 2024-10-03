import { SettingModel } from '@/api/models/settingModel'
import { MoYunModeEnum, SortModeEnum, STORE_NAME, sortOptions, SortTypeEnum } from '@/constants'
import { useFileStore, useSettingStore, useSystemStore, useUserStore } from '@/stores'
import { DebuggerEventExtraInfo } from 'vue'
import { resetMode } from '../file/helper'

export interface SettingStore {
  setting: { [key: string]: { [key: string]: any } }
  fileSize: number
  fileSortType: SortTypeEnum
  fileSortMode: SortModeEnum
}

export const getDefaultSetting = (): SettingStore => {
  const setting: Record<string, any> = {}
  for (const key in STORE_NAME) {
    setting[STORE_NAME[key]] = {}
  }
  return {
    setting,
    fileSize: MoYunModeEnum.MEDIUM_ICON,
    fileSortType: sortOptions[0].attr,
    fileSortMode: SortModeEnum.UP
  }
}

export function init(settings: SettingModel[]) {
  // 初始化
  const systemStore = useSystemStore()
  const fileStore = useFileStore()
  const userStore = useUserStore()
  const settingStore = useSettingStore()

  settings.forEach(({ id, storeName, name, value }) => {
    const typeFunc = Number.isNaN(Number(value)) ? String : Number

    switch (storeName) {
      case STORE_NAME.FILE:
        fileStore[name] = typeFunc(value)
        break
      case STORE_NAME.SYSTEM:
        systemStore[name] = typeFunc(value)
        break
      case STORE_NAME.USER:
        userStore[name] = typeFunc(value)
        break
      case STORE_NAME.SETTING:
        settingStore[name] = typeFunc(value)
        // 特判
        switch (name) {
          case 'fileSize':
            resetMode()
            break
        }
        break
    }
    settingStore.setting[storeName][name] = id
  })
  systemStore.init()
}

const sync = useDebounceFn((storeId, key, newValue) => {
  const settingStore = useSettingStore()
  settingStore.save(storeId as STORE_NAME, key, newValue)
}, 3000)

export const settingUpdate = (mutation) => {
  const { key, newValue } = mutation.events as DebuggerEventExtraInfo
  sync(mutation.storeId, key, newValue)
}
