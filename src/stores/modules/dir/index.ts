import { getAsideMenu, getPhotoList } from '@/api/dir'
import Folder from '@/models/File/Folder'
import File from '@/models/File/File'
import { AsideMenuType } from './helper'
import { FileExtensionEnum, FileLevelEnum, GroupEnum, MoYunAssembleEnum } from '@/constants'
import { useFileMapStore, usePathStore, useSettingStore } from '@/stores'
import { fileUtils } from '@/utils/functions'
import { Prototype } from '@/models/File/interface'
import { FileRawModel } from '@/api/models/fileModel'

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
    const { photoAlbumParentId } = storeToRefs(useSettingStore())
    const search = ref('')
    const isBaseLayout = computed(() => asideMenuObjectCurrentIndexItem.value.name !== '图库')
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
      const { isLoading, currentDirFiles } = storeToRefs(usePathStore())
      const { sort } = usePathStore()
      isLoading.value = true
      currentDirFiles.value.clear()
      /* 全部显示 */
      let id = -1
      if (photoAlbumParentId.value !== MoYunAssembleEnum.ALL) {
        // 指定集合
        id = photoAlbumParentId.value
      }
      const { files } = await getPhotoList(id, {
        page: 1,
        size: 5
      })
      // 将源数据转换为实例
      const fileInstances = files.map(fileUtils.metadataConversionFileInstance)
      // 添加到渲染列表
      currentDirFiles.value.push(...fileInstances)
      // 按需排序
      sort()
      // 缓存到文件哈希表
      fileMapStore.addItem(...fileInstances)
      isLoading.value = false
    }

    /**
     * 读取回收站
     */
    const readDustbin = async () => {
    }

    const switchFolderSelect = (status: boolean) => {
      folderSelect.value = status
    }

    return {
      search,
      asideMenuObject,
      asideMenuObjectCurrentIndexItem,
      isBaseLayout,
      folderSelect,
      isDrag,

      switchFolderSelect,
      readAsideMenu,
      readPhotoAlbum,
      readDustbin
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
