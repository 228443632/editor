/**
 * @Description: 路由
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 05/10/25 PM1:44
 */
import { routes } from './routes'

// types
import { createWebHashHistory, createRouter } from 'vue-router'
import type { Router } from 'vue-router'

export default {
  _router: undefined as unknown as Router,

  _base: '/',

  install(app) {
    const router = createRouter({
      history: createWebHashHistory(this._base),
      // @ts-expect-error
      routes,
    }) as unknown as Router
    this._router = router

    // console.log('router', router, asyncRoutes)

    routerMiddlewareAuth.call(router)

    app.use(router)
  },
}

/**
 * 路由钩子鉴权
 */
function routerMiddlewareAuth() {
  /**
   * 路由鉴权
   */
  this.beforeEach((to, from, next) => {
    return next()
  })

  this.afterEach(() => {})
}
