<script lang="ts" setup>
import { useFileStore, useSettingStore, useSystemStore, usePathStore, useDirStore } from '@/stores'
import File from '@/models/File/File'
import Folder from '@/models/File/Folder'
import { useTemplateRef } from 'vue'
import AppBaseLayout from '@/views/default/components/AppBaseLayout.vue'
import AppFallsLayout from '@/views/default/components/AppFallsLayout.vue'

const iconModeRef = useTemplateRef('iconModeRef')
const systemStore = useSystemStore()
const fileStore = useFileStore()
const settingStore = useSettingStore()
const { isBaseLayout } = storeToRefs(useDirStore())
const { currentDirFiles, currentDirSelectedFiles, isLoading, isSearchMode } =
  storeToRefs(usePathStore())

const dirFiles = computed(() => currentDirFiles.value as unknown as Array<File | Folder>)

const { control, x, c } = useMagicKeys()

watchEffect(() => {
  if (control.value && x.value) {
    // 对当前选中的文件开启剪切操作
    currentDirSelectedFiles.value.forEach((file) => (file.isCutting = true))
  } else if (control.value && c.value) {
    // 对当前选中的文件开启复制操作
    currentDirSelectedFiles.value.forEach((file) => (file.isCopying = true))
  }
})

// 订阅监听 - 新建文件/文件夹
fileStore.$subscribe(async ({ type }: { type: string }) => {
  if (type === 'patch function' && iconModeRef.value?.scrollTop) {
    await nextTick()
    iconModeRef.value.scrollTop = iconModeRef.value?.scrollHeight
  }
})
</script>

<template>
  <div
    v-if="dirFiles.length"
    ref="iconModeRef"
    :style="{ height: systemStore.contentHeight + 'px' }"
    class="overflow-y-auto overflow-x-hidden pa-1"
  >
    <div v-if="isBaseLayout">
      <AppBaseLayout :dirFiles="dirFiles" :fileSize="settingStore.fileSize" />
    </div>
    <div v-else>
      <AppFallsLayout :dirFiles="dirFiles" :fileSize="settingStore.fileSize" />
    </div>
  </div>

  <TheEmpty v-else :empty="dirFiles.length === 0 && !isSearchMode" :loading="isLoading" />
</template>

<style lang="scss" scoped>
/* 样式代码 */
</style>
