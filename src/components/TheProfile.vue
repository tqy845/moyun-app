<script setup lang="ts">
import { MessagePlugin, FormInstanceFunctions, FormProps } from 'tdesign-vue-next'
import { UserUpdateModel } from '@/api/models/userModel'
import { useUserStore } from '@/stores'
import { updateUserInfo } from '@/api/user'

defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
const { user } = useUserStore()
const formRef = ref<FormInstanceFunctions>()
const fm = reactive<UserUpdateModel>({
  realName: '',
  password: ''
})
// 确认密码
const confirmPasswordRef = ref('')
const passwordValidator = (val: string) => {
  if (val.length > 0 && val.length <= 6) {
    return { result: false, message: '密码太简单了！', type: 'warning' }
  }
  if (val.length > 6 && val.length < 8) {
    return { result: false, message: '密码还可以再加强一点！', type: 'warning' }
  }
  return { result: true, message: '密码强度很高，请记得保管好！', type: 'success' }
}
const rePassword = () =>
  new Promise((resolve) => {
    resolve(fm.password === confirmPasswordRef.value)
  })

// 校验规则
const rules: FormProps['rules'] = {
  password: [{ min: 5 }, { max: 15 }, { validator: passwordValidator }],
  rePassword: [
    { min: 5 },
    { max: 15 },
    {
      validator: rePassword,
      message: '两次密码不一致'
    }
  ]
}
const submitLoadingRef = ref()

const onSubmit = async () => {
  try {
    submitLoadingRef.value = true
    if (Object.isExtensible(await formRef.value?.validate())) {
      return
    }
    formRef.value?.clearValidate()
    const _fm = { ...fm }
    if (!_fm.password) delete _fm.password
    const { fail, message } = await updateUserInfo(_fm)
    if (!fail) {
      await MessagePlugin.success(message)
      Object.assign(user, fm)
      fm.password = confirmPasswordRef.value = ''
      return
    }
    await MessagePlugin.error(message)
  } finally {
    submitLoadingRef.value = false
  }
}

const executed = () => {
  Object.assign(fm, user)
}

onMounted(executed)
</script>

<template>
  <t-drawer
    :visible="visible"
    attach="body"
    mode="push"
    placement="top"
    header="设置"
    size="medium"
    @confirm="onSubmit"
    :on-overlay-click="() => emit('close')"
    @cancel="$emit('close')"
    :confirmBtn="{ loading: submitLoadingRef, content: '保存' }"
    :cancelBtn="{ content: '返回' }"
  >
    <div class="pa-4">
      <t-form ref="formRef" :data="fm" :rules="rules">
        <t-form-item label="账户">
          <t-space :size="10" class="d-inline-flex items-center">
            <t-avatar>{{ user.realName[0] ?? user.email[0] }}</t-avatar>
            <div class="">
              {{ user.email }}
            </div>
          </t-space>
        </t-form-item>

        <t-form-item label="邮箱">
          <t-input :value="user.email" disabled></t-input>
        </t-form-item>

        <t-form-item label="用户名" name="username">
          <t-input :value="user.username" disabled></t-input>
        </t-form-item>

        <t-form-item label="真实姓名" name="realName">
          <t-input v-model="fm.realName"></t-input>
        </t-form-item>

        <t-form-item label="密码" help="注意：修改密码后需要重新登录" name="password">
          <t-input v-model="fm.password" type="password"></t-input>
        </t-form-item>

        <t-form-item label="确认密码" name="rePassword">
          <t-input v-model="confirmPasswordRef" type="password"></t-input>
        </t-form-item>
      </t-form>
    </div>
  </t-drawer>
</template>

<style scoped lang="scss"></style>
