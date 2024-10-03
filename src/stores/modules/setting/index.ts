import { putSave } from '@/api/setting'
import { defineStore } from 'pinia'
import {
  assembleOptions,
  MoYunAssembleEnum,
  MoYunModeEnum,
  SortModeEnum,
  sortOptions,
  STORE_NAME
} from '@/constants'
import { SettingModel } from '@/api/models/settingModel'
import { FileRawModel } from '@/api/models/fileModel'

export const useSettingStore = defineStore(
  `setting-store`,
  () => {
    const fileSize = ref(MoYunModeEnum.MEDIUM_ICON)
    const fileSortType = ref(sortOptions[0].attr)
    const fileSortMode = ref(SortModeEnum.UP)
    const photoAlbumParentId = ref(MoYunAssembleEnum.ALL)
    const photoAlbumAssembleList = ref<
      Array<
        FileRawModel & {
          value: number
          content: string
          divider: boolean
        }
      >
    >([])
    const photoAlbumAssembleOptions = computed(() => {
      const _list = [...assembleOptions]
      photoAlbumAssembleList.value.forEach((it, index) => {
        it.divider = index === photoAlbumAssembleList.value.length - 1
      })
      _list.splice(1, 0, ...photoAlbumAssembleList.value)
      return _list
    })
    const currentSelectedPhotoAlbum = computed(() => {
      return photoAlbumAssembleOptions.value.find((item) => item.value === photoAlbumParentId.value)
    })

    const setAssemble = (parentId: number) => {
      photoAlbumParentId.value = parentId
    }

    const save = async (storeName: STORE_NAME, name: string, value: any) => {
      const id = this.setting[storeName][name]
      const { setting } = await putSave<{ setting: SettingModel }>({
        id,
        storeName,
        name,
        value: String(value)
      })
      // 更新本地ID
      this.setting[storeName][name] = setting.id
    }

    return {
      fileSize,
      fileSortType,
      fileSortMode,
      photoAlbumParentId,
      photoAlbumAssembleList,
      photoAlbumAssembleOptions,
      currentSelectedPhotoAlbum,

      setAssemble,
      save
    }
  },
  {
    persist: [
      {
        paths: [
          'fileSize',
          'fileSortType',
          'fileSortMode',
          'photoAlbumParentId',
          'photoAlbumAssembleList'
        ],
        storage: sessionStorage
      }
    ]
  }
)
