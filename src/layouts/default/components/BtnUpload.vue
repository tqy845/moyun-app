<script lang="ts" setup>
import { UploadEventFromEnum, useFileStore, usePathStore, useUploadStore } from '@/stores'
import { CloseIcon } from 'tdesign-icons-vue-next'
import { useTemplateRef } from 'vue'

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  autoUpload: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
const uploadRef = useTemplateRef('uploadRef')
const uploadAreaHeight = ref(30)

const { children } = usePathStore()
const { fileList, maxConcurrentUploads, activeUploads, uploadedList, unUploadList } =
  storeToRefs(useUploadStore())
const { eventBatchUpload, eventAllCancel, eventAllContinue, eventAllPause } = useUploadStore()
const { setUploadRef, triggerUpload, showUploadArea } = useFileStore()

const isShowUploadList = computed(() => fileList.value.length)

onMounted(() => {
  setUploadRef(uploadRef.value)
})

const eventChange = (e: Event) => {
  const { target } = e
  const ele = target as HTMLInputElement
  if (ele?.getAttribute('from') === UploadEventFromEnum.outside) {
    showUploadArea()
  }
  const files = (target as HTMLInputElement)?.files
  if (files) {
    eventBatchUpload(files)
  }
  ele.value = ''
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault() // 防止默认的浏览器行为
  e.stopPropagation()
  // 显示复制的效果
  e.dataTransfer!.dropEffect = 'copy'
  ;(e.currentTarget! as HTMLDivElement).classList.add('drag-over')
  uploadAreaHeight.value = 150
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  const files = e.dataTransfer?.files
  if (files) {
    eventBatchUpload(files)
  }
  ;(e.currentTarget as HTMLDivElement).classList.remove('drag-over')
  uploadAreaHeight.value = 30
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  ;(e.currentTarget as HTMLDivElement).classList.remove('drag-over')
  uploadAreaHeight.value = 30
}
</script>

<template>
  <t-drawer
    data-tauri-drag-region
    :visible="visible"
    :on-overlay-click="() => emit('close')"
    placement="top"
    :size-draggable="true"
    @cancel="emit('close')"
    :footer="false"
    attach="body"
    mode="push"
    size="70vh"
    destroyOnClose
    showInAttachedElement
    :zIndex="999"
  >
    <div class="p-2 h-full">
      <div class="mb-2" data-tauri-drag-region>
        <div
          class="text-size-xl h-[30px] flex line-height-[30px] items-baseline justify-between"
          data-tauri-drag-region
        >
          <span
            ><em class="font-bold mr-2" data-tauri-drag-region>文件上传</em>
            <em class="text-size-sm" data-tauri-drag-region
              >将您的文件上传到“{{ children.peek()?.name }}”下</em
            ></span
          >
          <span class="">
            <t-popup :delay="[1000, 0]">
              <t-button theme="default" variant="text" class="!p-2" @click="emit('close')">
                <template #icon>
                  <CloseIcon />
                </template>
              </t-button>
              <template #content>
                <div class="text-size-xs">关闭上传界面（不影响上传）</div>
              </template>
            </t-popup>
          </span>
        </div>
      </div>

      <div class="flex justify-end items-center">
        <div class="text-small font-italic mr-4">
          并发:
          <span>{{ activeUploads }}</span>
          <span>/{{ maxConcurrentUploads }}</span>
        </div>

        <div class="text-small font-italic mr-4">
          任务数:
          <span>{{ uploadedList.length }}</span>
          <span>/{{ fileList.length }}</span>
        </div>

        <t-button
          v-show="fileList.some((MYFile) => MYFile.status === 'paused')"
          theme="primary"
          size="small"
          class="!mr-2"
          variant="text"
          :disabled="!fileList.length"
          @click="eventAllContinue"
        >
          <span class="text-small font-italic">全部恢复</span>
        </t-button>
        <t-button
          theme="default"
          size="small"
          class="!mr-2 !text-gray !hover:text-[#60a5fa]"
          variant="text"
          :disabled="!fileList.length"
          @click="eventAllPause"
          ><span class="text-small font-italic">全部暂停</span></t-button
        >
        <t-button
          theme="default"
          size="small"
          class="!mr-0 !text-gray !hover:text-[#60a5fa]"
          variant="text"
          :disabled="!fileList.length"
          @click="eventAllCancel"
          ><span class="text-small font-italic">全部取消</span></t-button
        >
      </div>

      <!-- 上传区域 -->
      <div class="flex flex-col items-center justify-center h-[57vh]">
        <!-- 上传组件 -->
        <input type="file" ref="uploadRef" v-show="false" multiple @change="eventChange" />
        <!-- 上传列表 -->
        <t-list
          v-show="isShowUploadList"
          class="w-full !h-full"
          :scroll="{ type: 'virtual' }"
          @dragover="() => {}"
          @dragleave="() => {}"
        >
          <!-- 渲染已上传的文件 -->
          <t-list-item v-for="(uploadFile, index) in uploadedList" :key="uploadFile.raw.name">
            <TheUploadItem :uploadFile="uploadFile" :index="index" />
          </t-list-item>
          <!-- 渲染未上传的文件 -->
          <t-list-item
            v-for="(uploadFile, index) in unUploadList"
            :key="uploadFile.raw.name"
            :data-first-item="index === 0 ? true : false"
          >
            <TheUploadItem :uploadFile="uploadFile" :index="index" />
          </t-list-item>
        </t-list>
        <div
          class="flex items-center mt-2 justify-center w-full border border-dashed border-color-gray hover:border-color-[#337af4] upload-area-transition"
          :style="{ height: isShowUploadList ? `${uploadAreaHeight}%` : '100%' }"
          @click.stop="() => triggerUpload()"
          @dragover="handleDragOver"
          @drop="handleDrop"
          @dragleave="handleDragLeave"
        >
          <span class="text-size-base"
            >“点击此区域”<span class="text-size-sm">或</span>“将文件拖拽到此区域”</span
          >
        </div>
      </div>
    </div>
  </t-drawer>
</template>

<style lang="scss">
// 上传组件内部使用了teleport移动到了body故须设置全局效果
.t-drawer__body.narrow-scrollbar {
  padding: 0 !important;
}
</style>

<style lang="scss" scoped>
.drag-over {
  border-color: #337af4; /* 拖拽区域的边框颜色 */
  background-color: rgba(51, 122, 244, 0.1); /* 拖拽时背景颜色 */
}

:deep(.t-progress__info) {
  width: 20px !important;
}

.upload-area-transition {
  transition: height 0.15s ease;
}
</style>
