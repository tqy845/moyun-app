<script lang="ts" setup>
import { usePathStore } from '@/stores'
const { currentDirSelectedFiles } = usePathStore()
</script>

<template>
  <div v-show="currentDirSelectedFiles.length">
    <t-button variant="text" class="!m-0 !mx-1.5 pa-2">
      <template #icon>
        <TheIcon name="git-merge" />
      </template>
      版本控制
    </t-button>
  </div>
</template>

<style lang="scss" scoped></style>
