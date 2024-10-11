<script lang="ts" setup>
import { mouseUtils } from '@/utils/functions'
import { useSystemStore } from '@/stores'
import { ContentMenuItem } from '@/constants'

const props = defineProps({
  menu: {
    type: Array<ContentMenuItem>,
    default: () => []
  }
})

const containerRef = ref()
const systemStore = useSystemStore()

const innerSize = computed(() => {
  const { width, height } = systemStore
  return {
    width: width,
    height: height
  }
})

const emit = defineEmits(['select', 'click-outside'])

const { x, y, visible } = mouseUtils.contextMenu(containerRef, innerSize)

const textMenu = computed(() => props.menu.filter((item) => item.type === 'text'))
const iconMenu = computed(() => props.menu.filter((item) => item.type === 'icon'))

const handleSelected = (menuItem: ContentMenuItem) => {
  emit('select', menuItem)
  visible.value = false
}

const handleBeforeEnter = (el: Element) => {
  ;(el as HTMLElement).style.height = '0'
}

const handleEnter = (el: Element) => {
  if (el instanceof HTMLElement) {
    el.style.height = 'auto'
    const h = el.clientHeight
    el.style.height = '0'
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.height = h + 'px'
        el.style.transition = 'height 0.3s'
      })
    })
  }
}

const handleClick = () => {
  emit('click-outside')
}

const handleAfterEnter = (el: Element) => {
  ;(el as HTMLElement).style.transition = 'none'
}
</script>

<template>
  <span ref="containerRef" class="" @click="handleClick">
    <slot></slot>
    <teleport to="body">
      <transition
        @enter="handleEnter"
        @before-enter="handleBeforeEnter"
        @after-enter="handleAfterEnter"
      >
        <div
          v-if="visible"
          v-mouse-disabled-context-menu
          :style="{
            left: x + 'px',
            top: y + 'px'
          }"
          class="position-fixed"
          style="z-index: 999999"
        >
          <!-- 菜单项-->
          <t-card
            bordered
            class="context-menu position-fixed bg-white rounded-sm pa-0 !m-0 shadow-lg"
          >
            <t-list class="pa-0 !m-0 rounded">
              <t-list-item
                v-for="item in textMenu"
                :key="item.id"
                aria-controls
                class="menu-item"
                size="small"
                @click="handleSelected(item)"
              >
                <div class="flex items-center justify-center">
                  <div class="mr-3">
                    <TheIcon :name="item.icon" size="large" />
                  </div>
                  <div>{{ item.name }}</div>
                </div>
                <template #action>
                  <div class="text-size-xs ml-10">
                    {{ item?.shortcutKey }}
                  </div>
                </template>
              </t-list-item>
            </t-list>
            <template #footer>
              <div v-if="iconMenu.length" class="pa-1">
                <t-button
                  v-for="item in iconMenu"
                  :key="item.id"
                  :theme="item.color || 'default'"
                  class="mr-1"
                  shape="square"
                  variant="text"
                  @click.stop="handleSelected(item)"
                >
                  <TheIcon :name="item.icon" size="large" />
                </t-button>
              </div>
            </template>
          </t-card>
        </div>
      </transition>
    </teleport>
  </span>
</template>

<style lang="scss" scoped>
:deep(.t-card__footer),
:deep(.t-card__body) {
  padding: 0 !important;
}

.menu-item:hover {
  background: #f3f3f3;
}
</style>
