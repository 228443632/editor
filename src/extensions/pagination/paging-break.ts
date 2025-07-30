/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 28/07/25 PM10:51
 */
import { Extension } from '@tiptap/core'
import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet, EditorView } from '@tiptap/pm/view'
import { rafThrottle } from '@/examples/utils/dom'

interface PagingBreakOptions {
  pageHeight: number
  pageGap: number
  pageBreakBackground: string
  pageHeaderHeight: number
  pageGapBorderSize: number
  footerRight: string
  footerLeft: string
  headerRight: string
  headerLeft: string
}
const PAGE_COUNT_META_KEY = 'PAGE_COUNT_META_KEY'
export const PagingBreak = Extension.create<PagingBreakOptions>({
  name: 'PagingBreak',
  addOptions() {
    return {
      pageHeight: 800,
      pageGap: 50,
      pageGapBorderSize: 1,
      pageBreakBackground: '#ffffff',
      pageHeaderHeight: 10,
      footerRight: '{page}',
      footerLeft: '',
      headerRight: '',
      headerLeft: '',
    }
  },
  onCreate() {
    const targetNode = this.editor.view.dom
    targetNode.classList.add('sf-with-pagination')
    const config = { attributes: true }
    const _pageHeaderHeight = this.options.pageHeaderHeight
    const _pageHeight = this.options.pageHeight - _pageHeaderHeight * 2

    document.documentElement.style.setProperty(
      '--page-height',
      `${_pageHeight}px`,
    )
    const refreshPage = (targetNode: HTMLElement) => {
      const paginationElement = targetNode.querySelector('[data-sf-pagination]')
      if (paginationElement) {
        const lastPageBreak = paginationElement.lastElementChild?.querySelector(
          '.breaker',
        ) as HTMLElement
        if (lastPageBreak) {
          const minHeight = lastPageBreak.offsetTop + lastPageBreak.offsetHeight
          targetNode.style.minHeight = `${minHeight}px`
        }
      }
    }

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
  },
  addProseMirrorPlugins() {
    const pageOptions = this.options
    const editor = this.editor
    return [
      new Plugin({
        key: new PluginKey('pagingBreak'),

        state: {
          init(_, state) {
            const widgetList = createDecoration(state, pageOptions)
            return DecorationSet.create(state.doc, widgetList)
          },
          apply(tr, oldDeco, oldState, newState) {
            const pageCount = calculatePageCount(editor.view, pageOptions)
            const currentPageCount = getExistingPageCount(editor.view)
            if ((pageCount > 1 ? pageCount : 1) !== currentPageCount) {
              const widgetList = createDecoration(newState, pageOptions)
              return DecorationSet.create(newState.doc, [...widgetList])
            }
            return oldDeco
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

const getExistingPageCount = (view: EditorView) => {
  const editorDom = view.dom
  const paginationElement = editorDom.querySelector('[data-sf-pagination]')
  if (paginationElement) {
    return paginationElement.children.length
  }
  return 0
}
const calculatePageCount = (
  view: EditorView,
  pageOptions: PagingBreakOptions,
) => {
  const editorDom = view.dom
  const pageContentAreaHeight =
    pageOptions.pageHeight - pageOptions.pageHeaderHeight * 2
  const paginationElement = editorDom.querySelector('[data-sf-pagination]')
  const currentPageCount = getExistingPageCount(view)
  if (paginationElement) {
    const lastElementOfEditor = editorDom.lastElementChild
    const lastPageBreak =
      paginationElement.lastElementChild?.querySelector('.breaker')
    if (lastElementOfEditor && lastPageBreak) {
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

function createDecoration(
  state: EditorState,
  pageOptions: PagingBreakOptions,
  isInitial = false,
): Decoration[] {
  const pageWidget = Decoration.widget(
    0,
    (view) => {
      const _pageGap = pageOptions.pageGap
      const _pageHeaderHeight = pageOptions.pageHeaderHeight
      const _pageHeight = pageOptions.pageHeight - _pageHeaderHeight * 2
      const _pageBreakBackground = pageOptions.pageBreakBackground

      const breakerWidth = view.dom.clientWidth

      const el = document.createElement('div')
      el.dataset.sfPagination = 'true'

      const pageBreakDefinition = ({
        firstPage = false,
        lastPage = false,
      }: {
        firstPage: boolean
        lastPage: boolean
      }) => {
        const pageContainer = document.createElement('div')
        pageContainer.classList.add('sf-page-break')

        const page = document.createElement('div')
        page.classList.add('page')
        page.style.position = 'relative'
        page.style.float = 'left'
        page.style.clear = 'both'
        page.style.marginTop = firstPage
          ? `calc(${_pageHeaderHeight}px + ${_pageHeight}px)`
          : _pageHeight + 'px'

        const pageBreak = document.createElement('div')
        pageBreak.classList.add('breaker')
        pageBreak.style.width = `calc(${breakerWidth}px)`
        pageBreak.style.marginLeft = `calc(calc(calc(${breakerWidth}px - 100%) / 2) - calc(${breakerWidth}px - 100%))`
        pageBreak.style.marginRight = `calc(calc(calc(${breakerWidth}px - 100%) / 2) - calc(${breakerWidth}px - 100%))`
        pageBreak.style.position = 'relative'
        pageBreak.style.float = 'left'
        pageBreak.style.clear = 'both'
        pageBreak.style.left = '0px'
        pageBreak.style.right = '0px'
        pageBreak.style.zIndex = '2'

        const pageFooter = document.createElement('div')
        pageFooter.classList.add('sf-page-footer')
        pageFooter.style.height = _pageHeaderHeight + 'px'

        const footerRight = pageOptions.footerRight.replace(
          '{page}',
          `<span class="sf-page-number"></span>`,
        )
        const footerLeft = pageOptions.footerLeft.replace(
          '{page}',
          `<span class="sf-page-number"></span>`,
        )

        const pageFooterLeft = document.createElement('div')
        pageFooterLeft.classList.add('sf-page-footer-left')
        pageFooterLeft.innerHTML = footerLeft

        const pageFooterRight = document.createElement('div')
        pageFooterRight.classList.add('sf-page-footer-right')
        pageFooterRight.innerHTML = footerRight

        pageFooter.append(pageFooterLeft)
        pageFooter.append(pageFooterRight)

        const pageSpace = document.createElement('div')
        pageSpace.classList.add('sf-pagination-gap')
        pageSpace.style.height = _pageGap + 'px'
        pageSpace.style.borderLeft = '1px solid'
        pageSpace.style.borderRight = '1px solid'
        pageSpace.style.position = 'relative'
        pageSpace.style.setProperty('width', 'calc(100% + 2px)', 'important')
        pageSpace.style.left = '-1px'
        pageSpace.style.backgroundColor = _pageBreakBackground
        pageSpace.style.borderLeftColor = _pageBreakBackground
        pageSpace.style.borderRightColor = _pageBreakBackground

        const pageHeader = document.createElement('div')
        pageHeader.classList.add('sf-page-header')
        pageHeader.style.height = _pageHeaderHeight + 'px'

        const pageHeaderLeft = document.createElement('div')
        pageHeaderLeft.classList.add('sf-page-header-left')
        pageHeaderLeft.innerHTML = pageOptions.headerLeft

        const pageHeaderRight = document.createElement('div')
        pageHeaderRight.classList.add('sf-page-header-right')
        pageHeaderRight.innerHTML = pageOptions.headerRight

        pageHeader.append(pageHeaderLeft, pageHeaderRight)
        pageBreak.append(pageFooter, pageSpace, pageHeader)
        pageContainer.append(page, pageBreak)

        return pageContainer
      }

      const page = pageBreakDefinition({ firstPage: false, lastPage: false })
      const firstPage = pageBreakDefinition({
        firstPage: true,
        lastPage: false,
      })
      const fragment = document.createDocumentFragment()

      const pageCount = calculatePageCount(view, pageOptions)

      for (let i = 0; i < pageCount; i++) {
        if (i === 0) {
          fragment.appendChild(firstPage.cloneNode(true))
        } else {
          fragment.appendChild(page.cloneNode(true))
        }
      }
      el.append(fragment)
      el.id = 'pages'

      return el
    },
    { side: -1 },
  )
  const firstHeaderWidget = Decoration.widget(
    0,
    () => {
      const el = document.createElement('div')
      el.style.position = 'relative'
      el.classList.add('sf-first-page-header')

      const pageHeaderLeft = document.createElement('div')
      pageHeaderLeft.classList.add('sf-first-page-header-left')
      pageHeaderLeft.innerHTML = pageOptions.headerLeft
      el.append(pageHeaderLeft)

      const pageHeaderRight = document.createElement('div')
      pageHeaderRight.classList.add('sf-first-page-header-right')
      pageHeaderRight.innerHTML = pageOptions.headerRight
      el.append(pageHeaderRight)

      el.style.height = `${pageOptions.pageHeaderHeight}px`
      return el
    },
    { side: -1 },
  )

  return !isInitial ? [pageWidget, firstHeaderWidget] : [pageWidget]
}
