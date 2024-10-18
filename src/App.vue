<script lang="ts" setup>
// 禁用默认菜单
window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});
</script>

<template>
  <RouterView  />
</template>

<style>
.t-dialog.t-dialog__modal-default.t-dialog--default.t-dialog--center {
  padding: 20px;
}
</style>
