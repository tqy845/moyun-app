import { defineStore } from 'pinia'
import { getDefaultSetting } from '@/stores/modules/user/helper'
import { UserLoginModel } from '@/api/models/userModel'
import { postUserLogin, getUserInfo } from '@/api/user'
import { useDirStore, useSystemStore } from '@/stores'
import { User } from '@/models/User'
import { router } from '@/router'

export const useUserStore = defineStore('user-store', () => {
  const loginInfo = ref({
    email: '',
    password: '',
    remember: false
  })
  const token = ref('')
  const endpoint = ref("")
  const user = ref({
    id: 0,
    username: '',
    realName: '',
    password: '',
    email: ''
  })

  /**
     * 登录
     * @param form 登录信息
     */
  const login = async (form: UserLoginModel) => {
    try {
      // 是否记住我
      if (form.remember) {
        Object.assign(loginInfo.value, form)
      } else {
        Object.assign(loginInfo.value, getDefaultSetting().loginInfo)
      }
      await exit(false)
      // 用户请求登录
      const loginResult = await postUserLogin(form)
      token.value = loginResult.token
      endpoint.value = loginResult.endpoint
      user.value = loginResult.user
      // 加载侧边栏菜单项
      await useDirStore().readAsideMenu()
      // init(settings)
      console.log('初始化完成')
      await router.push('/')
      return true
    } catch (e) {
      return false
    }
  }
  /**
   * 退出
   */
  const exit = (toLoginPage: boolean = true) => {
    const systemStore = useSystemStore()
    // const fileStore = useFileStore()
    systemStore.$reset()
    // useDirStore().$reset()
    if (toLoginPage) router.replace('/sign/in')
  }
  /**
   * 获取用户信息
   */
  const userinfo = async () => {
    const result = await getUserInfo<{ user: User }>()
    Object.assign(user, result.user)
    return
  }

  return {
    loginInfo,
    token,
    endpoint,
    user,

    login,
    exit,
    userinfo
  }
}, {
  persist: [
    {
      storage: localStorage,
      paths: ['user', 'loginInfo']
    }, {
      storage: sessionStorage,
      paths: ['token', 'endpoint']
    }
  ]
})
