<script lang="ts" setup>
import { UserRegisterModel } from '@/api/models/userModel.ts'
import { FormProps, FormRules, GuideStep } from 'tdesign-vue-next'
import { getDefaultSetting, getUserEmailSuffix } from '@/stores/modules/user/helper'
import { postUserRegister } from '@/api/user'

const formRef = ref()

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const currentGuide = ref(-1)
const completedText = ref('')

const fm = reactive<UserRegisterModel>(getDefaultSetting().registerInfo)

const steps: GuideStep[] = [
  {
    element: '.agreement',
    title: '您必须阅读并同意条款才能继续注册',
    placement: 'top'
  }
]

const handlePasswordValid = (val: string) => {
  if (!val.length) return { result: false, message: '密码不能为空', type: 'error' }

  if (val.length > 0 && val.length < 6)
    return { result: false, message: '密码太简单', type: 'warning' }

  if (val.length >= 6 && val.length < 8)
    return { result: true, message: '密码合格', type: 'warning' }

  return { result: true, message: '密码强度很高', type: 'success' }
}

const rePassword = (val: string) =>
  new Promise((resolve) => {
    resolve(fm.password === val)
  })

const rs: FormRules<{}> = {
  email: [
    { required: true, message: '必须填写邮箱号', trigger: 'blur' },
    { email: true, message: '邮箱号不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '必须填写密码', trigger: 'blur' },
    { min: 5 },
    { max: 15 },
    { validator: handlePasswordValid }
  ],
  rePassword: [
    { required: true, message: '必须再次确认密码' },
    { min: 5 },
    { max: 15 },
    {
      validator: rePassword,
      message: '输入的两次密码不一致'
    }
  ],
  agreement: [{ required: true, message: '必须同意条款才能继续注册' }]
}

const handleFinish = () => {
  currentGuide.value = -1
}

const handleSubmit: FormProps['onSubmit'] = async ({ validateResult, firstError }) => {
  try {
    loading.value = true
    if (validateResult !== true) {
      throw new Error(firstError)
    }
    if (!fm.agreement) {
      currentGuide.value = 0
      throw new Error('请先阅读并同意条款')
    }

    const { fail, message } = await postUserRegister({ ...fm })
    if (!fail) {
      completedText.value = message
    }
  } finally {
    loading.value = false
  }
}

const handleCompleted = async () => {
  await router.push({ path: '/sign/in', query: { email: fm.email } })
  completedText.value = ''
}

// 输入框内容发生变化时进行搜索，50ms 搜索一次
const options = ref<string[]>([])
const handleAutoComplete = useDebounceFn((value: string) => getUserEmailSuffix(options, value), 50)

onActivated(() => {
  const email = route.query.email as string
  if (email) fm.email = email
})
</script>

<template>
  <div class="h-full flex items-center justify-center w-full">
    <t-form
      ref="formRef"
      :data="fm"
      :rules="rs"
      :colon="true"
      :label-width="0"
      @submit="handleSubmit"
    >
      <t-form-item>
        <div class="w-full flex justify-center items-baseline font-bold">
          <span class="text-size-4xl text-shadow mr-2">摸云</span>
          <span class="text-blue-6">注册</span>
        </div>
      </t-form-item>

      <div v-show="!completedText">
        <t-form-item name="email">
          <t-auto-complete
            v-model="fm.email"
            :options="options"
            highlight-keyword
            :filterable="false"
            placeholder="邮箱号"
            clearable
            @change="handleAutoComplete"
            @enter="
              ({ e }) => {
                e.preventDefault()
              }
            "
            :inputProps="{ autocomplete: 'new-password' }"
          >
            <template #prefix-icon> <TheIcon name="desktop" /> </template
          ></t-auto-complete>
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

        <t-form-item name="rePassword">
          <t-input
            v-model="fm.rePassword"
            type="password"
            placeholder="确认密码"
            autocomplete="new-password"
          >
            <template #prefix-icon>
              <TheIcon name="lock-on" />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item class="!m-0">
          <t-button theme="primary" type="submit" block :loading="loading">注册 </t-button>
        </t-form-item>

        <t-form-item class="!m-0 mt-1">
          <div class="agreement flex justify-center !items-center w-full">
            <t-checkbox v-model="fm.agreement">
              <span class="text-size-xs">我已阅读并同意</span>
            </t-checkbox>
            <t-link class="!text-size-xs" theme="primary" hover="color">使用条款</t-link>
          </div>
        </t-form-item>

        <t-form-item class="">
          <div class="flex justify-center text-center items-center w-full">
            <span class="">已有账号？</span>
            <t-link
              class="!text-size-sm"
              theme="primary"
              @click="$router.push({ path: '/sign/in', query: { email: fm.email } })"
            >
              登录
            </t-link>
          </div>
        </t-form-item>
      </div>

      <div v-show="completedText">
        <t-form-item class="">
          <t-alert theme="info">
            <template #message>{{ completedText }}</template>
          </t-alert>
        </t-form-item>

        <t-form-item class="!m-0">
          <t-button block @click="handleCompleted">我知道了</t-button>
        </t-form-item>
      </div>
    </t-form>

    <t-guide
      v-model="currentGuide"
      :steps="steps"
      @finish="handleFinish"
      hideCounter
      :finishButtonProps="{ content: '我知道了' }"
    />
  </div>
</template>
