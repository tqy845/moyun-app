<script lang="ts" setup>
import { useFileStore } from '@/stores'
import { vOnClickOutside } from '@vueuse/components'

const props = defineProps(['file', 'index'])

const inputRef = ref()
const fileStore = useFileStore()

const handleRenamed = () => {
  const value = inputRef.value?.inputRef.value
  const file = props.file
  file.name = value
  fileStore.renamed(props.index, file)
}
</script>

<template>
  <t-input
    class="w-full"
    ref="inputRef"
    autofocus
    v-element-select-input-content="{
      begin: 0,
      end: file.name.includes('.') ? file.name.lastIndexOf('.') : 0
    }"
    v-on-click-outside="handleRenamed"
  ></t-input>
</template>

<style lang="scss" scoped></style>
