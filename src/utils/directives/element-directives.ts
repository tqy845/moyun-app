/**
 * @module element-directives
 * @description 该模块用于元素相关的指令
 * @version 0.1.0
 * @author 叫我白天.
 */
import { App, DirectiveBinding } from 'vue'

export const sizeObserver = {
  mounted(el: HTMLElement & { _resizeObserver_: ResizeObserver }, binding: DirectiveBinding) {
    const callback = binding.value as Function
    const observer = new ResizeObserver(() => {
      callback?.({ height: el.offsetHeight, width: el.offsetWidth })
    })
    observer.observe(el)

    // 在组件销毁时停止观察
    el._resizeObserver_ = observer
  },
  unmounted(el: any) {
    // 解绑元素时的处理逻辑
    const observer = el._resizeObserver_
    if (observer) {
      observer.disconnect()
      delete el._resizeObserver_
    }
  }
}

/**
 * 选择文本框内容
 * @param {begin: number, end: number} - 文本框内容选择范围
 */
export const selectTextareaContent = {
  mounted(
    el: HTMLElement & { _selectContentObserver_: MutationObserver },
    binding: DirectiveBinding
  ) {
    const { begin, end } = (binding.value as {
      begin: number
      end: number
    }) || { begin: 0, end: 0 }
    const element = (
      el.tagName.toUpperCase() === 'TEXTAREA' ? el : el.querySelector('textarea')
    ) as HTMLTextAreaElement
    setTimeout(() => {
      if (document.activeElement !== element) {
        element.focus()
      }
      if (end) {
        element.setSelectionRange(begin, end < 0 ? element.value.length + end : end)
      } else {
        element.select()
      }
    }, 30)
  }
}

/**
 * 选择输入框内容
 * @param {begin: number, end: number} - 文本框内容选择范围
 */
export const selectInputContent = {
  mounted(
    el: HTMLElement & { _selectContentObserver_: MutationObserver },
    binding: DirectiveBinding
  ) {
    const { begin, end } = (binding.value as {
      begin: number
      end: number
    }) || { begin: 0, end: 0 }
    const element = (
      el.tagName.toUpperCase() === 'INPUT' ? el : el.querySelector('input')
    ) as HTMLInputElement
    setTimeout(() => {
      if (document.activeElement !== element) {
        element.focus()
      }
      if (end) {
        element.setSelectionRange(begin, end < 0 ? element.value.length + end : end)
      } else {
        element.select()
      }
    }, 30)
  }
}

const elementDirectives: Record<string, Object> = {
  sizeObserver,
  selectTextareaContent,
  selectInputContent
}

/**
 * 注册元素指令
 * @param {App} app - Vue应用实例
 * @param {string} prefix - 前缀（可选，默认为"element"）
 */
export default function registerElementDirectives(app: App, prefix: string = 'element') {
  Object.keys(elementDirectives).forEach((directiveName) => {
    const registerName = prefix.concat(
      directiveName.charAt(0).toUpperCase() + directiveName.slice(1)
    )
    app.directive(registerName, elementDirectives[directiveName])
    // console.info(`已注册：${registerName}指令`)
  })
}
