/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 30/07/25 PM10:55
 */
import { type Editor, Extension } from '@tiptap/core'
import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet, EditorView } from '@tiptap/pm/view'
import { rafThrottle } from '@/views/doc-editor/utils/dom'
import { mountWithCreateApp } from '@/utils/vnode'
import PaginationBreakWidget from './PaginationBreakWidget.vue'

export interface PaginationBreakOptions {
  provider: any
  /** 每一页 大小*/
  pageHeight: number
  /** 分页间距 */
  pageGap: number
  /** 分页背景颜色 */
  pageBreakBackground?: string
  /** 分页眉高度 */
  pageHeaderHeight: number
}
const PAGE_COUNT_META_KEY = 'PAGE_COUNT_META_KEY'
export const PaginationBreak = Extension.create<PaginationBreakOptions>({
  name: 'PaginationBreak',
  addOptions() {
    return {
      provider: {
        layoutSize: {}
      },
      /** 每一页 大小*/
      pageHeight: 800,
      /** 分页间距 */
      pageGap: 50,
      /** 分页背景颜色 */
      pageBreakBackground: '#ffffff',
      /** 分页眉高度 */
      pageHeaderHeight: 10,
    }
  },
  onCreate() {
    const targetNode = this.editor.view.dom
    targetNode.classList.add('sf-with-pagination')
    const config = {
      attributes: true,
      subtree: true,
      childList: true,
    } as MutationObserverInit
    const _pageHeaderHeight = this.options.pageHeaderHeight
    const _pageContainerHeight = this.options.pageHeight - _pageHeaderHeight * 2

    document.documentElement.style.setProperty(
      '--page-height',
      `${_pageContainerHeight}px`,
    )
    const refreshPage = (targetNode: HTMLElement) => {
      const paginationElement = targetNode.querySelector('[data-sf-pagination]')
      if (paginationElement) {
        const lastPageBreak = paginationElement.lastElementChild?.querySelector(
          '.sf-page__breaker',
        ) as HTMLElement
        if (lastPageBreak) {
          const minHeight = lastPageBreak.offsetTop + lastPageBreak.offsetHeight
          targetNode.style.minHeight = `${minHeight}px`
        }
      }
    }

    if (import.meta.env.PROD || import.meta.env.DEV) {
      const callback = (
        mutationList: MutationRecord[],
        observer: MutationObserver,
      ) => {
        if (mutationList.length > 0 && mutationList[0].target) {
          const _target = mutationList[0].target as HTMLElement
          if (_target.classList.contains('sf-with-pagination')) {
            const currentPageCount = getExistingPageCount(this.editor.view)
            const pageCount = calculatePageCount(this.editor.view, this.options)
            if (currentPageCount !== pageCount) {
              const tr = this.editor.view.state.tr.setMeta(
                PAGE_COUNT_META_KEY,
                Date.now(),
              )
              this.editor.view.dispatch(tr)
            }

            refreshPage(_target)
          }
        }
      }
      const rafCallback = rafThrottle(callback)
      const observer = new MutationObserver(rafCallback)
      observer.observe(targetNode, config)
      refreshPage(targetNode)
    }
  },
  addProseMirrorPlugins() {
    const pageOptions = this.options
    const editor = this.editor
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _pluginCtx = this
    return [
      new Plugin({
        key: new PluginKey('PaginationBreak'),

        state: {
          init(_, state) {
            const widgetList = createDecoration.call(
              _pluginCtx,
              state,
              pageOptions,
            )
            return DecorationSet.create(state.doc, widgetList)
          },
          apply(tr, prevDecos, oldState, newState) {
            let pageCount = calculatePageCount(editor.view, pageOptions)
            const currentPageCount = getExistingPageCount(editor.view)
            pageCount = pageCount > 1 ? pageCount : 1
            if (pageCount !== currentPageCount) {
              const widgetList = createDecoration.call(
                _pluginCtx,
                newState,
                pageOptions,
              )
              return DecorationSet.create(newState.doc, [...widgetList])
            }
            return prevDecos
          },
        },

        props: {
          decorations(state: EditorState) {
            return this.getState(state) as DecorationSet
          },
        },
      }),
    ]
  },
})

/**
 * 获取已存在的页码总数
 * @param view
 */
function getExistingPageCount(view: EditorView) {
  const editorDom = view.dom
  const paginationElement = editorDom.querySelector('[data-sf-pagination]')
  if (paginationElement) {
    return paginationElement.children.length
  }
  return 0
}

function isHiddenElRect(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  return (
    rect.width === 0 &&
    rect.height === 0 &&
    rect.left === 0 &&
    rect.top === 0 &&
    rect.right === 0 &&
    rect.bottom === 0
  )
}

/**
 * 计算页码总数
 * @param editor
 * @param pageOptions
 */
function calculatePageCount(
  view: EditorView,
  pageOptions: PaginationBreakOptions,
) {
  const editorDom = view.dom
  const pageContentAreaHeight =
    pageOptions.pageHeight - pageOptions.pageHeaderHeight * 2
  const paginationElement = editorDom.querySelector('[data-sf-pagination]')
  const currentPageCount = getExistingPageCount(view)
  if (paginationElement) {
    let lastElementOfEditor = editorDom.lastElementChild
    const lastPageBreak =
      paginationElement.lastElementChild?.querySelector('.sf-page__breaker')
    if (lastElementOfEditor && lastPageBreak) {
      // 是表格case
      if (
        lastElementOfEditor.classList.contains('tableWrapper') ||
        lastElementOfEditor.tagName === 'table'
      ) {
        lastElementOfEditor = lastElementOfEditor.querySelector(
          'table > .table-wrapper-tbody > section.table-row-group:last-of-type',
        ) as HTMLElement
      }

      const lastPageGap =
        lastElementOfEditor.getBoundingClientRect().bottom -
        lastPageBreak.getBoundingClientRect().bottom
      if (lastPageGap > 0) {
        const addPage = Math.ceil(lastPageGap / pageContentAreaHeight)
        return currentPageCount + addPage
      } else {
        const lpFrom = -pageOptions.pageHeaderHeight
        const lpTo = -(pageOptions.pageHeight - pageOptions.pageHeaderHeight)
        if (lastPageGap > lpTo && lastPageGap < lpFrom) {
          return currentPageCount
        } else if (lastPageGap < lpTo) {
          const pageHeightOnRemove =
            pageOptions.pageHeight + pageOptions.pageGap
          const removePage = Math.floor(lastPageGap / pageHeightOnRemove)
          return currentPageCount + removePage
        } else {
          return currentPageCount
        }
      }
    }
    return 1
  } else {
    const editorHeight = editorDom.scrollHeight
    const pageCount = Math.ceil(editorHeight / pageContentAreaHeight)
    return pageCount <= 0 ? 1 : pageCount
  }
}

/**
 * 创建装饰器视图
 * @param state
 * @param pageOptions
 * @param isInitial
 */
function createDecoration(
  state: EditorState,
  pageOptions: PaginationBreakOptions,
  isInitial = false,
): Decoration[] {
  const editor = this.editor as Editor
  const pageWidget = Decoration.widget(
    0,
    (view) => {
      // console.log('view-update', view, this)

      // 设置页码数
      const pageCount = calculatePageCount(view, pageOptions)
      const paginationDOM = document.createElement('div')
      if (pageCount < 0) return paginationDOM
      paginationDOM.dataset.sfPagination = 'true'
      paginationDOM.style.width = `calc(100% + 2 * var(--umo-page-margin-left))`
      paginationDOM.style.left = `calc(-1 * var(--umo-page-margin-left))`
      paginationDOM.setAttribute('page-height', `${pageOptions.pageHeight}px`)
      // el.setAttribute('page-width', `${el.offsetWidth}px`)
      paginationDOM.setAttribute('page-gap', `${pageOptions.pageGap}px`)
      paginationDOM.setAttribute(
        'page-header-height',
        `${pageOptions.pageHeaderHeight}px`,
      )
      paginationDOM.setAttribute(
        'page-footer-height',
        `${pageOptions.pageHeaderHeight}px`,
      )
      paginationDOM.setAttribute(
        'page-body-height',
        `${pageOptions.pageHeight - 2 * pageOptions.pageHeaderHeight}px`,
      )

      // 设置总页码数量
      pageOptions.provider.layoutSize.value.pagination.total = pageCount

      // const container = document.createElement('div')
      void Promise.resolve().then(() => {
        paginationDOM['__vueAppInstance'] = mountWithCreateApp(
          PaginationBreakWidget,
          {
            element: paginationDOM,
            props: {
              pageOptions,
              view,
              pageCount,
            },
          },
        )

        // const nodePosList = editor.$nodes('tableCell')
        // const positionList = view.dom['__pageNumPosList'] || []
        // if (nodePosList.length) {
        // nodePosList.forEach((nodePos) => {
        //   // const node = nodePos.node
        //   // const nodeDOM = editor.view.nodeDOM(nodePos.pos)
        //   // console.log('nodeDOM', nodeDOM)
        // })
        // }

        // console.log(
        //   'editor+02',
        //   view.dom['__pageNumPosList'],
        //   nodePosList
        // )

        // view.state.doc.descendants((node, pos) => {
        //   console.log('node + pos')
        //   return true
        // })

        // sepc 单元测试

        // for (let i = 0; i < pageCount; i++) {
        // const pageDOM = view.dom.querySelector(
        //   `.sf-page__sep-wrap[page-numb="${i + 1}"]`,
        // )
        // const rect = pageDOM.getBoundingClientRect()
        // pageDOM.setAttribute('rect', JSON.stringify(rect))
        //
        // const headerDOM = pageDOM.querySelector('.sf-page__header')
        // const footerDOM = pageDOM.querySelector('.sf-page__footer')
        // }

        // const pageDOMS = Array.from(
        //   view.dom.querySelectorAll('.sf-page__sep-wrap'),
        // ) as HTMLDivElement[]
        //
        // pageDOMS.forEach((item) => {
        //   const headerDOM = item.querySelector('.sf-page__header')
        //   const footerDOM = item.querySelector('.sf-page__footer')
        // })
        //
        // const headerDOMS = view.dom.querySelectorAll(
        //   '.sf-page__sep-wrap .sf-page__header',
        // )
        //
        // headerDOMS.forEach((headerDOM: HTMLDivElement) => {
        //   console.log('headerDOMS', headerDOM.getBoundingClientRect())
        // })
      })
      return paginationDOM
    },
    { side: -1 },
  )

  // const demoWidget = Decoration.widget(
  //   0,
  //   (view) => {
  //     const pageCount = calculatePageCount(view, pageOptions)
  //     const el = document.createElement('div')
  //     // const container = document.createElement('div')
  //     void Promise.resolve().then(() => {
  //       el['__vueAppInstance'] = mountWithCreateApp(Demo, {
  //         element: el,
  //         props: {
  //           pageOptions,
  //         },
  //       })
  //
  //       // sepc 单元测试
  //
  //       for (let i = 0; i < pageCount; i++) {
  //         // const pageDOM = view.dom.querySelector(
  //         //   `.sf-page__sep-wrap[page-numb="${i + 1}"]`,
  //         // )
  //         // const rect = pageDOM.getBoundingClientRect()
  //         // pageDOM.setAttribute('rect', JSON.stringify(rect))
  //         //
  //         // const headerDOM = pageDOM.querySelector('.sf-page__header')
  //         // const footerDOM = pageDOM.querySelector('.sf-page__footer')
  //       }
  //       console.log('测试')
  //
  //       // const pageDOMS = Array.from(
  //       //   view.dom.querySelectorAll('.sf-page__sep-wrap'),
  //       // ) as HTMLDivElement[]
  //       //
  //       // pageDOMS.forEach((item) => {
  //       //   const headerDOM = item.querySelector('.sf-page__header')
  //       //   const footerDOM = item.querySelector('.sf-page__footer')
  //       // })
  //       //
  //       // const headerDOMS = view.dom.querySelectorAll(
  //       //   '.sf-page__sep-wrap .sf-page__header',
  //       // )
  //       //
  //       // headerDOMS.forEach((headerDOM: HTMLDivElement) => {
  //       //   console.log('headerDOMS', headerDOM.getBoundingClientRect())
  //       // })
  //     })
  //     return el
  //   },
  //   { side: -1 },
  // )

  return !isInitial ? [pageWidget] : [pageWidget]
}
