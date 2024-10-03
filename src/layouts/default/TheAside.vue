<script lang="ts" setup>
import { useUserStore, useDirStore } from '@/stores'
import { DropdownOption } from 'tdesign-vue-next'

const userStore = useUserStore()
const { user } = userStore

const cs = reactive({
  collapsed: false
})

const { asideMenuObject } = storeToRefs(useDirStore())

const options: DropdownOption[] = [
  {
    content: '设置',
    action: () => {
      userStore.profile = true
    }
  },
  {
    content: '主题',
    action: () => {
      userStore.profile = true
    }
  },
  {
    content: '退出系统',
    theme: 'error',
    action: () => {
      userStore.exit()
    }
  }
]

const handleExecute = async (e: DropdownOption) => {
  e.action()
}
</script>

<template>
  <t-menu :collapsed="cs.collapsed" v-model="asideMenuObject.index" width="133px">
    <t-menu-group
      v-for="(menu, index) in asideMenuObject.menus"
      :key="index"
      :title="menu.menus.length ? menu.name : ''"
    >
      <div v-if="menu.name !== '快捷访问'">
        <!-- 普通目录-->
        <TheBasicMenuItem :menus="menu.menus" />
      </div>
      <div v-else>
        <!-- 快捷访问-->
        <TheQuickMenuItem :menus="menu.menus" />
      </div>
    </t-menu-group>

    <template #operations>
      <t-dropdown :options="options" @click="handleExecute">
        <t-space :size="10" class="w-full flex-inline items-center !overflow-hidden">
          <t-avatar>{{ user.realName[0] ?? user.email[0] }}</t-avatar>
          <div v-show="!cs.collapsed" class="text-truncate text-size-xs w-[70px]">
            {{ user.email }}
          </div>
        </t-space>
      </t-dropdown>

      <t-button
        class="position-relative left-[4px] !z-[99]"
        theme="default"
        size="small"
        shape="square"
        @click="cs.collapsed = !cs.collapsed"
      >
        <template #icon>
          <TheIcon :name="cs.collapsed ? 'chevron-right' : 'chevron-left'" />
        </template>
      </t-button>
    </template>
  </t-menu>
</template>

<style lang="scss" scoped>
// 移除第一个分组标题的上内边距
:deep(.t-menu-group:first-child > .t-menu-group__title) {
  padding-top: 0px;
}
</style>
