<script lang="ts" setup>
import { ContentMenuItem, FlagEnum } from '@/constants'
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
  <TheContextMenu :menu="folderRef?.menuItems" @select="handleSelected">
    <t-menu-item
      v-for="folder in menus"
      :key="folder.id"
      :value="folder.id"
      @click="handleClick($event, folder)"
      @contextmenu="folderRef = folder"
    >
      <template #icon>
        <div class="mr-1">
          <TheIcon
            class="demo"
            name="pin-filled"
            style="width: 14px; position: absolute; top: 8px; right: 5px; color: #6b6b6b"
          />
          <TheIcon :name="folder.icon" external size="medium" />
        </div>
      </template>
      {{ folder.name }}
    </t-menu-item>
  </TheContextMenu>
</template>

<style lang="scss" scoped></style>
