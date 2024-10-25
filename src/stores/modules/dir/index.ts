import { getAsideMenu, getDustbinList, getPhotoList } from '@/api/dir'
import Folder from '@/models/File/Folder'
import { AsideMenuType } from './helper'
import {
  FileExtensionEnum,
  FileLevelEnum,
  FlagEnum,
  GroupEnum,
  MoYunAssembleEnum
} from '@/constants'
import { useFileMapStore, usePathStore, useSettingStore } from '@/stores'
import { fileUtils } from '@/utils/functions'

export const useDirStore = defineStore(
  `dirStore`,
  () => {
    const fileMapStore = useFileMapStore()
    // 侧边菜单项
    const asideMenuObject: Ref<AsideMenuType> = ref({
      index: 0,
      menus: []
    })
    const asideMenuObjectCurrentIndexItem = computed(
      () =>
        fileMapStore.getItemById(asideMenuObject.value.index, FileExtensionEnum.FOLDER) as Folder
    )
    const folderSelect = ref(false)
    const isBaseLayout = computed(
      () => !asideMenuObjectCurrentIndexItem.value.flag.includes(FlagEnum.PHOTO_ALBUM)
    )
    const isPhotoAlbum = computed(() =>
      asideMenuObjectCurrentIndexItem.value.flag.includes(FlagEnum.PHOTO_ALBUM)
    )
    const isDustbin = computed(() =>
      asideMenuObjectCurrentIndexItem.value.flag.includes(FlagEnum.DUSTBIN)
    )
    const isDrag = ref(false)

    /**
     * 读取侧边菜单项
     * @returns
     */
    const readAsideMenu = async () => {
      const { menus } = await getAsideMenu()
      // 菜单项之下挂着文件夹，需要转换文件夹实例
      asideMenuObject.value.menus.clear()
      menus.forEach(({ name, children }) => {
        asideMenuObject.value.menus.push({
          name,
          menus: children.map((fileRawModel) => {
            const folder = new Folder(fileRawModel, {
              group: GroupEnum.SYSTEM,
              level: FileLevelEnum.FIRST
            })
            fileMapStore.addItem(folder)
            return folder
          })
        })
      })
      // 初始化侧边菜单索引为选项卡的第一个ID
      asideMenuObject.value.index = asideMenuObject.value.menus[0].menus[0].id
      // 获取当前目录文件
      return asideMenuObjectCurrentIndexItem.value.open()
    }

    /**
     * 读取图库
     */
    const readPhotoAlbum = async () => {
      const { children } = usePathStore()
      return await children.peek().readDir()
    }

    const switchFolderSelect = (status: boolean) => {
      folderSelect.value = status
    }

    return {
      asideMenuObject,
      asideMenuObjectCurrentIndexItem,
      isBaseLayout,
      isPhotoAlbum,
      isDustbin,
      folderSelect,
      isDrag,

      switchFolderSelect,
      readAsideMenu,
      readPhotoAlbum
    }
  },
  {
    persist: [
      {
        debug: true,
        storage: sessionStorage,
        paths: ['asideMenuObject'],
        afterRestore: (ctx) => {
          // 恢复 asideMenuObject
          const instances = ctx.store.asideMenuObject.menus.map(({ name, menus }: any) => ({
            name,
            menus: menus.map((_menu: any) => new Folder(_menu, _menu.__prototype__))
          }))
          ctx.store.asideMenuObject.menus.clear()
          ctx.store.asideMenuObject.menus.push(...instances)
        }
      }
    ]
  }
)
