<script lang="ts" setup>
import { useFileStore, useSettingStore } from '@/stores'
import { modeOptions } from '@/constants'

const { mode } = storeToRefs(useFileStore())
const settingStore = useSettingStore()

const eventToggle = (item: unknown) => {
  settingStore.fileSize = mode.value = (item as (typeof modeOptions)[0]).value
}
</script>

<template>
  <t-dropdown trigger="click" @click="eventToggle">
    <t-button class="!p-0 !px-1" variant="text">
      <template #icon>
        <TheIcon :name="modeOptions.filter((it) => it.value === mode)[0]['prefixIcon']" size="16" />
      </template>
      {{ modeOptions.find((item) => item.value === mode)?.content }}
      <TheIcon class="text-grey" name="chevron-down-s" style="top: 3px" />
    </t-button>
    <t-dropdown-menu>
      <t-dropdown-item
        v-for="(item, index) in modeOptions"
        :key="index"
        :active="mode === item.value"
        :divider="item.divider"
        :value="item.value"
      >
        <div class="flex items-center">
          <div class="mr-2">
            <TheIcon :name="item.prefixIcon" :size="item.size || ''" style="width: 20px" />
          </div>
          <div>{{ item.content }}</div>
        </div>
      </t-dropdown-item>
    </t-dropdown-menu>
  </t-dropdown>
</template>

<style lang="scss" scoped></style>
