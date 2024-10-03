<script lang="ts" setup>
import { ref, onMounted, onUnmounted, useTemplateRef } from 'vue'
import File from '@/models/File/File.ts'
import Folder from '@/models/File/Folder.ts'

defineProps({
  dirFiles: Array as PropType<File[] | Folder[]>, // 接受 File 和 Folder 数组
  fileSize: {
    type: Number,
    default: 0
  }
})

const selectedFile = ref<File | Folder>()
const masonryGrid = useTemplateRef('masonryGrid')

const layoutMasonry = () => {
  const grid = masonryGrid.value
  if (!grid) return // 检查 grid 是否存在
  const items = Array.from(grid.children) as HTMLElement[]
  const columnCount = Math.max(Math.floor(grid.clientWidth / 300), 3)
  const columnHeights = Array(columnCount).fill(0)

  items.forEach((item) => {
    const minColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))
    const x = minColumnIndex * (grid.clientWidth / columnCount)
    const y = columnHeights[minColumnIndex]
    item.style.position = 'absolute'
    item.style.left = `${x}px`
    item.style.top = `${y}px`
    columnHeights[minColumnIndex] += item.clientHeight
  })

  grid.style.position = 'relative'
  grid.style.height = `${Math.max(...columnHeights)}px`
}

// 处理图片加载完成事件
const handleImageLoad = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.dataset.loaded = 'true'
}

// 监测所有图片加载完成的函数
const monitorImagesLoaded = () => {
  return new Promise<void>((resolve) => {
    const images = Array.from(masonryGrid.value.children).map((item: HTMLElement) => {
      return item.querySelector('img') // 获取每个项中的图片
    })

    const imagePromises = images.map((img: HTMLImageElement | null) => {
      return new Promise<void>((imgResolve) => {
        if (!img) {
          imgResolve() // 如果没有图片，直接resolve
        } else if (img.complete) {
          imgResolve() // 如果图片已经加载完成
        } else {
          img.addEventListener('load', () => imgResolve())
          img.addEventListener('error', () => imgResolve()) // 如果图片加载失败也resolve
        }
      })
    })

    Promise.all(imagePromises).then(() => {
      resolve()
    })
  })
}

onMounted(async () => {
  await monitorImagesLoaded()
  await nextTick(layoutMasonry)
  window.addEventListener('resize', layoutMasonry)
})

onUpdated(async () => {
  await nextTick(layoutMasonry)
})

onUnmounted(() => {
  window.removeEventListener('resize', layoutMasonry)
})
</script>

<template>
  <div ref="masonryGrid" class="!w-auto !relative">
    <div v-for="(file, index) in dirFiles" :key="index" class="masonry-item">
      <TheContextMenu :menu="selectedFile?.menuItems" @select="$event.action(selectedFile)">
        <t-image
          :alt="file.name"
          :src="`http://server001:9000/moyun-bucket-1/thumbnail/${encodeURIComponent(file.notExtName)}.webp`"
          class="mb-3 !bg-transparent"
          fit="scale-down"
          @contextmenu="selectedFile = file"
          @loadeddata="handleImageLoad"
          @dblclick.stop="file.open()"
        />
      </TheContextMenu>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.masonry-item {
  width: calc(100% / 3 - 1rem);
}
</style>
