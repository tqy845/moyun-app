<script lang="ts" setup>
import { useFileStore, useSystemStore, usePathStore, useDirStore, useFileMapStore } from '@/stores'
import File from '@/models/File/File'
import Folder from '@/models/File/Folder'
import {
  ActiveChangeContext,
  RowEventContext,
  TableProps,
  TableRowAttributes,
  TableRowData
} from 'tdesign-vue-next'
import { fileUtils } from '@/utils/functions'
import { FileExtensionEnum } from '@/constants'

const tableRef = ref()
const { isDrag } = storeToRefs(useDirStore())
const systemStore = useSystemStore()
const fileStore = useFileStore()
const { getItemById } = useFileMapStore()
const { isSelected, removeSelected, clearSelected, addSelected } = usePathStore()
const { currentDirSelectedFiles, currentDirFiles, isLoading } = storeToRefs(usePathStore())

const controlState = useKeyModifier('Control')
const shiftState = useKeyModifier('Shift')

const selectedRowKeys = computed(
  () =>
    currentDirSelectedFiles.value.map((it) => it.name) as unknown as TableProps['selectedRowKeys']
)

const selectedFile = ref<File | Folder>()

const columns = [
  {
    colKey: 'name',
    title: '名称',
    ellipsis: true,
    sorter: true,
    width: '40vw'
  },
  {
    colKey: 'updatedAt',
    title: '修改日期',
    ellipsis: true,
    width: '20vw'
  },
  { colKey: 'typeName', title: '类型', ellipsis: true, width: '10vw' },
  { colKey: 'size', title: '大小', ellipsis: true, width: '10vw' }
]

// 订阅监听 - 新建文件/文件夹
fileStore.$subscribe(async ({ type }: { type: string }) => {
  if (type === 'patch function') {
    await nextTick()
    // 用框架的方法有bug，直接操作真实DOM
    const raw = tableRef.value.baseTableRef.$el
    const el = raw.querySelector('.t-table__content') as HTMLElement
    const table = raw.querySelector('.t-table--layout-auto') as HTMLTableElement
    el.scrollTop = table.offsetHeight
  }
})

const eventLeftClick = (file: File | Folder) => {
  if (isSelected(file) && currentDirSelectedFiles.value.length <= 1) {
    removeSelected(file)
    return
  }

  if (!controlState.value && !shiftState.value) {
    clearSelected()
  }

  if (!shiftState.value) {
    addSelected(file)
  } else {
    // 批量选择，另外一半不存在说明无法继续
    const otherFile = currentDirSelectedFiles.value.peek()
    if (!otherFile) return
    let startIndex = currentDirFiles.value.findIndex((file) => file === otherFile)
    let endIndex = currentDirFiles.value.findIndex((file) => file === file)
    // 确保 startIndex <= endIndex
    startIndex > endIndex ? ([endIndex, startIndex] = [startIndex, endIndex]) : null
    // 切片
    const patchSelectedArray = currentDirFiles.value.slice(
      startIndex,
      endIndex + 1
    ) as unknown as Array<File | Folder>
    addSelected(...patchSelectedArray)
  }
}

const eventRightClick = (file: File | Folder) => {
  clearSelected()
  addSelected(file)
}

const eventRowClick = ({ e, row }: RowEventContext<TableRowData>) => {
  if (isDrag.value) {
    isDrag.value = false
    return
  }
  // e.preventDefault()
  // e.stopPropagation()

  const file = row as unknown as File | Folder
  selectedFile.value = file

  switch ((e as MouseEvent).button) {
    case 0:
      // 左键
      eventLeftClick(file)
      break
    case 2:
      // 右键
      eventRightClick(file)
      break
  }
}

const eventRowDblclick = ({ row }: RowEventContext<TableRowData>) => {
  // 打开文件/文件夹
  row.open()
}

const eventUpdateSelected = (
  _activeRowKeys: Array<string | number>,
  { activeRowList }: ActiveChangeContext<TableRowData>
) => {
  clearSelected()
  addSelected(...(activeRowList as unknown as Array<File | Folder>))
}

const eventRowAttributes = (params: TableRowAttributes<TableRowData>) => {
  const { row } = params as TableRowData
  return [{ 'data-id': row.id, 'data-type': row.__prototype__.type }]
}

onMounted(async () => {
  await nextTick()
  const fileEls = document.querySelectorAll('tr[data-id][data-type]')
  fileEls.forEach((fileEl) => {
    const fileId = fileEl.getAttribute('data-id')
    const fileType = fileEl.getAttribute('data-type') as FileExtensionEnum
    const file = getItemById(Number(fileId), fileType)
    file.el = fileEl
    console.log(file);
  })
})
</script>

<template>
  <div v-if="currentDirFiles.length">
    <TheContextMenu :menu="selectedFile?.menuItems" @select="$event.action(selectedFile)">
      <t-table
        class="!bg-transparent"
        ref="tableRef"
        row-key="name"
        :columns="columns"
        :data="currentDirFiles"
        :height="systemStore.contentHeight"
        :scroll="{ type: 'virtual', rowHeight: 48, bufferSize: 10 }"
        :bordered="false"
        lazy-load
        drag-sort="col"
        size="small"
        table-layout="fixed"
        resizable
        hover
        select-on-row-click
        :selected-row-keys="selectedRowKeys"
        :activeRowKeys="selectedRowKeys"
        :active-row-type="'single'"
        :row-attributes="eventRowAttributes"
        @click.stop
        @row-mouseup="eventRowClick"
        @row-dblclick="eventRowDblclick"
        @active-change="eventUpdateSelected"
      >
        <template #name="{ col, row }">
          <!-- 标题加上图标 -->
          <div class="overflow-hidden text-ellipsis">
            <TheIcon
              class="mr-2 mb-1 w-[50px]"
              shape="round"
              :external="true"
              :filename="fileUtils.isThumbnailType(row['extension']) ? row['hash'] : ''"
              :name="row['icon']"
              size="30"
              :width="30"
            />
            <span class="">{{ row[col.colKey] }}</span>
          </div>
        </template>

        <template #updatedAt="{ col, row }">
          <!-- 格式化时间 -->
          <div class="overflow-hidden text-ellipsis">
            <span class="">{{ new Date(row[col.colKey]).toLocaleString() }}</span>
          </div>
        </template>

        <template #size="{ col, row }">
          <span class="">{{ fileUtils.formatFileSize(row[col.colKey]) }}</span>
        </template>
      </t-table>
    </TheContextMenu>
  </div>
  <TheEmpty v-else :empty="currentDirFiles.length === 0" :loading="isLoading" />
</template>

<style lang="scss" scoped>
:deep(.custom-row) {
  opacity: 0.5;
}

:deep(.base-row) {
  user-select: none;
}

:deep(tbody > tr.t-table__row--hover),
:deep(.t-table__header--fixed:not(.t-table__header--multiple) > tr > th) {
  background-color: transparent !important;
}

:deep(.t-table--hoverable tbody tr:hover) {
  background-color: #f2f3ff !important;
}
</style>
