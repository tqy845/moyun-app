<script lang="ts" setup>
import { useFileStore } from '@/stores'

const { copyVisibleRef, copyOptionsRef } = storeToRefs(useFileStore())
</script>

<template>
  <transition name="active">
    <div class="pos-fixed left-5 top-5" v-if="copyVisibleRef">
      <t-notification
        v-for="i in 1"
        :key="i"
        theme="info"
        :title="`正在复制文件`"
        :duration="0"
        @duration-end="copyVisibleRef = false"
      >
        <template #content>
          <t-progress theme="plump" :percentage="copyOptionsRef.progress" />
        </template>
      </t-notification>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
.active-enter-active,
.active-leave-active {
  transition: transform 0.2s ease;
}
.active-enter-from,
.active-leave-to {
  transform: translateX(-100%);
}
.active-enter-to,
.active-leave {
  transform: translateX(0);
}
</style>
