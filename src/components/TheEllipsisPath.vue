<script lang="ts" setup>
import { useSystemStore } from '@/stores'

const systemStore = useSystemStore()

const paths = computed(() =>
  systemStore.pathList.toArray().slice(0, systemStore.pathEllipsisLength)
)

const executed = async () => {}

onMounted(executed)
</script>

<template>
  <t-breadcrumb-item>
    <t-dropdown min-column-width="20vw" :max-height="400" trigger="click">
      <t-button theme="default" variant="text" shape="square">
        <Icon name="ellipsis"></Icon>
      </t-button>
      <t-dropdown-menu>
        <t-dropdown-item
          v-for="path in paths"
          :key="path.id"
          :value="path.id"
          @click="path.go(path)"
        >
          {{ path.name }}
        </t-dropdown-item>
      </t-dropdown-menu>
    </t-dropdown>
  </t-breadcrumb-item>
</template>

<style lang="scss" scoped></style>
