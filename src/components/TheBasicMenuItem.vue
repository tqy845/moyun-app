<script lang="ts" setup>
import { ContentMenuItem } from '@/constants'
import Folder from '@/models/File/Folder'

defineProps({
  menus: Array<Folder>
})

const folderRef = ref<Folder>()

const handleClick = (_: unknown, folder: Folder) => {
  folder.open()
}

const handleSelected = (item: ContentMenuItem) => {
  item.action(folderRef.value)
}

const executed = async () => {}

onMounted(executed)
</script>

<template>
  <!-- 普通目录-->
  <TheContextMenu :menu="folderRef?.getMenuItems()" @select="handleSelected">
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
