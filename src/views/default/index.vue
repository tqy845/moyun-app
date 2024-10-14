<script lang="ts" setup>
import { mouseUtils } from '@/utils/functions'
import { MOUSE_DIRECTION } from '@/utils/functions/mouse-functions'
import { useFileStore, useSettingStore, usePathStore, useDirStore, useFileMapStore } from '@/stores'
import IconMode from './components/IconMode.vue'
import ListMode from './components/ListMode.vue'
import { ContentMenuItem, MoYunModeEnum } from '@/constants'
import TheContextMenu from '@/components/TheContextMenu.vue'
import { resetMode } from '@/stores/modules/file/helper'
import { ContextMenu } from '@/models/ContextMenu'

const containerRef = ref<HTMLElement>()
const { clearSelected } = usePathStore()
const { currentDir, currentActionFiles, currentDirFiles, currentDirSelectedFiles } =
  storeToRefs(usePathStore())
const { isDrag } = storeToRefs(useDirStore())
const controlState = useKeyModifier('Control')
const { isOutside } = useMouseInElement(containerRef)
const { focused } = useFocus(containerRef)
const { getItemById } = useFileMapStore()

const { mode } = storeToRefs(useFileStore())
const settingStore = useSettingStore()

// 返回当前内容布局模式
const currentMode = computed(() => (mode.value !== MoYunModeEnum.LIST ? IconMode : ListMode))

// 拖拽事件
let animationFrameId: number
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragSelectionBox = ref({ top: 0, left: 0, width: 0, height: 0 })
/**
 * 绑定鼠标滚动实现修改Mode
 */
const eventResetSize = () => {
  containerRef.value!.addEventListener('wheel', (event: WheelEvent) => {
    if (!focused.value) focused.value = true
    if (isOutside.value) return
    if (!controlState.value) return
    mouseUtils.scrollWheel(event, (direction: number) => {
      const scrollValue = direction === MOUSE_DIRECTION.DOWN ? 10 : -10
      settingStore.fileSize += scrollValue
      resetMode()
    })
  })
  containerRef.value!.focus()
}

const isPhotoAlbum = computed(() => currentDir.value.rawFolder.name === '图库')
const isDustbin = computed(() => currentDir.value.rawFolder.name === '回收站')

const createMenu = () => {
  if (isPhotoAlbum.value) {
    return ContextMenu.builder().appendRefresh().build()
  }
  if (isDustbin.value) {
    return ContextMenu.builder().appendRefresh().build()
  }

  const menus = ContextMenu.builder()
    .appendRefresh()
    .appendUpload()
    .appendNewFolder()
    .appendNewDocument()
    .build()

  if (currentActionFiles.value.length) {
    // 处理复制、剪切
    const copyingArr = currentActionFiles.value.filter((file) => file.isCopying)
    const cutingArr = currentActionFiles.value.filter((file) => file.isCutting)
    if (copyingArr.length || cutingArr.length) {
      menus.push(...ContextMenu.builder().appendPaste().build())
    }
  }

  return menus
}

const menu = ref<Array<ContentMenuItem>>([])
watchEffect(() => {
  menu.value.clear()
  menu.value.push(...createMenu())
})
const eventMousedown = (event: MouseEvent) => {
  getCurrentDirFileRect()
  isDragging.value = true
  dragStartX.value = event.clientX
  dragStartY.value = event.clientY
  dragSelectionBox.value = { top: dragStartY.value, left: dragStartX.value, width: 0, height: 0 }
}

const eventMouseup = () => {
  if (isDragging.value) {
    dragSelectionBox.value = { top: 0, left: 0, width: 0, height: 0 }
  }
  isDragging.value = false
}

const eventMousemove = (event: MouseEvent) => {
  // console.log('移动')
  const deltaX = Math.abs(event.clientX - dragStartX.value)
  const deltaY = Math.abs(event.clientY - dragStartY.value)

  if ((isDragging.value && deltaX > 3) || deltaY > 3) {
    isDrag.value = true
    const currentX = event.clientX
    const currentY = event.clientY

    const width = Math.abs(currentX - dragStartX.value)
    const height = Math.abs(currentY - dragStartY.value)
    const left = Math.min(currentX, dragStartX.value)
    const top = Math.min(currentY, dragStartY.value)

    dragSelectionBox.value = { top, left, width, height }

    // 销毁上一次的动画帧，确保只执行最新的
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }

    // 使用 requestAnimationFrame 调用 selectFilesInArea
    animationFrameId = requestAnimationFrame(() => {
      selectFilesInArea()
    })
  }
}

const rectMapCache = new Map<string, DOMRect>()

// 选择拖拽区域内的文件
const selectFilesInArea = () => {
  if (!isDragging.value) {
    return
  }
  const selectionBox = dragSelectionBox.value
  const selectedSet = new Set<string>() // 用于记录当前选中的文件 id + type

  // 遍历所有文件，检查是否在选区内
  currentDirFiles.value.forEach((file) => {
    const rect = rectMapCache.get(file.id + file.__prototype__.type)
    console.log('rect = ', rect, file.el)

    if (!rect) return

    const isInSelection =
      rect.left < selectionBox.left + selectionBox.width &&
      rect.right > selectionBox.left &&
      rect.top < selectionBox.top + selectionBox.height &&
      rect.bottom > selectionBox.top

    if (isInSelection) {
      // 如果文件在选区内且未被选中，则添加选中
      const existingFile = currentDirSelectedFiles.value.find(
        (item) => item.id === file.id && item.__prototype__.type === file.__prototype__.type
      )
      if (!existingFile) {
        currentDirSelectedFiles.value.push(getItemById(file.id, file.__prototype__.type))
      }
      selectedSet.add(file.id + file.__prototype__.type) // 记录已选中的文件
    }
  })

  // 取消不在新选区内的文件
  currentDirSelectedFiles.value = currentDirSelectedFiles.value.filter((item) => {
    const fileKey = item.id + item.__prototype__.type
    // 如果文件不在选区内，则从选中的文件列表中移除
    return selectedSet.has(fileKey)
  })
}

const _clearSelected = () => {
  if (isDrag.value) {
    isDrag.value = false
    return
  }
  clearSelected()
}

const getCurrentDirFileRect = () => {
  currentDirFiles.value.map((file) => {
    rectMapCache.set(file.id + file.__prototype__.type, file.el?.getBoundingClientRect())
  })
}

onMounted(() => {
  eventResetSize()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId)
})
</script>
<template>
  <!-- {{ currentDirSelectedFiles }} -->
  <div
    ref="containerRef"
    class="h-full w-full pa-1 overflow-y-hidden"
    @mousedown.stop="eventMousedown"
    @mousemove.stop="eventMousemove"
    @mouseup.stop="eventMouseup"
  >
    <TheContextMenu :menu="menu" class="h-full" @select="$event?.action()">
      <component
        :is="currentMode"
        @click.stop="_clearSelected"
        @contextmenu.stop="_clearSelected"
      />
    </TheContextMenu>
    <!-- 拖拽选取框 -->
    <div
      v-if="isDragging"
      class="pos-absolute pointer-events-none"
      :style="{
        top: dragSelectionBox.top + 'px',
        left: dragSelectionBox.left + 'px',
        width: dragSelectionBox.width + 'px',
        height: dragSelectionBox.height + 'px',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        border: '1px solid #007bff'
      }"
    ></div>
  </div>
</template>

<style lang="scss" scoped></style>
