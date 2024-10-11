<script lang="ts" setup>
import { FlagEnum } from '@/constants'
import { ContextMenu } from '@/models/ContextMenu';
import { usePathStore, useUploadStore } from '@/stores'

const { uploadedList, unUploadList, fileList } = storeToRefs(useUploadStore())
const { currentDir } = storeToRefs(usePathStore())

const options = ContextMenu.builder()
  .appendUploadArea()
  .appendDivider()
  .appendNewFolder("文件夹")
  .appendNewDocument("文本文档")
  .build()

const progress = computed(() => {
  if (unUploadList.value.length === 1) return unUploadList.value[0].uploadPercent
  return (uploadedList.value.length / fileList.value.length) * 100
})
</script>

<template>
  <t-dropdown class="" trigger="click">
    <t-button :disabled="currentDir.rawFolder.hasFlag(FlagEnum.SYSTEM)" class="!p-0 !px-1" theme="default"
      variant="text">
      <template #icon>
        <t-progress v-show="unUploadList.length" :percentage="progress" :size="25" :strokeWidth="4" color="#337af4"
          theme="circle" trackColor="white">
          <template #label>
            <span class="!text-[0.8rem] text-shadow relative top-[1px]">{{
              progress.toFixed(0)
            }}</span>
          </template>
        </t-progress>
        <TheIcon v-show="!unUploadList.length" :external="true" name="plus1" size="24" />
      </template>
      <div class="text-size-sm">上传/新建</div>
      <TheIcon name="chevron-down-s" style="top: 3px" />
    </t-button>
    <t-dropdown-menu>
      <t-dropdown-item v-for="item in options" :key="item.value" :divider="item.divider" :value="item.value"
        @click="item.action">
        <div class="flex items-center">
          <div class="!mr-2">
            <TheIcon :external="item.moreIcon" :name="item.prefixIcon || ''" />
          </div>
          <div>{{ item.name }}</div>
        </div>
      </t-dropdown-item>
    </t-dropdown-menu>
  </t-dropdown>
</template>

<style lang="scss" scoped></style>
