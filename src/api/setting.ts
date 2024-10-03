import { request } from '@/utils/request'
import { SettingModel } from './models/settingModel'

const Api = {
  Add: `/setting`,
  Save: `/setting`
}

export function putSave<T>(body: SettingModel) {
  return request.put<T>(Api.Save, {
    body
  })
}
