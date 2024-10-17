<script lang="ts" setup>
// window.addEventListener('contextmenu', (e) => {
//   e.preventDefault();
// });
</script>

<template>
  <RouterView v-mouse-disabled-context-menu />
</template>

<style>
.t-dialog.t-dialog__modal-default.t-dialog--default.t-dialog--center {
  padding: 20px;
}
</style>
