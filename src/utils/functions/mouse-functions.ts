/**
 * @module mouse-functions
 * @description 该模块用于处理鼠标事件
 * @version 0.1.0
 * @author 叫我白天.
 */

import { ComputedRef, Ref } from 'vue'

/**
 * 鼠标方向常量
 */
export enum MOUSE_DIRECTION {
  UP = 1,
  DOWN = -1
}

/**
 * 鼠标滚轮事件
 * @param event - 滚动事件
 * @param callback - 回调函数
 * @returns {MOUSE_DIRECTION} - 滚动方向
 */
function scrollWheel(event: WheelEvent, callback: (direction: number) => void) {
  // 获取滚动的距离，注意在现代浏览器中使用 deltaY
  const delta = event.deltaY || -event.detail

  // 判断滚轮方向，1表示向上滚动，-1表示向下滚动
  const direction = delta > 0 ? MOUSE_DIRECTION.UP : MOUSE_DIRECTION.DOWN

  // 调用回调函数，并传递滚动方向
  if (typeof callback === 'function') {
    callback(direction)
  }

  // 阻止默认滚轮事件
  event.preventDefault()
}

/**
 * 禁用右键菜单
 */
function disableContextMenu() {
  window?.document.addEventListener('contextmenu', function (e) {
    e.preventDefault()
  })
}

/**
 * 双击事件
 */
function dblclick(timeout: number = 300) {
  let clickTimer: number | null
  return (callback: Function) => {
    if (clickTimer) {
      clearTimeout(clickTimer)
      clickTimer = null
      callback()
    } else {
      clickTimer = setTimeout(() => {
        clickTimer = null
      }, timeout)
    }
  }
}

function contextMenu(
  containerRef: Ref<HTMLElement>,
  innerSize: ComputedRef<{ width: number; height: number }>
) {
  const x = ref(0)
  const y = ref(0)
  const visible = ref(false)

  const showMenu = async (e) => {
    // 本地化
    if (e.target.offsetParent?.getAttributeNames().includes('data-colkey')) {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    visible.value = true

    await nextTick()
    const contextMenuEle = window.document.querySelector('body>div>.context-menu')! as HTMLElement
    const { offsetWidth, offsetHeight } = contextMenuEle
    const { width, height } = innerSize.value

    if (e.pageX >= width - offsetWidth) {
      x.value = width - offsetWidth - 10
    }
    // else if (e.pageX <= offsetWidth + 10) {
    //   x.value = offsetWidth
    // }
    else {
      x.value = e.pageX
    }

    if (e.pageY >= height - offsetHeight) {
      y.value = height - offsetHeight - 10
    } else if (e.pageY <= offsetHeight + 10) {
      y.value = offsetHeight
    } else {
      y.value = e.pageY
    }
  }

  const closeMenu = () => {
    visible.value = false
  }

  onMounted(() => {
    containerRef.value.addEventListener('contextmenu', showMenu)
    window.addEventListener('click', closeMenu, true)
    window.addEventListener('contextmenu', closeMenu, true)
  })

  onUnmounted(() => {
    containerRef.value?.removeEventListener('contextmenu', showMenu)
  })

  return {
    x,
    y,
    visible
  }
}

const mouseUtils: Record<string, Function> = {
  scrollWheel,
  disableContextMenu,
  dblclick,
  contextMenu
}

export default mouseUtils
