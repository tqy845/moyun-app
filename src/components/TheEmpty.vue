<script setup lang="ts">
defineProps({
  empty: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <t-row justify="center" class="!pt-3 h-100">
    <span v-if="loading">读取中，请稍后...</span>
    <span v-else-if="empty">此文件夹为空。</span>
    <span v-else>搜索结果为空...</span>
  </t-row>
</template>

<style scoped lang="scss"></style>
