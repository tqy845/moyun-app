<script lang="ts" setup>
import { useFileAttrStore } from '@/stores'
import { useDateFormat } from '@vueuse/core'
import { fileUtils } from '@/utils/functions'

const { visibleRef, fileRef } = storeToRefs(useFileAttrStore())

const tempName = ref('')
watchEffect(() => {
  if (fileRef.value) {
    tempName.value = fileRef.value.name
  }
})

const handleSave = ()=>{
  if(tempName.value !== fileRef.value.name) {
    fileRef.value.rename(tempName.value)
  }
  visibleRef.value = false
}
</script>

<template>
  <t-drawer v-model:visible="visibleRef" @confirm="handleSave">
    <template #header>
      <span class="text-sm-1 text-[#919191] w-[100%]">{{ `${fileRef?.notExtName} 属性` }}</span>
    </template>

    <t-tabs :default-value="1" theme="card">
      <t-tab-panel :value="1" label="常规">
        <t-descriptions colon layout="vertical"
                        labelStyle="width:80px;background:none;padding:0px;padding-left:10px;margin:0">
          <t-descriptions-item label="名称">
            <t-textarea v-model="tempName"></t-textarea>
          </t-descriptions-item>
          <t-descriptions-item label="创建时间">{{ useDateFormat(fileRef?.createdAt, 'YYYY-MM-DD HH:mm:ss') }}
          </t-descriptions-item>
          <t-descriptions-item label="更新时间">{{ useDateFormat(fileRef?.updatedAt, 'YYYY-MM-DD HH:mm:ss') }}
          </t-descriptions-item>
          <t-descriptions-item label="删除时间" v-if="fileRef?.deletedAt">
            {{ useDateFormat(fileRef?.deletedAt, 'YYYY-MM-DD HH:mm:ss') }}
          </t-descriptions-item>
          <t-descriptions-item label="大小">{{ fileUtils.formatFileSize(fileRef?.size || 0) }}</t-descriptions-item>
          <t-descriptions-item label="扩展名">{{ fileRef?.extension }}</t-descriptions-item>
        </t-descriptions>
      </t-tab-panel>
      <!--      <t-tab-panel :value="2" label="版本控制">-->
      <!--        <t-descriptions title="Shipping address" bordered layout="vertical" item-layout="vertical" :column="3">-->
      <!--          <t-descriptions-item label="Name">TDesign</t-descriptions-item>-->
      <!--          <t-descriptions-item label="Telephone Number">139****0609</t-descriptions-item>-->
      <!--          <t-descriptions-item label="Area">China Tencent Headquarters</t-descriptions-item>-->
      <!--          <t-descriptions-item label="Address">Shenzhen Penguin Island D1 4A Mail Center</t-descriptions-item>-->
      <!--        </t-descriptions>-->
      <!--      </t-tab-panel>-->
    </t-tabs>

  </t-drawer>
</template>

<style lang="scss" scoped></style>
