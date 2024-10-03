/**
 * @module router-functions
 * @description 该模块用于处理路由自动导入
 * @version 0.2.0
 * @author 叫我白天.
 */

// 获取所有 layouts/views 的模块
const modulesViews = import.meta.glob('@/views/**/*.vue')
const modulesLayouts = import.meta.glob('@/layouts/**/*.vue')

/**
 * 创建路由组件
 * @param pageName 页面名称
 * @returns 路由组件
 */
export function createRouteComponent(pageName: string) {
  const isView = Object.keys(modulesViews).find((key) => key.includes(pageName))
  const isLayout = Object.keys(modulesLayouts).find((key) => key.includes(pageName))
  if (isView) return modulesViews[isView]
  else if (isLayout) return modulesLayouts[isLayout]
  throw new Error('没有找到对应的路由组件')
}

const routerUtils = {
  createRouteComponent
}

export default routerUtils
