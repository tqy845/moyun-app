<script lang="ts" setup>
import { moreOptions } from '@/constants'
import { usePathStore } from '@/stores'
const { currentDirSelectedFiles } = usePathStore()
const executed = async () => {}

onMounted(executed)
</script>

<template>
  <div v-show="currentDirSelectedFiles.length">
    <t-dropdown trigger="click" :min-column-width="150">
      <t-button theme="default" variant="text" class="pa-2 pe-auto">
        <TheIcon name="ellipsis" />
      </t-button>
      <t-dropdown-menu>
        <t-dropdown-item
          v-for="item in moreOptions"
          :key="item.value"
          :value="item.value"
          :divider="item.divider"
          @click="item.action"
        >
          <span class="mr-2">
            <TheIcon :name="item.prefixIcon || ''" />
          </span>
          <span class="text-size-xs">
            {{ item.content }}
          </span>
        </t-dropdown-item>
      </t-dropdown-menu>
    </t-dropdown>
  </div>
</template>

<style lang="scss" scoped></style>
