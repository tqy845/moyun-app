<script lang="ts" setup>
/*
 * Aside
 * 组件用途: XXX
 * 创建日期: 2024/2/4
 * 作者: 谭期元
 */
const se = reactive({
  list: [
    {
      label: '安全高效，隐私无忧',
      pageColor: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)'
    },
    {
      label: '数据安全，尽在掌握',
      pageColor: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)'
    },
    {
      label: '随时随地，数字生活',
      pageColor: 'linear-gradient(to right, #fa709a 0%, #fee140 100%)'
    }
  ]
})

const executed = async () => {}

onMounted(executed)
</script>

<template>
  <t-swiper
    class="h-full"
    style="pointer-events: none"
    :duration="300"
    :interval="3000"
    :navigation="{ type: 'dots', size: 'small', showSlideBtn: 'never' }"
    animation="fade"
    direction="vertical"
  >
    <t-swiper-item v-for="item in se.list" :key="item.label" class="flex">
      <div
        class="flex w-full h-full justify-center items-center text-size-5xl font-bold text-black font-['AlibabaPuHuiTi']"
        :style="{ background: item.pageColor }"
      >
        {{ item.label }}
      </div>
    </t-swiper-item>
  </t-swiper>
</template>

<style lang="scss" scoped>
:deep(.t-swiper__content),
:deep(.t-swiper__container) {
  height: 100% !important;
  width: 100% !important;
}
</style>
