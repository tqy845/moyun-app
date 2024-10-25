<script lang="ts" setup>
// 禁用默认菜单
window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
})

onMounted(() => {
  window.document.querySelectorAll('div').forEach(it => it.setAttribute('data-tauri-drag-region', ''))
})
</script>

<template>
  <RouterView />
</template>

<style>
.t-dialog.t-dialog__modal-default.t-dialog--default.t-dialog--center {
  padding: 20px;
}
</style>
