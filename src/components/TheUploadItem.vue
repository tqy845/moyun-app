<script lang="ts" setup>
import { useUploadStore } from '@/stores'
import { UploadFile } from '@/constants'

const { eventContinue, eventPause, eventRemove, eventCancel, eventRetry } = useUploadStore()

defineProps({
  uploadFile: {
    type: Object as PropType<UploadFile>,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

const getProgressColor = (uploadFile: UploadFile) => {
  if (uploadFile.status === 'error') return '#f87171'
  if (uploadFile.status === 'uploaded') return '#00A870'
  if (uploadFile.status === 'paused') return '#9ca3af'
  return { from: '#60a5fa', to: '#00A870' }
}
</script>

<template>
  <div class="w-[56vw] text-shadow">{{ uploadFile.no }}.{{ uploadFile.raw.name }}</div>
  <div class="w-[35vw]">
    <div class="w-auto flex">
      <span class="w-[70px] flex justify-end">
        <span v-if="uploadFile.status === 'await'" class="text-gray"> 等待上传： </span>
        <span v-else-if="uploadFile.status === 'calcHash'" class="text-gray"> 正在检查： </span>
        <span v-else-if="uploadFile.status === 'paused'" class="text-gray"> 已暂停： </span>
        <span v-else-if="uploadFile.status === 'uploaded'" class="text-[#00A870]">上传完成：</span>
        <span v-else-if="uploadFile.status === 'error'" class="text-red">上传失败：</span>
        <span v-else class="text-blue"> 正在上传： </span>
      </span>
      <t-progress
        :color="getProgressColor(uploadFile)"
        :percentage="uploadFile.uploadPercent"
        :status="'active'"
        class="!mr-3 w-[100px]"
        theme="line"
      />

      <span class="ml-3 flex justify-center">
        <t-link
          v-show="uploadFile.status === 'error'"
          class="mr-2"
          hover="color"
          theme="primary"
          @click.stop="eventRetry(uploadFile)"
          >重试
        </t-link>

        <t-link
          v-show="!['uploaded', 'error', 'paused'].includes(uploadFile.status)"
          class="mr-2"
          hover="color"
          theme="default"
          @click.stop="eventPause(uploadFile)"
          >暂停
        </t-link>

        <t-link
          v-show="uploadFile.status === 'paused'"
          class="mr-2"
          hover="color"
          theme="primary"
          @click.stop="eventContinue(uploadFile)"
          >继续
        </t-link>

        <t-link
          v-show="uploadFile.status !== 'uploaded'"
          class="mr-2 !text-gray !hover:text-[#60a5fa]"
          hover="color"
          theme="default"
          @click.stop="eventCancel(uploadFile)"
          >取消
        </t-link>

        <t-link
          v-show="uploadFile.status === 'uploaded'"
          class="mr-2 !text-gray !hover:text-[#60a5fa]"
          hover="color"
          theme="default"
          @click.stop="eventRemove(uploadFile)"
          >删除记录
        </t-link>
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
