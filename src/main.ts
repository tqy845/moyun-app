import { createApp } from 'vue'
import App from './App.vue'

import '@unocss/reset/sanitize/sanitize.css'
import '@unocss/reset/sanitize/assets.css'
import 'virtual:uno.css'
import registerPlugins from './plugins'
import { Icon } from 'tdesign-icons-vue-next'
import '@/assets/css/index.scss'

async function bootstrap() {
  const app = createApp(App)
  await registerPlugins(app)

  app.component('Icon', Icon)
  app.mount('#app')
}

bootstrap().then(async () => {
  // console.log(`ENV = `, import.meta.env)
})
