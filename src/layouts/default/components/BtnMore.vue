<script lang="ts" setup>
import { ContextMenu } from '@/models/ContextMenu';
import { usePathStore } from '@/stores'
const { currentDirSelectedFiles } = usePathStore()

const options = ContextMenu.builder()
  .appendRepeal()
  .appendDivider()
  .appendFixedQuick()
  .appendDivider()
  .appendAllSelected()
  .appendAllCancel()
  .appendReverseSelected()
  .build()

const executed = async () => { }

onMounted(executed)
</script>

<template>
  <div v-show="currentDirSelectedFiles.length">
    <t-dropdown trigger="click" :min-column-width="150">
      <t-button theme="default" variant="text" class="pa-2 pe-auto">
        <TheIcon name="ellipsis" />
      </t-button>
      <t-dropdown-menu>
        <t-dropdown-item v-for="item in options" :key="item.value" :value="item.value" :divider="item.divider"
          @click="item.action">
          <span class="mr-2">
            <TheIcon :name="item.prefixIcon || ''" />
          </span>
          <span class="text-size-xs">
            {{ item.name }}
          </span>
        </t-dropdown-item>
      </t-dropdown-menu>
    </t-dropdown>
  </div>
</template>

<style lang="scss" scoped></style>
