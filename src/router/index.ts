import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

import { routerUtils } from '@/utils/functions'
import { App } from 'vue'
import registerInterceptors from './permission'

const { createRouteComponent } = routerUtils

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: createRouteComponent('default/default'),
    children: [
      {
        meta: { auth: true },
        path: '',
        component: createRouteComponent(`default/index`)
      }
    ]
  },
  {
    path: '/sign',
    component: createRouteComponent(`sign/sign`),
    children: [
      {
        meta: { keepAlive: true },
        path: 'in',
        component: createRouteComponent(`SignInView`)
      },
      {
        meta: { keepAlive: true },
        path: 'up',
        component: createRouteComponent(`SignUpView`)
      }
    ]
  }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})

/**
 * 注册路由
 * @param app Vue实例
 */
export default async function registerRouter(app: App) {
  app.use(router)
  registerInterceptors(router)
  await router.isReady()
}
