/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 23/07/25 PM2:00
 */
// import type { Editor } from '@tiptap/core'

type ThrottledFunction<T> = (...args: any[]) => T

export const MAX_Z_INDEX = 2 ** 16

/**
 * raf版本 防抖
 * @param fn
 */
export function rafThrottle<T>(fn: ThrottledFunction<T>) {
  let rafId: number | null = null
  return function (...args: any[]) {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        const result = fn.apply(this, args)
        rafId = null
        return result
      })
    }
  }
}
