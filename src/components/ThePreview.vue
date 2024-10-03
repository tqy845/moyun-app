<script lang="ts" setup>
import { usePreviewStore } from '@/stores'
import { fileUtils } from '@/utils/functions'
import { postPreviewUrl } from '@/api/file.ts'
import { useTemplateRef } from 'vue'

const { visible, file } = storeToRefs(usePreviewStore())
const urlRef = ref('')
watch(file, async () => {
  if (file.value) {
    const { url } = await postPreviewUrl({
      filename: file.value.name,
      hash: file.value.hash
    })
    urlRef.value = url
  }
})

const eventClose = () => {
  file.value = null
  urlRef.value = ''
}
</script>

<template>
  <t-dialog
    v-model:visible="visible"
    :footer="false"
    :header="file?.name"
    draggable
    placement="center"
    width="80%"
    @close="eventClose"
  >
    <div v-if="file">
      <t-image-viewer
        v-if="fileUtils.isImageType(file?.extension)"
        :images="[{ thumbnail: urlRef, mainImage: urlRef, download: false }]"
      >
        <template #trigger="{ open }">
          <div class="select-none">
            <t-image
              :alt="file?.name"
              :draggable="false"
              :src="urlRef"
              class="!bg-transparent h-[60vh]"
              fit="scale-down"
              ondragstart="return false;"
              @click="open"
            />
          </div>
        </template>
      </t-image-viewer>
      <div v-else-if="fileUtils.isVideoType(file?.extension)" class="select-none">
        <video :src="urlRef" autoplay class="w-auto h-full" controls />
      </div>
      <div v-else-if="fileUtils.isAudioType(file?.extension)" class="select-none">
        <audio ref="audioRef" :src="urlRef" autoplay controls></audio>
      </div>
      <div v-else-if="fileUtils.isDocumentType(file?.extension)">
        {{ urlRef }}
      </div>
      <div v-else>
        <span class="text-xl"> 不支持的文件类型，请下载后查看 </span>
      </div>
    </div>
  </t-dialog>
</template>

<style lang="scss" scoped></style>
