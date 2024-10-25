<script lang="ts" setup>
import { useDirStore, useSettingStore } from '@/stores'
import { MoYunAssembleEnum } from '@/constants'
import {DropdownOption} from "tdesign-vue-next";

const { switchFolderSelect, readPhotoAlbum } = useDirStore()
const { photoAlbumAssembleOptions, photoAlbumParentId, currentSelectedPhotoAlbum } =
  storeToRefs(useSettingStore())

const eventToggle = async ({ value }: DropdownOption) => {
  if (value === MoYunAssembleEnum.CUSTOM) {
    // 选择目录
    switchFolderSelect(true)
    return
  }
  photoAlbumParentId.value = value as MoYunAssembleEnum
  await readPhotoAlbum()
}
</script>

<template>
  <t-dropdown maxColumnWidth="200px" trigger="click" @click="eventToggle">
    <t-button class="!p-0 !px-1" variant="text">
      <template #icon>
        <TheIcon name="image" size="16" />
      </template>
      集合：{{ currentSelectedPhotoAlbum?.content }}
      <TheIcon class="text-grey" name="chevron-down-s" style="top: 3px" />
    </t-button>
    <t-dropdown-menu>
      <t-dropdown-item
        v-for="(item, index) in photoAlbumAssembleOptions"
        :key="index"
        :active="photoAlbumParentId === item.value"
        :divider="item.divider"
        :value="item.value"
      >
        <div class="flex items-center">
          <div class="mr-2">
            <TheIcon v-if="photoAlbumParentId === item.value" name="play" />
            <t-icon v-else></t-icon>
          </div>
          <div class="text-truncate">{{ item.content }}</div>
        </div>
      </t-dropdown-item>
    </t-dropdown-menu>
  </t-dropdown>
</template>

<style lang="scss" scoped></style>
