import { usePathStore } from "@/stores";

export const useFileRectMapStore = defineStore(
  `fileRectMapStore`,
  () => {
    // 用于快速索引文件
    const fileRectMap = ref<{ [key: number]: DOMRect }>({})
    const { currentDirFiles } = storeToRefs(usePathStore())
    const addItem = (...items: Array<{ id: number; rect: DOMRect }>) => {
      items.forEach((item) => (fileRectMap.value[item.id] = item.rect))
    }

    const getItemById = (id: number) => {
      return fileRectMap.value[id]
    }

    const deleteItemById = (id: number) => {
      delete fileRectMap.value[id]
    }

    const clearAll = () => {
      fileRectMap.value = {}
    }

    const calcNewData = () => {
      if (!currentDirFiles.value.length) {
        setTimeout(calcNewData, 150)
        return
      }
      const el = document.querySelector(`[data-id="${currentDirFiles.value[0].id}"]`)
      const rect = el!.getBoundingClientRect()
      if (rect.height <= 2) {
        setTimeout(calcNewData, 150)
        return
      }
      addItem(
        ...currentDirFiles.value.map((file) => {
          const el = document.querySelector(`[data-id="${file.id}"]`)
          const rect = el!.getBoundingClientRect()
          return {
            id: file.id,
            rect
          }
        })
      )
      console.log("更新完成", getItemById(166));

    }

    return {
      fileRectMap,
      addItem,
      getItemById,
      deleteItemById,
      clearAll,
      calcNewData
    }
  },
  {
    persist: [
      {
        debug: true,
        storage: sessionStorage,
        paths: ['fileRectMap']
      }
    ]
  }
)
