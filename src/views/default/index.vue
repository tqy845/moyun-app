<script lang="ts" setup>
import { mouseUtils } from '@/utils/functions'
import { MOUSE_DIRECTION } from '@/utils/functions/mouse-functions'
import { useFileStore, useSettingStore, usePathStore } from '@/stores'
import IconMode from './components/IconMode.vue'
import ListMode from './components/ListMode.vue'
import { CONTEXT_MENU_ITEM, MoYunModeEnum } from '@/constants'
import TheContextMenu from '@/components/TheContextMenu.vue'
import { resetMode } from '@/stores/modules/file/helper'
import { ContextMenu } from '@/models/ContextMenu'

const containerRef = ref<HTMLElement>()

const { clearSelected } = usePathStore()
const { currentDir } = storeToRefs(usePathStore())
const controlState = useKeyModifier('Control')
const { isOutside } = useMouseInElement(containerRef)
const { focused } = useFocus(containerRef)

const { mode } = storeToRefs(useFileStore())
const settingStore = useSettingStore()

// 返回当前内容布局模式
const currentMode = computed(() => (mode.value !== MoYunModeEnum.LIST ? IconMode : ListMode))

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

  return ContextMenu.builder()
    .appendRefresh()
    .appendUpload()
    .appendNewFolder()
    .appendNewDocument()
    .build()
}

const menu = ref<Array<CONTEXT_MENU_ITEM>>([])
watchEffect(() => {
  menu.value.clear()
  menu.value.push(...createMenu())
})

onMounted(eventResetSize)
onUpdated(resetMode)
</script>
<template>
  <div ref="containerRef" class="h-full w-full pa-1 overflow-y-hidden">
    <TheContextMenu :menu="menu" class="h-full" @select="$event?.action()">
      <component :is="currentMode" @click="clearSelected()" />
    </TheContextMenu>
  </div>
</template>

<style lang="scss" scoped></style>
