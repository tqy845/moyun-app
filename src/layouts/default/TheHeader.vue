<script lang="ts" setup>
import { useFileStore, useSystemStore, useDirStore, usePathStore } from '@/stores'
import TheEllipsisPath from '@/components/TheEllipsisPath.vue'
import { AppRunPlatformEnum } from '@/constants'
import { InputValue } from 'tdesign-vue-next'
import { vOnClickOutside } from '@vueuse/components'
import BtnCreate from './components/BtnCreate.vue'
import BtnVersion from './components/BtnVersion.vue'
import BtnSort from './components/BtnSort.vue'
import BtnMore from './components/BtnMore.vue'
import BtnMode from './components/BtnMode.vue'
import BtnAssemble from '@/layouts/default/components/BtnAssemble.vue'
import { useTemplateRef } from 'vue'

const breadcrumbRef = useTemplateRef('breadcrumbRef')
const breadcrumbContainerRef = ref()
const systemStore = useSystemStore()
const { back, forward } = usePathStore()
const { isBaseLayout ,search} = storeToRefs(useDirStore())
const {isLoading} = storeToRefs(usePathStore())

const { children, historyChildren, currentDir } = storeToRefs(usePathStore())
const env = import.meta.env

const cs = reactive({
  currentBreadcrumbContainerWidth: -1
})

type PathType = 'could' | 'string'

const pathType = ref<PathType>('could')
const pathString = ref('')

const handleObserver = ({ width }: { width: number }) => {
  if (cs.currentBreadcrumbContainerWidth === -1) {
    cs.currentBreadcrumbContainerWidth = breadcrumbContainerRef.value.offsetWidth
  }
  if (width > cs.currentBreadcrumbContainerWidth) {
    systemStore.pathEllipsisLength++
    handleObserver(breadcrumbRef.value!.$el.offsetWidth)
  }
}

const handleEditPath = (value: InputValue) => {
  pathString.value = value as string
}

const eventChangePathString = () => {
  console.log('trigger。。。')
}

const handleChangeStringPath = (e: MouseEvent) => {
  if (!(e.target as HTMLElement).classList.contains('path-bar')) return
  pathString.value = children.value.map((item) => item.name).join(`/`)
  pathType.value = 'string'
}

const handleSearch = (key: InputValue) => {
  if (key) {
    return
  }
  // const path = children.value.pop()!
  // path.open()
}

const switchPathType = (type: PathType) => {
  pathType.value = type
}

const executed = () => {
  handleObserver(breadcrumbRef.value!.$el.offsetWidth)
}

onMounted(executed)
onUpdated(executed)
</script>

<template>
  <!-- 面包屑-->
  <div class="flex items-center !px-2 bg-transparent" data-tauri-drag-region style="height: 56px">
    <div class="!mr-3 !bg-transparent">
      <t-space size="mini">
        <!-- 后退 -->
        <t-popup :delay="[1000, 0]">
          <t-button
            :disabled="children.length <= 1"
            class="!pa-2"
            theme="default"
            variant="text"
            @click="back()"
          >
            <template #icon>
              <TheIcon name="chevron-left-circle" size="18" />
            </template>
          </t-button>
          <template #content>
            <div class="text-size-xs">后退</div>
          </template>
        </t-popup>

        <!-- 前进 -->
        <t-popup :delay="[1000, 0]">
          <t-button
            :disabled="!historyChildren.length"
            class="!pa-2"
            theme="default"
            variant="text"
            @click="forward()"
          >
            <template #icon>
              <TheIcon name="chevron-right-circle" size="18" />
            </template>
          </t-button>
          <template #content>
            <div class="text-size-xs">前进</div>
          </template>
        </t-popup>

        <!-- 刷新 -->
        <t-popup :delay="[1000, 0]">
          <t-button class="!p-2" theme="default" variant="text" @click="currentDir.refresh()">
            <template #icon>
              <TheIcon name="refresh" />
            </template>
          </t-button>
          <template #content>
            <div class="text-size-xs">
              刷新"<span class="position-relative bottom-[1px]"
            >{{ currentDir.name }}"(F5)</span
            >
            </div>
          </template>
        </t-popup>
      </t-space>
    </div>

    <div
      ref="breadcrumbContainerRef"
      class="path-bar mr-2 w-full flex items-center !rounded-[4px] !bg-[#fcfbfb]"
      @click="handleChangeStringPath"
    >
      <!-- 字符串路径 -->
      <t-input
        v-show="pathType === 'string'"
        v-model="pathString"
        v-elementSelectInputContent
        v-on-click-outside="() => switchPathType('could')"
        autofocus
        class="!w-full !border-none"
        clearable
        inputClass="!bg-transparent !border-none"
        placeholder=""
        style="all: unset; border: none"
        @blur="switchPathType('could')"
        @change="handleEditPath"
        @enter="eventChangePathString"
      >
      </t-input>

      <!-- 面包屑路径 -->
      <div v-show="pathType === 'could'" class="px-1">
        <t-breadcrumb
          ref="breadcrumbRef"
          v-element-size-observer="handleObserver"
          max-item-width="9999999"
        >
          <!-- 路径起始图标 -->
          <t-breadcrumb-item>
            <template #icon>
              <TheIcon name="cloud" />
            </template>
          </t-breadcrumb-item>

          <!-- 操作提示 -->
          <div v-if="children.isEmpty()" class="text-sm">正在跳转...</div>
          <div v-else-if="search && isLoading" class="px-1 text-sm">
            {{ `在“${children.peek()?.name}”搜索中...` }}
          </div>
          <div v-else-if="search && !isLoading" class="px-1 text-sm">
            {{ `在“${children.peek()?.name}”搜索结果如下：` }}
          </div>

          <div v-else class="flex">
            <!-- 收缩的路径-->
            <TheEllipsisPath v-if="systemStore.pathEllipsisLength" style="pointer-events: fill" />

            <!-- 展示的路径 -->
            <t-breadcrumb-item
              v-for="dir in children.slice(systemStore.pathEllipsisLength, children.length)"
              :key="dir.id"
              class="w-full"
              @click.stop="dir.go()"
            >{{ dir.name }}
            </t-breadcrumb-item>
          </div>
        </t-breadcrumb>
      </div>
    </div>

    <div class="mr-2" style="flex: 1 !important; min-width: 150px">
      <t-input
        v-model="search"
        :placeholder="`在 ${currentDir.name} 搜索`"
        class="w-full !h-[32px]"
        clearable
        inputClass="!border-none !rounded-[4px] !bg-[#fcfbfb]"
        @change="handleSearch"
      >
        <template #suffixIcon>
          <TheIcon class="cursor-pointer" name="search" />
        </template>
      </t-input>
    </div>

    <div class="" style="width: 100px">
      <TheStatusBar v-if="env.VITE_APP_AppRunPlatformEnum !== AppRunPlatformEnum.WEB" />
    </div>
  </div>

  <!-- 二级菜单-->
  <div class="!pl-3.2 w-full h-[56px] flex items-center" data-tauri-drag-region>
    <BtnCreate />

    <t-divider class="!m-0 !mx-1.5 !h-[30px] !border-color-[#dbdbdb]" layout="vertical"></t-divider>

    <BtnSort />

    <BtnMode v-if="isBaseLayout" />
    <BtnAssemble v-else />

    <t-divider class="!m-0 !mx-1.5 !h-[30px] !border-color-[#dbdbdb]" layout="vertical"></t-divider>

    <BtnMore />

    <!-- 右侧菜单 -->
    <div class="flex-1" />
    <BtnVersion />
  </div>
</template>

<style lang="scss" scoped>
.path-bar {
  flex: 3 !important;
  height: 32px;
}

:deep(ul.t-menu) {
  margin: 0 !important;
}

:deep(.string-path) {
  background-color: red;
}

:deep(.t-input__inner::placeholder) {
  color: #5d5d5d !important;
}
</style>
