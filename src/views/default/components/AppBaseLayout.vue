<script lang="ts" setup>
import Folder from '@/models/File/Folder'
import File from '@/models/File/File'

defineProps({
  dirFiles: Array as PropType<File[] | Folder[]>,
  fileSize: {
    type: Number,
    default: 0
  }
})

const selectedFile = ref<File | Folder>()
</script>

<template>
  <div
    :style="{
      'grid-template-columns': `repeat(auto-fill, minmax(${fileSize + 10}px, 1fr))`
    }"
    class="mo-yun-container h-[0] !box-border"
  >
    <div v-for="(file, index) in dirFiles" :key="index">
      <TheContextMenu :menu="selectedFile?.getMenuItems()" @select="$event.action(selectedFile)">
        <TheFile
          :file="file"
          class="ma-1"
          @contextmenu="selectedFile = file"
          @click.stop="selectedFile = file"
          @dblclick.stop="file.open()"
        />
      </TheContextMenu>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mo-yun-container {
  display: grid;
  grid-gap: 1px;
}
</style>
