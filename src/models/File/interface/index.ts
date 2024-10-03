import { GroupEnum } from '@/constants'
import { MenuItemEnum } from '../enum'

export interface Prototype {
  group?: GroupEnum
  level?: number
  menuItems?: Array<MenuItemEnum>
}
