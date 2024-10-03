<script lang="ts" setup>
import { onMounted } from 'vue'
import { sortModeOptions, sortOptions } from '@/constants'
import { usePathStore, useSettingStore } from '@/stores'

const { sort } = usePathStore()
const { fileSortType, fileSortMode } = storeToRefs(useSettingStore())

const executed = async () => {}

onMounted(executed)
</script>

<template>
  <t-dropdown trigger="click">
    <t-button theme="default" variant="text" class="!p-0 !px-1">
      <template #icon>
        <TheIcon name="arrow-up-down-1" size="16" />
      </template>
      {{ sortOptions.find((item) => item.attr === fileSortType)?.content }}
      {{ sortModeOptions.find((item) => item.value === fileSortMode)?.content }}
      <TheIcon name="chevron-down-s" style="top: 3px" />
    </t-button>
    <t-dropdown-menu>
      <t-dropdown-item
        v-for="(item, index) in sortOptions"
        :key="index"
        :value="item.attr"
        :divider="item.divider"
        :active="fileSortType === item.attr"
        @click="sort(item.attr, fileSortMode)"
      >
        <div class="flex items-center">
          <div class="mr-2">
            <TheIcon v-if="fileSortType === item.attr" name="play" />
            <t-icon v-else></t-icon>
          </div>
          <div class="">{{ item.content }}</div>
        </div>
      </t-dropdown-item>

      <t-dropdown-item
        v-for="item in sortModeOptions"
        :key="item.value"
        :value="item.value"
        :divider="item.divider"
        :active="fileSortMode === item.value"
        @click="sort(fileSortType, item.value)"
      >
        <div class="flex items-center">
          <div class="mr-2">
            <TheIcon v-if="fileSortMode === item.value" name="play" />
            <t-icon v-else></t-icon>
          </div>
          <div>{{ item.content }}</div>
        </div>
      </t-dropdown-item>
    </t-dropdown-menu>
  </t-dropdown>
</template>

<style lang="scss" scoped></style>
