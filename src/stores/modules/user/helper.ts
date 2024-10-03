import { SettingModel } from '@/api/models/settingModel'
import { UserLoginModel, UserRegisterModel } from '@/api/models/userModel'
import { User } from '@/models/User'

export interface UserToken {
  token: string
}

export interface UserStore extends UserToken {
  user: User
  loginInfo: UserLoginModel
  registerInfo: UserRegisterModel
  settings: Array<SettingModel>
  profile: boolean
}

export const getDefaultSetting = (): UserStore => {
  return {
    token: '',
    user: {
      id: 0,
      username: '',
      realName: '',
      password: '',
      email: ''
    },
    loginInfo: {
      email: '',
      password: '',
      remember: false
    },
    registerInfo: {
      email: '',
      password: '',
      rePassword: '',
      agreement: false
    },
    settings: [],
    profile: false
  }
}

export const getUserEmailSuffix = (options: Ref, value: string) => {
  const emailSuffixList = [
    '@qq.com',
    '@gmail.com',
    '@hotmail.com',
    '@yahoo.com',
    '@outlook.com',
    '@icloud.com',
    '@aol.com',
    '@live.com',
    '@163.com',
    '@126.com',
    '@sina.com',
    '@yahoo.co.jp',
    '@yahoo.co.uk',
    '@mail.com'
  ]

  options.value.length = 0
  if (!value) return
  for (const opt of emailSuffixList) {
    const [prefix, suffix] = value.split('@')
    if (suffix != undefined) {
      if (opt.startsWith(`@${suffix}`)) {
        const label = `${prefix}${opt}`
        options.value.push(label)
      }
      continue
    }
    options.value.push(value.concat(opt))
  }
}
