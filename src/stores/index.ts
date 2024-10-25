import { App } from 'vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const pinia = createPinia()

export default function registerStore(app: App) {
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)
}

export * from './modules/system'
export * from './modules/user'
export * from './modules/file'
export * from './modules/file-map'
export * from './modules/file-attr'
export * from './modules/setting'
export * from './modules/dir'
export * from './modules/path'
export * from './modules/upload'
export * from './modules/download'
export * from './modules/preivew'
