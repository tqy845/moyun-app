/**
 * @module mouse-directives
 * @description 该模块用于鼠标相关的指令
 * @version 0.1.0
 * @author 叫我白天.
 */

import { App } from 'vue'

export const disabledContextMenu = {
  // @ts-ignore
  mounted(el: HTMLElement & { _resizeObserver_: ResizeObserver }, binding: { value: any }) {
    el.addEventListener('contextmenu', function (e) {
      e.preventDefault()
    })
  }
}

const mouseDirectives: Record<string, Object> = {
  disabledContextMenu
}

/**
 * 注册元素指令
 * @param {App} app - Vue应用实例
 * @param {string} prefix - 前缀（可选，默认为"mouse"）
 */
export default function registerMouseDirectives(app: App, prefix: string = 'mouse') {
  Object.keys(mouseDirectives).forEach((directiveName) => {
    const registerName = prefix.concat(
      directiveName.charAt(0).toUpperCase() + directiveName.slice(1)
    )
    app.directive(registerName, mouseDirectives[directiveName])
    // console.info(`已注册：${registerName}指令`)
  })
}
