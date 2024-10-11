<script lang="ts" setup>
import { baseUtils } from '@/utils/functions'
import { useUserStore } from "@/stores"

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

onMounted(executed)
onUpdated(executed)
</script>

<template>
  <!-- 如果有 filename，则显示缩略图 -->
  <img v-if="filename" loading="lazy"
    :src="`http://${endpoint}/moyun-bucket-1/thumbnail/${encodeURIComponent(filename)}.webp`"
    :style="{ height: `${width}px` }" class="!bg-transparent !filter-drop-shadow inline-block object-contain" draggable="false" />
  <!-- 内部图标 -->
  <component :is="iconRef" v-else-if="!external" v-bind="$attrs" draggable="false"></component>
  <!-- 外部图标-->
  <t-icon v-else :loadDefaultIcons="false" :name="`icon-${name}`" url="src/assets/icons/iconfont" v-bind="$attrs"
    draggable="false" />
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
