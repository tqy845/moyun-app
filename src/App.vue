<script lang="ts" setup>
import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'

// 禁用默认菜单
window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
})

onMounted(async () => {
  window.document.querySelectorAll('div').forEach(it => it.setAttribute('data-tauri-drag-region', ''))


  const update = await check()
  if (update?.available) {
    await update.downloadAndInstall()
    await relaunch()
  }
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
