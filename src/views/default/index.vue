<script lang="ts" setup>
import { mouseUtils } from '@/utils/functions'
import { MOUSE_DIRECTION } from '@/utils/functions/mouse-functions'
import {
  useFileStore,
  useSettingStore,
  usePathStore,
  useDirStore,
  useFileRectMapStore
} from '@/stores'
import IconMode from './components/IconMode.vue'
import ListMode from './components/ListMode.vue'
import { ContentMenuItem, MoYunModeEnum } from '@/constants'
import TheContextMenu from '@/components/TheContextMenu.vue'
import { resetMode } from '@/stores/modules/file/helper'
import { ContextMenu } from '@/models/ContextMenu'
import { cloneDeep } from 'lodash'

const containerRef = ref<HTMLElement>()
const { calcNewData, getItemById } = useFileRectMapStore()
const { clearSelected } = usePathStore()
const { currentDir, currentActionFiles, currentDirFiles, currentDirSelectedFiles } =
  storeToRefs(usePathStore())
const { isDrag } = storeToRefs(useDirStore())
const controlState = useKeyModifier('Control')
const { isOutside } = useMouseInElement(containerRef)
const { focused } = useFocus(containerRef)

const { mode } = storeToRefs(useFileStore())
const settingStore = useSettingStore()

// 返回当前内容布局模式
const currentMode = computed(() => (mode.value !== MoYunModeEnum.LIST ? IconMode : ListMode))

// 拖拽事件
let fileSelectorWorker: Worker
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragSelectionBox = ref({ top: 0, left: 0, width: 0, height: 0 })
let animationFrameId: number | null = null

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

onMounted(eventResetSize)
// onUpdated(() => {
//     resetMode()
// })

const createWorker = () => {
  fileSelectorWorker = new Worker(new URL('@/workers/fileSelector.js', import.meta.url))
  fileSelectorWorker.onmessage = (event) => {
    const selectedFiles = event.data
    // 更新 selectedFiles 状态
    // console.log(selectedFiles)
    console.log(3)
    currentDirSelectedFiles.value.clear()
    selectedFiles.forEach(({ id, extension }: { id: number; extension: string }) => {
      currentDirSelectedFiles.value.push(
        currentDirFiles.value.find((file) => file.id === id && file.extension === extension)
      )
    })
  }
}

const eventMousedown = (event: MouseEvent) => {
  console.log('按下')
  isDragging.value = true
  dragStartX.value = event.clientX
  dragStartY.value = event.clientY
  dragSelectionBox.value = { top: dragStartY.value, left: dragStartX.value, width: 0, height: 0 }
}

const eventMouseup = () => {
  console.log('松开')
  if (isDragging.value) {
    dragSelectionBox.value = { top: 0, left: 0, width: 0, height: 0 }
  }
  isDragging.value = false
  fileSelectorWorker?.terminate?.()
}

const eventMousemove = (event: MouseEvent) => {
  console.log('移动')
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
    console.log(0)

    dragSelectionBox.value = { top, left, width, height }

    // 销毁上一次的动画帧，确保只执行最新的
    // if (animationFrameId) {
      // cancelAnimationFrame(animationFrameId)
    // }

    // 使用 requestAnimationFrame 调用 selectFilesInArea
    // animationFrameId = requestAnimationFrame(() => {
      selectFilesInArea()
    // })
  }
}

// 选择拖拽区域内的文件
const selectFilesInArea = () => {
  if (!isDragging.value) {
    return
  }
  fileSelectorWorker?.terminate?.()
  createWorker()
  console.log(1)

  const selectionBox = cloneDeep(dragSelectionBox.value)
  const files = currentDirFiles.value.map((file) => ({
    id: file.id,
    extension: file.extension,
    // rect: document.querySelector(`[data-id='${file.id}']`)?.getBoundingClientRect() // 使用缓存的矩形信息
    rect: getItemById(file.id) // 使用缓存的矩形信息
  }))
  console.log(2)

  console.log(files)
  fileSelectorWorker.postMessage({ selectionBox, files })
}

const _clearSelected = () => {
  if (isDrag.value) {
    isDrag.value = false
    return
  }

  clearSelected()
}

onMounted(calcNewData)
</script>
<template>
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
