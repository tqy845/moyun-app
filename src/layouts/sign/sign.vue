<script lang="ts" setup>
// import { invoke } from '@tauri-apps/api/core'
import Aside from './Aside.vue'

// async function displayIcon() {
//   try {
//     const iconBase64 = await invoke('get_windows_icon')
//     const img = new Image()
//     const src = `data:image/x-icon;base64,${iconBase64}`
//     img.src = src
//     img.width = 64 // 设定宽度
//     img.height = 64 // 设定高度
//     img.style.position = 'absolute'
//     img.style.top = '0'
//     img.style.left = '0'
//     img.style.zIndex = '9999999999999'
//     console.log(src)

//     document.body.appendChild(img) // 将图标添加到页面中
//   } catch (error) {
//     console.error('Failed to load icon:', error)
//   }
// }

// displayIcon()
</script>

<template>
  <t-layout class="h-full">
    <t-aside width="68vw" data-tauri-drag-region>
      <Aside />
    </t-aside>
    <t-layout style="width: 32vw">
      <t-content>
        <TheStatusBar class="justify-end" data-tauri-drag-region />

        <RouterView v-slot="{ Component }" data-tauri-drag-region>
          <KeepAlive>
            <component :is="Component" />
          </KeepAlive>
        </RouterView>
      </t-content>
      <t-footer>
        <div class="text-size-xs text-center">© 2024 谭期元 保留所有权利</div>
      </t-footer>
    </t-layout>
  </t-layout>
</template>
