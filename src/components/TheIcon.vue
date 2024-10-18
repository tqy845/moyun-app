<script lang="ts" setup>
import { baseUtils } from '@/utils/functions'
import { useUserStore } from '@/stores'
import { CircleIcon } from 'tdesign-icons-vue-next'

const { endpoint } = useUserStore()

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    default: ''
  },
  external: {
    type: Boolean,
    default: false
  },
  width: {
    type: Number,
    default: 0
  }
})

const iconRef = shallowRef()

const executed = () => {
  if (!props.external) {
    import('tdesign-icons-vue-next').then((icons: any) => {
      const _name = `${baseUtils.toPascalCase(props.name)}Icon`
      if (props.name && icons[_name]) {
        iconRef.value = icons[_name]
      }
    })
  }
}

const handleSuccess = (src: string) => {
  const el = document.querySelector(`[src="${src}"]`)
  el?.setAttribute('draggable', 'false')
}

onMounted(executed)
onUpdated(executed)
</script>

<template>
  <!-- 如果有 filename，则显示缩略图 -->
  <t-image
    v-if="filename"
    :src="`http://${endpoint}/moyun-bucket-1/thumbnail/${encodeURIComponent(filename)}.webp`"
    :srcset="{
      'image/webp': `http://${endpoint}/moyun-bucket-1/thumbnail/${encodeURIComponent(filename)}.webp`,
      'image/avif': ``
    }"
    :lazy="true"
    :style="{ height: `${width}px`, width: `${width}px` }"
    class="!bg-transparent !filter-drop-shadow inline-block object-contain"
    draggable="false"
    fit="scale-down"
    @load="
      handleSuccess(
        `http://${endpoint}/moyun-bucket-1/thumbnail/${encodeURIComponent(filename)}.webp`
      )
    "
  >
    <template #loading>
      <t-icon
        :loadDefaultIcons="false"
        name="icon-tuxiangimages17"
        url="src/assets/icons/iconfont"
        draggable="false"
        :size="width"
      />
    </template>
    <template #error>
      <t-icon
        :loadDefaultIcons="false"
        name="icon-tuxiangimages17"
        url="src/assets/icons/iconfont"
        draggable="false"
        :size="width"
      />
    </template>
  </t-image>
  <!-- 内部图标 -->
  <component :is="iconRef" v-else-if="!external" v-bind="$attrs" draggable="false"></component>
  <!-- 外部图标-->
  <t-icon
    v-else
    :loadDefaultIcons="false"
    :name="`icon-${name}`"
    url="src/assets/icons/iconfont"
    v-bind="$attrs"
    draggable="false"
  />
</template>

<style lang="scss" scoped>
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
