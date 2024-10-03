<script lang="ts" setup>
import { useDirStore, useSettingStore } from '@/stores'

const { folderSelect, asideMenuObject } = storeToRefs(useDirStore())
const { readPhotoAlbum } = useDirStore()
const { photoAlbumAssembleList, photoAlbumParentId } = storeToRefs(useSettingStore())

import { TreeOptionData, TreeProps } from 'tdesign-vue-next'
import { Icon } from 'tdesign-icons-vue-next'
import { getDirList } from '@/api/dir.ts'

const items = ref<TreeProps['data']>(
  asideMenuObject.value.menus
    .map((menu) => menu.menus.filter((it) => !['回收站', '图库'].includes(it.name)))
    .flat()
    .map((menu) => ({
      ...menu,
      label: menu.name,
      children: true
    }))
)

const load: TreeProps['load'] = (node) => {
  const maxLevel = 100
  const { data } = node
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    const { files } = await getDirList(data.id)
    let nodes: TreeOptionData[] = []
    files.forEach((dirRaw) => {
      nodes.push({
        ...dirRaw,
        label: dirRaw.name,
        children: node.getLevel() < maxLevel - 1
      })
    })
    resolve(nodes)
  })
}

const isSelected = ref(false)
const selected = ref()
const eventSelected = (e, { node: { data } }) => {
  isSelected.value = e.length
  selected.value = data
}

const eventConfirm = async () => {
  if (!photoAlbumAssembleList.value.filter((it) => it.id === selected.value.id).length) {
    photoAlbumAssembleList.value.push({
      value: selected.value.id,
      content: selected.value.name,
      ...selected.value
    })
    photoAlbumParentId.value = selected.value.id
    await readPhotoAlbum()
  }
  folderSelect.value = false
}
</script>

<template>
  <t-dialog
    v-model:visible="folderSelect"
    :closeOnOverlayClick="false"
    :confirmBtn="{
      disabled: !isSelected
    }"
    :confirmOnEnter="true"
    :header="false"
    width="80%"
    @confirm="eventConfirm"
  >
    <t-tree
      :data="items"
      :load="load"
      activable
      class="!h-[40vh]"
      expandOnClickNode
      hover
      lazy
      @active="eventSelected"
    >
      <template #icon="{ node }">
        <icon v-if="node.getChildren() && !node.expanded" name="folder" />
        <icon v-else-if="node.getChildren() && node.expanded && node.loading" name="loading" />
        <icon v-else-if="node.getChildren() && node.expanded" name="folder-open" />
        <icon v-else-if="!node.getChildren() && !node.expanded" name="folder" />
        <icon v-else name="folder-open" />
      </template>
    </t-tree>
  </t-dialog>
</template>

<style lang="scss" scoped></style>
