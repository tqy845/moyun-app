export interface UserModel {
  id: number
  name: string
  email: string
  password: string
  createdAt: string
  updatedAt: string
  username: string
  isAdmin: number
  realName: string
  activatedAt: string
}

export interface UserLoginModel {
  email: string
  password: string
  remember?: boolean
}

export interface UserLoginResModel {
  token: string
  user: UserModel
  endpoint:string
}

export interface UserRegisterModel extends UserLoginModel {
  rePassword: string
  agreement: boolean
}

export interface UserUpdateModel {
  realName?: string
  password?: string
}
