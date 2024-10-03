import { Router } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { start, close } from '@/plugins/nprogress'

export default function registerInterceptors(router: Router) {
  router.beforeEach((to, _, next) => {
    start()
    if (to.meta.auth && useUserStore().token === '') {
      next('/sign/in')
    } else {
      next()
    }
  })

  router.afterEach(() => {
    close()
  })
}
