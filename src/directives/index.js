/**
 * @Description: vue 的指令
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 2023/7/20 17:32
 */
import { isPlainObject, isFunction, kebabCase } from 'sf-utils2'
import { basename } from 'path-browserify'
import spin from './spin.tsx'

export default {
  install(app) {
    const map = {
      spin,
    }
    Object.keys(map).forEach((key) => {
      if (isPlainObject(map[key])) {
        if (isFunction(map[key]?.install)) {
          app.use(map[key])
        } else {
          const name = basename(key, '.js')
          app.directive(kebabCase(name), map[key])
        }
      }
    })

    // requireAllModule({
    //   requireContext: require.context('./', true, /\.js$/),
    //   exclude: ['./index.js']
    // }).forEach(([v, k]) => {
    //   if (isPlainObject(v?.default)) {
    //     if (isFunction(v?.default?.install)) {
    //       app.use(v?.default)
    //     } else {
    //       const name = basename(k, '.js')
    //       app.directive(kebabCase(name), v.default)
    //     }
    //   }
    // })
  },

  focus,
  spin,
}
