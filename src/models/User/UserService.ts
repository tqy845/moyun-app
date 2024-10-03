import { update } from '@/api'

export class UserService {
  private _instance?: UserService

  private constructor() {}

  public getInstance() {
    if (!this._instance) this._instance = new UserService()
    return this._instance
  }

  public login() {}

  public logout() {}

  public profile() {}

  public async update({ username, password }: { username?: string; password?: string }) {
    const formData = new FormData()
    if (username) formData.append('username', username)
    if (password) formData.append('password', password)
    return await update(formData)
  }
}
