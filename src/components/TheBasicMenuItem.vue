<script lang="ts" setup>
/*
 * TheQuick
 * 组件用途：
 * 创建日期： 2024/03/18
 * 作者： 谭期元
 */
import { CONTEXT_MENU_ITEM } from '@/constants'
import Folder from '@/models/File/Folder'

defineProps({
  menus: Array<Folder>
})

const folderRef = ref<Folder>()

const handleClick = (_: unknown, folder: Folder) => {
  // console.log('点击了', _, folder)
  folder.open()
}

const handleSelected = (item: CONTEXT_MENU_ITEM) => {
  item.action(folderRef.value)
}

const executed = async () => {}

onMounted(executed)
</script>

<template>
  <!-- 普通目录-->
  <TheContextMenu :menu="folderRef?.menuItems" @select="handleSelected">
    <t-menu-item
      v-for="(folder, index) in menus"
      :key="index"
      :value="folder.id"
      @click="handleClick($event, folder)"
      @contextmenu="folderRef = folder"
    >
      <template #icon>
        <TheIcon :name="folder.icon" external />
      </template>
      {{ folder.name }}
    </t-menu-item>
  </TheContextMenu>
</template>

<style lang="scss" scoped></style>
