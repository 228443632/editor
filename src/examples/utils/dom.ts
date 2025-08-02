/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 23/07/25 PM2:00
 */
import type { Editor } from '@tiptap/core'

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


/**
 * 获取当前页码， 根据目标dom
 * @param editor
 * @param target
 * TODO
 */
export function getCurPageNumByDOM(editor: Editor, target: HTMLElement) {
  const targetRect = target.getBoundingClientRect()

  const isEnablePagination = editor.view.dom['__options']?.isPagination // 是否分页



  // return {
  //   left: rect.left + window.scrollX,
  //   top: rect.top + window.scrollY,
  //   width: rect.width,
  //   height: rect.height,
  // }
}
