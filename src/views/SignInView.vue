<script lang="ts" setup>
/*
 * LoginView
 * 组件用途： 登录页面
 * 创建日期： 2024/02/01
 * 作者： 谭期元
 */
import { UserLoginModel } from '@/api/models/userModel'
import { useUserStore } from '@/stores'
import { getDefaultSetting, getUserEmailSuffix } from '@/stores/modules/user/helper'
import { FormProps, FormRules } from 'tdesign-vue-next'

const formRef = ref()

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const userStore = useUserStore()

const fm = reactive<UserLoginModel>(getDefaultSetting().loginInfo)

const rs: FormRules<{}> = {
  email: [{ required: true, message: '必填', type: 'error', trigger: 'blur' }],
  password: [{ required: true, message: '必填', type: 'error' }]
}

const handleSubmit: FormProps['onSubmit'] = async ({ validateResult, firstError }) => {
  try {
    loading.value = true
    if (validateResult !== true) {
      throw new Error(firstError)
    }
    await userStore.login({ ...fm })
  } finally {
    loading.value = false
  }
}

// 输入框内容发生变化时进行搜索，50ms 搜索一次
const options = ref<string[]>([])
const handleAutoComplete = useDebounceFn((value: string) => getUserEmailSuffix(options, value), 50)

onActivated(() => {
  if (userStore.loginInfo.remember) {
    Object.assign(fm, userStore.loginInfo)
    return
  }

  const email = route.query.email as string
  if (email) fm.email = email
})
</script>

<template>
  <div class="h-full flex items-center justify-center">
    <t-form ref="formRef" :data="fm" :rules="rs" :colon="true" :label-width="0" @submit="handleSubmit">
      <t-form-item>
        <div class="w-full flex justify-center items-baseline font-bold">
          <span class="mr-2 text-size-4xl text-shadow">摸云</span>
          <span class="text-blue-6">登录</span>
        </div>
      </t-form-item>

      <t-form-item name="email">
        <t-auto-complete
          v-model="fm.email"
          :options="options"
          highlight-keyword
          :filterable="false"
          placeholder="邮箱号/账户名"
          autofocus
          clearable
          :borderless="true"
          @change="handleAutoComplete"
          @enter="
            ({ e }) => {
              e.preventDefault()
            }
          "
          :inputProps="{ autocomplete: 'new-password' }"
        >
          <template #prefix-icon>
            <TheIcon name="desktop" />
          </template>
        </t-auto-complete>
      </t-form-item>

      <t-form-item name="password">
        <t-input
          v-model="fm.password"
          type="password"
          placeholder="密码"
          autocomplete="new-password"
        >
          <template #prefix-icon>
            <TheIcon name="lock-on" />
          </template>
        </t-input>
      </t-form-item>

      <t-form-item class="!m-0">
        <t-button theme="primary" block type="submit" :loading="loading">登录</t-button>
      </t-form-item>

      <t-form-item class="!m-0">
        <t-checkbox v-model="fm.remember">
          <span class="text-size-sm">记住我</span>
        </t-checkbox>
      </t-form-item>

      <t-form-item class="!m-0">
        <div class="flex justify-center text-center items-center w-full">
          <span class="text-size-sm">还没账号？</span>
          <t-link
            class="text-size-sm"
            theme="primary"
            @click="$router.push({ path: '/sign/up', query: { email: fm.email } })"
          >
            注册
          </t-link>
        </div>
      </t-form-item>
    </t-form>
  </div>
</template>
