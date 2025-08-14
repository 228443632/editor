/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 11/08/25 PM8:49
 */
import type { Editor } from '@tiptap/core'
import { cssUtil } from '@/examples/utils/css-util'
import { sub } from 'sf-utils2'

export class PageBreakBaseDom {
  a4: ReturnType<typeof cssUtil.getPaperSize>
  a4Top = 96
  a4BodyH: number
  a4PageGap = 16
  perPageTop: number

  editor: Editor
  constructor(editor: Editor) {
    this.editor = editor
    this.a4 = cssUtil.getPaperSize('A4')
    this.a4BodyH = +sub(this.a4._basePx.h - this.a4Top * 2)
    this.perPageTop = this.a4._basePx.h + this.a4PageGap
  }

  /**
   * 通过top获取页码
   * @param top
   */
  resolvePageNumByTop(top: number) {
    return Math.floor(top / this.perPageTop)
  }

  /**
   * 获取dom的边界信息
   * @param dom
   */
  resolveBoundRect(dom: Element) {
    const domRect = dom.getBoundingClientRect()
    return this.resolveBoundRectByRect(domRect)
  }

  /**
   * 获取dom的边界信息
   * @param dom
   */
  resolveBoundRectByDom(dom: Element) {
    const domRect = dom.getBoundingClientRect()
    return this.resolveBoundRectByRect(domRect)
  }

  /**
   * 获取dom的边界信息
   * @param domRect
   */
  resolveBoundRectByRect(domRect: DOMRect) {
    const viewDomRect = this.docDOM.getBoundingClientRect()
    const left = domRect.left - viewDomRect.left
    const top = domRect.top - viewDomRect.top
    const pageTop = top % (this.a4._basePx.h + this.a4PageGap)
    const pageNum = Math.floor(top / (this.a4._basePx.h + this.a4PageGap))

    return {
      left,
      top,
      width: domRect.width,
      height: domRect.height,
      bottom: top + domRect.height,
      right: left + domRect.width,
      rightOffset: viewDomRect.right - domRect.right,
      bottomOffset: viewDomRect.bottom - domRect.bottom,
      pageTop,
      pageNum,
      pageBottom: pageTop + domRect.height,
      pageBottomOffset: this.a4._basePx.h - pageTop - domRect.height,
    }
  }


  /**
   * 获取页码页面位置范围
   * @param pageNum
   */
  getPageScopeByNum(pageNum: number) {
    const pageTop =
      pageNum > 1 ? (pageNum - 1) * (this.a4._basePx.h + this.a4PageGap) : 0
    const top = pageTop + this.a4Top
    return {
      top,
      bottom: top + this.a4BodyH,
    }
  }

  get state() {
    return this.editor.state
  }

  get selection() {
    return this.state.selection
  }

  get view() {
    return this.editor.view
  }

  get docDOM() {
    return this.editor.view.dom as HTMLDivElement
  }
}
