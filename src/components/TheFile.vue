<script lang="tsx" setup>
import File from '@/models/File/File'
import Folder from '@/models/File/Folder'
import { usePathStore, useSettingStore } from '@/stores'
import { fileUtils } from '@/utils/functions'
import { vOnClickOutside } from '@vueuse/components'
import { useDateFormat } from '@vueuse/core'

const props = defineProps({
  file: {
    type: Object as PropType<File | Folder>,
    required: true
  },
  showName: {
    type: Boolean,
    default: true
  }
})

const controlState = useKeyModifier('Control')
const shiftState = useKeyModifier('Shift')

const textareaRef = ref()
const { fileSize } = storeToRefs(useSettingStore())
const { isSelected, clearSelected, removeSelected, addSelected } = usePathStore()
const { currentDirFiles, currentDirSelectedFiles } = storeToRefs(usePathStore())

const eventSelected = () => {
  if (isSelected(props.file) && currentDirSelectedFiles.value.length <= 1) {
    removeSelected(props.file)
    return
  }

  if (!controlState.value && !shiftState.value) {
    clearSelected()
  }

  if (!shiftState.value) {
    // 单选
    addSelected(props.file)
  } else {
    // 批量选择
    const preFile = currentDirSelectedFiles.value.peek()
    if (preFile) {
      let startIndex = currentDirFiles.value.findIndex((file) => file === preFile)
      let endIndex = currentDirFiles.value.findIndex(
        (file) => (file as unknown as File | Folder) === props.file
      )
      startIndex > endIndex ? ([endIndex, startIndex] = [startIndex, endIndex]) : null
      const range = currentDirFiles.value.slice(startIndex, endIndex + 1) as unknown as Array<
        File | Folder
      >
      addSelected(...range)
    }
  }
}

const eventContextmenu = () => {
  clearSelected()
  addSelected(props.file)
}

const form = reactive({
  value: props.file.name
})

const updated = () => {
  textareaRef.value?.focus()
}

const copyStyles = computed(() => {
  const file = props.file
  if (file.isCutting) return 'opacity-[0.4]'
  return ''
})

const selectedStyles = computed(() => {
  return isSelected(props.file) ? 'selected' : ''
})

onUpdated(updated)
</script>

<template>
  <t-card v-mouse-disabled-context-menu :bordered="false" :class="[selectedStyles]"
    :style="{ '--file-container-width': `${fileSize}px` }"
    class="card m-1 cursor-pointer flex justify-center text-center bg-transparent" @click="eventSelected"
    @contextmenu="eventContextmenu">
    <t-popup :delay="[1300, 0]" placement="bottom-left" showArrow>
      <!-- 扩展提示 -->
      <template #content>
        <div class="w-40">
          <t-row><span class="text-small">名称：</span>{{ file.name }}</t-row>
          <t-row><span class="text-small font-bold">大小：</span>{{ fileUtils.formatFileSize(file.size || 0) }}
          </t-row>
          <t-row><span class="text-small font-bold">修改日期：</span>{{ useDateFormat(file.updatedAt, 'YYYY-MM-DD HH:mm:ss')
            }}
          </t-row>
        </div>
      </template>
      <!-- 基本信息 -->
      <t-row :class="[copyStyles]" align="center" class="flex-col file-container">
        <t-col class="flex justify-center w-100">
          <TheIcon :external="true" :filename="fileUtils.isThumbnailType(file.extension) ? file.hash : ''"
            :name="file.icon" :size="`${fileSize}px`" :width="fileSize" class="pt-1" />

          <t-progress v-if="file.isDownloading"
            :percentage="parseFloat((file.progress as unknown as number).toFixed(2))" :size="fileSize"
            :strokeWidth="fileSize / 9" class="position-absolute" style="top: 0" theme="circle" />
        </t-col>
        <t-col v-if="showName" class="my-1 w-full">
          <div class="multi-line-text overflow-hidden text-size-xs line-height-[1.5] text-center">
            <div v-if="!file.isRenaming">
              {{ file.notExtName }}
            </div>
            <!-- 重命名 -->
            <t-textarea v-else ref="textareaRef" v-model="form.value" v-element-select-textarea-content="{
              begin: 0,
              end: file.name.includes('.') ? file.name.lastIndexOf('.') : 0 // 默认选中文件名不带后缀
            }" v-on-click-outside="() => file.rename(form.value)" :default-value="file.name" autosize />
          </div>
        </t-col>
      </t-row>
    </t-popup>
  </t-card>
</template>

<style lang="scss" scoped>
.file-container {
  width: var(--file-container-width);
  /* 使用 CSS 变量设置宽度 */
}

.card {
  border-radius: 3px;
  border: 1px solid transparent;

  &:hover,
  &.selected {
    border: 1px solid rgba(0, 0, 0, 0.4) !important;
    background-color: #f2f3ff !important;
  }
}

.multi-line-text {
  word-wrap: break-word;
  line-clamp: 4;
  -webkit-line-clamp: 4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
}

:deep(.t-textarea__inner.narrow-scrollbar) {
  padding: 0 !important;
  line-height: 1.5;
  font-size: 0.75rem;
}
</style>
