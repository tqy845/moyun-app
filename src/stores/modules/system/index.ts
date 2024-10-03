import { defineStore } from 'pinia'
import { getDefaultSetting, recoverAsideMenus, recoverPath } from '@/stores/modules/system/helper'

export const useSystemStore = defineStore(`system-store`, {
  state: () => getDefaultSetting(),
  persist: {
    storage: sessionStorage,
    paths: ['asideIndex', 'asideMenus', 'pathList', 'pathEllipsisLength'],
    afterRestore: (ctx) => {
      if (ctx.store.$id === `system-store`) {
        recoverAsideMenus(ctx)
        recoverPath(ctx)
      }
    }
  },
  getters: {
    contentHeight: (state) => state.height - 56 - 56 - 18
  },
  actions: {
    updateSize(width: number, height: number) {
      this.width = width
      this.height = height
    }

  }
})
