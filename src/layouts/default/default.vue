<script lang="ts" setup>
import TheAside from './TheAside.vue'
import TheHeader from './TheHeader.vue'
import { useFileStore, useSettingStore, useSystemStore, useUserStore } from '@/stores'
import { settingUpdate } from '@/stores/modules/setting/helper'
import BtnUpload from './components/BtnUpload.vue'
import TheSelectFolder from './components/TheSelectFolder.vue'

const contentRef = ref()
const systemStore = useSystemStore()
const { showUploadArea, hideUploadArea } = useFileStore()
const { _isShowUploadArea } = storeToRefs(useFileStore())

const userStore = useUserStore()
const settingStore = useSettingStore()

const handleUpdate = useDebounceFn(({ height, width }: { height: number; width: number }) => {
  systemStore.updateSize(width, height)
}, 30)

function dragenterEvent(event: any) {
  event?.stopPropagation()
  event.preventDefault()
  if (!event.fromElement) {
    showUploadArea()
  }
}

function dragoverEvent(event: any) {
  event?.stopPropagation()
  event.preventDefault()
}

function dragleaveEvent(event: any) {
  event?.stopPropagation()
  event.preventDefault()
}

function dropEvent(event: any) {
  event?.stopPropagation()
  event.preventDefault()
  // displayChsFile(files);
}

const executed = () => {
  const { offsetWidth, offsetHeight } = contentRef.value.$el
  systemStore.updateSize(offsetWidth, offsetHeight)
}

onMounted(executed)

// 监听setting变化
settingStore.$subscribe(settingUpdate)

</script>
<template>
  <t-layout
    v-element-size-observer="handleUpdate"
    class="h-full !bg-gradient-to-r from-[#d9e1ff] to-[#eee]"
    @dragenter="dragenterEvent"
    @dragleave="dragleaveEvent"
    @dragover="dragoverEvent"
    @drop="dropEvent"

  >
    <t-header class="!bg-transparent" height="auto" style="">
      <TheHeader />
    </t-header>
    <t-layout>
      <t-aside :style="{ height: `${systemStore.height - 112}px` }" width="auto">
        <TheAside class="border-r-1 border-r-solid border-r-[#f2f5f5]" />
      </t-aside>
      <t-content id="m-main" ref="contentRef" class="overflow-y-auto overflow-x-hidden bg-white">
        <!-- 主视图： -->
        <RouterView v-slot="{ Component }">
          <KeepAlive>
            <component :is="Component" />
          </KeepAlive>
        </RouterView>
        <!-- 其他组件： -->
        <!-- 上传组件 -->
        <BtnUpload :visible="_isShowUploadArea" @close="hideUploadArea" />
        <!-- 预览组件-->
        <ThePreview />
        <TheProfile :visible="userStore.profile" @close="userStore.profile = false" />
        <!--  选择文件夹组件-->
        <TheSelectFolder />
   
      </t-content>
    </t-layout>
  </t-layout>
</template>
