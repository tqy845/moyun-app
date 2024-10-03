<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window'

const windowInstance = getCurrentWindow()

const cs = reactive({
  isMax: false
})

const handleMinimize = () => {
  windowInstance.minimize()
}

const handleMaximize = async () => {
  if (await windowInstance.isMaximized()) {
    cs.isMax = false
    windowInstance.unmaximize()
  } else {
    cs.isMax = true
    windowInstance.maximize()
  }
}

const handleClose = () => {
  windowInstance.close()
}

watch(
  () => windowInstance.isMaximized(),
  (value) => {
    console.log(value)
  }
)
</script>

<template>
  <div class="flex">
    <t-button shape="circle" theme="default" variant="text" @click="handleMinimize">
      <template #icon>
        <TheIcon name="remove" />
      </template>
    </t-button>
    <t-button shape="circle" theme="default" variant="text" @click="handleMaximize">
      <template #icon>
        <TheIcon :name="!cs.isMax ? 'fullscreen-1' : 'fullscreen-exit-1'" />
      </template>
    </t-button>
    <t-button shape="circle" theme="default" variant="text" @click="handleClose">
      <template #icon>
        <TheIcon name="close" />
      </template>
    </t-button>
  </div>
</template>

<style scoped lang="scss"></style>
