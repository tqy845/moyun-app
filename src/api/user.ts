import { UserLoginModel, UserLoginResModel, UserRegisterModel } from '@/api/models/userModel'
import { request } from '@/utils/request'
import { UserModel } from './models/userModel.ts'

const Api = {
  Register: `/public/user/sign/up`,
  Login: `/public/user/sign/in`,
  GetInfo: `/user`,
  Update: (id: number) => `/user/${id}`
}

export function postUserRegister(body: UserRegisterModel) {
  return request.post<{ fail: number; message: string }>(
    Api.Register,
    {
      body
    },
    {
      whileList: true,
      isReturnNativeResponse: true
    }
  )
}

export function postUserLogin(body: UserLoginModel) {
  return request.post<UserLoginResModel>(
    Api.Login,
    {
      body
    },
    {
      whileList: true
    }
  )
}

export function updateUserInfo<T>(body: UserModel) {
  return request.put<T>(Api.Update(body.id), {
    body
  })
}

export function getUserInfo<T>() {
  return request.get<T>(Api.GetInfo, {})
}
