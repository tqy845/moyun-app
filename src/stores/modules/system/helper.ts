import File from '@/models/File/File'
import Stack from '@/models/Stack'
import { PiniaPluginContext } from 'pinia'

export interface SystemStore {
  height: number
  width: number
  asideMenus: { [key: string]: Array<File> } // Map无法被JSON.stringify 可以使用JSON对象平替
  asideIndex: number
  pathList: Stack<File>
  pathDiscardList: Array<File>
  pathEllipsisLength: number
}

export const getDefaultSetting = (): SystemStore => {
  return {
    width: 1080,
    height: 760,
    asideMenus: {},
    asideIndex: 1,
    pathList: new Stack<File>(),
    pathDiscardList: [],
    pathEllipsisLength: 0
  }
}

export const recoverPath = (ctx: PiniaPluginContext) => {
  for (let i = 0; i < ctx.store.pathList.items.length; i++) {
    const item = ctx.store.pathList.items[i]
    const file = new File(item)
    ctx.store.pathList.items[i] = file
  }
  // 重新读取当前目录文件
  ctx.store.pathList.pop()?.open()
}

export const recoverAsideMenus = (ctx: PiniaPluginContext) => {
  for (const key in ctx.store.asideMenus) {
    for (let i = 0; i < ctx.store.asideMenus[key].length; i++) {
      const item = ctx.store.asideMenus[key][i]
      const file = new File(item)
      ctx.store.asideMenus[key][i] = file
    }
  }
}
