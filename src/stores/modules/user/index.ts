import { defineStore } from 'pinia'
import { getDefaultSetting, UserStore } from '@/stores/modules/user/helper'
import { UserLoginModel } from '@/api/models/userModel'
import { postUserLogin, getUserInfo } from '@/api/user'
import { useDirStore, useSystemStore } from '@/stores'
import { User } from '@/models/User'
import { router } from '@/router'

export const useUserStore = defineStore('user-store', {
  state: () => getDefaultSetting(),
  persist: [
    {
      storage: sessionStorage,
      paths: ['token', 'refreshToken', 'user', 'profile']
    },
    {
      storage: localStorage,
      paths: ['loginInfo']
    }
  ],
  actions: {
    /**
     * 登录
     * @param form 登录信息
     */
    async login(form: UserLoginModel) {
      try {
        // 是否记住我
        if (form.remember) {
          Object.assign(this.loginInfo, form)
        } else {
          const { loginInfo } = getDefaultSetting()
          Object.assign(this.loginInfo, loginInfo)
        }

        await this.exit(false)
        // 用户请求登录
        const { token, user } = await postUserLogin<UserStore>(form)
        this.token = token
        this.user = user
        // 加载侧边栏菜单项
        await useDirStore().readAsideMenu()
        // init(settings)
        console.log('初始化完成')
        await router.push('/')
        return true
      } catch (e) {
        return false
      }
    },
    /**
     * 退出
     */
    async exit(toLoginPage: boolean = true) {
      const systemStore = useSystemStore()
      // const fileStore = useFileStore()
      systemStore.$reset()
      // useDirStore().$reset()
      if (toLoginPage) router.replace('/sign/in')
    },
    /**
     * 获取用户信息
     */
    async userinfo() {
      const { user } = await getUserInfo<{ user: User }>()
      Object.assign(this.user, user)
      return
    }
  }
})
