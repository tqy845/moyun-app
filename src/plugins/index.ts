import type { App } from 'vue'

import registerStore from '@/stores'
import registerTDesign from './TDesign'
import { registerDirectives } from '@/utils'
import registerRouter from '@/router'
// import { mouseUtils } from "@/utils/functions";
import '@/assets/icons/iconfont'

import '@/utils/extends/array'

/**
 * 注册插件
 * @param app Vue实例
 */
export default async function registerPlugins(app: App) {
  registerTDesign(app)
  registerStore(app)
  // registerFunctions(app)
  registerDirectives(app)
  await registerRouter(app)

  // 禁用右键菜单
  // mouseUtils.disableContextMenu()
}
