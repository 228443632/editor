/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 17/01/26 PM3:06
 */
/**
 * 渲染表格分页边框
 */
export const renderTablePagingBorder = () => {
  function load() {
    // const theads = document.querySelectorAll('thead');
    // theads.forEach((thead) => {
    //   thead.remove()
    // });
    //
    // const tfoots = document.querySelectorAll('tfoot');
    // tfoots.forEach((tfoot) => {
    //   tfoot.remove()
    // });

    // getPaperSize()
    const a4 = getPaperSize('A4')

    const page = {
      // height: 1123,
      // width: 794,
      // pl: 120,
      // pt: 96,

      height: Math.ceil(a4._basePx.h),
      width: Math.ceil(a4._basePx.w),
      pl: Math.ceil(a4._basePx.pl),
      pt: Math.ceil(a4._basePx.pt),

      contentHeight: Math.ceil(a4._basePx.h - a4._basePx.pt * 2),
      contentWidth: Math.ceil(a4._basePx.w - a4._basePx.pl * 2),

      getSafeBottom(pageNum) {
        return page.height - page.pt + (pageNum - 1) * page.height
      },

      getSafePageByHeight(height) {
        const pageNum = Math.floor(
          (height - (page.height - page.pt)) / page.height + 1,
        )
        return Math.max(pageNum, 1)
      },
    }

    // const header = document.querySelector('.umo-page-node-header')
    // header.remove()

    const tableList = [
      ...new Set(
        Array.from(document.querySelectorAll('table:not(table table)')),
      ),
    ]
    const nestTableList = [
      ...new Set(Array.from(document.querySelectorAll('table table'))),
    ]

    nestTableList.forEach((table) => {
      table.__isNested = true
      tableList.push(table)
    })

    // 最底 排在后面
    tableList.sort((a, b) => {
      const aRect = a.getBoundingClientRect()
      const bRect = b.getBoundingClientRect()
      return aRect.bottom - bRect.bottom
    })

    const totalPageObj = {} // 所有页码映射，专门存放 页+页的bottom

    // 设置滚动到顶部
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    // 遍历每个表格
    tableList.forEach((table) => {
      if (!table.clientHeight) return

      // 是内嵌的
      let diffHeight = 0
      let isOverEnd = false // 是否到底
      let pageNum = 0 // 当前页码

      const rows = Array.from(table.rows)

      const rowsMore = [...rows]

      const pageDiffHeight = {}

      while (!isOverEnd) {
        pageNum++

        if (pageNum > 100) {
          break
        }
        if (isOverEnd) {
          break
        }
        totalPageObj[pageNum] = true

        const pageBottom = getPageBottom(pageNum)

        rowsMore.forEach((row, rowIndex) => {
          const trRect = row.getBoundingClientRect()
          const trTop = trRect.top + diffHeight
          const trBottom = trRect.bottom + diffHeight

          if (
            pageBottom > trTop &&
            pageBottom < trBottom &&
            page.contentHeight > trRect.height
          ) {
            // diffHeight += pageBottom - prevTrRect.bottom + (table.__isNested ? -1 : 1);
            pageDiffHeight[pageNum] = pageBottom - trTop
            diffHeight += +pageDiffHeight[pageNum]
            // console.log('diffHeight', pageNum, diffHeight, pageDiffHeight[pageNum], pageDiffHeight[pageNum - 1])
          }

          if (rowIndex == rows.length - 1) {
            // 最后一个
            if (pageBottom >= trBottom) {
              isOverEnd = true
            }
          }
        })

        let originDiffHeight = 0
        for (let i = 1; i <= pageNum; i++) {
          originDiffHeight += pageDiffHeight[i] || 0
        }

        rows.forEach((row, rowIndex) => {
          const cells = Array.from(row.cells)

          // 处理跨行 居中的单元格
          cells.forEach((cell) => {
            const rowSpan = cell.rowSpan
            if (rowSpan >= 1) {
              const styleComputed = window.getComputedStyle(cell)
              if (styleComputed.verticalAlign == 'middle') {
                const tdRect = cell.getBoundingClientRect()
                const tdTop = tdRect.top + originDiffHeight
                const tdBottom = tdRect.bottom + originDiffHeight

                if (pageBottom >= tdTop && pageBottom < tdBottom) {
                  const cellPaddingY =
                    parseInt(styleComputed.paddingTop) +
                    parseInt(styleComputed.paddingBottom)
                  cell.style.verticalAlign = 'auto'

                  // 跨页标识
                  cell.dataset.crossPageFlag = '1'

                  const childWrap = document.createElement('div')

                  childWrap.style.minHeight =
                    cell.clientHeight - cellPaddingY + 'px'
                  childWrap.classList.add('cell-flex-center')

                  const child = cell.children[0]
                  const childStyle = window.getComputedStyle(child)
                  if (childStyle.textAlign == 'center') {
                    childWrap.style.justifyContent = 'center'
                  }

                  // TODO
                  // cell.style.background = 'pink'
                  // childWrap.style.background = 'red'

                  Array.from(cell.children).forEach((childItem) => {
                    // if (childItem.dataset.fillBlank) return
                    childWrap.append(childItem)
                  })
                  cell.append(childWrap)
                }
              }
            }
          })
        })
      }

      if (diffHeight > 0) {
        /**
         * @type {HTMLTableRowElement}
         */
        const lastRow = rows.at(-1)
        const parentTd = lastRow.closest('td')
        // const children = parentTd.children
        const trTmp = document.createElement('div')
        // 填充空白行
        trTmp.dataset.fillBlank = '1'
        trTmp.style.height = `${diffHeight}px`
        trTmp.style.border = 'none'
        trTmp.style.marginTop = '-1px'
        if (parentTd) {
          parentTd.insertAdjacentElement('beforeend', trTmp)
        }
        if (!table.__isNested) {
          trTmp.classList.add('tr-no-nested-001')
        }
        // lastRow.insertAdjacentElement('afterend', trTmp.cloneNode(true))
      }

      // 非嵌套添加
      const tHead = table.tHead
      if (!table.__isNested && !tHead) {
        const tHead = document.createElement('thead')
        tHead.innerHTML = '<tr style="height: 1px;"></tr>'
        table.insertAdjacentElement('afterbegin', tHead)
      }

      const tfoot = table.tFoot
      if (!tfoot) {
        const tfoot = document.createElement('tfoot')
        tfoot.innerHTML = `<tr style="height: 2px; margin-top: -2px;"></tr>`
        table.insertAdjacentElement('beforeend', tfoot)
      }
    })

    // 修复表格被截断fix
    // const compTextDomList = document.querySelectorAll(`[compname="comp-text"]`)
    // compTextDomList.forEach(comp => {
    //   const serverComponentTable = comp.querySelector('server-component > table')
    //   if (serverComponentTable) {
    //     // comp.innerHTML = serverComponentTable.outerHTML
    //     comp.parentNode.replaceChild(serverComponentTable, comp)
    //     const nextElement = serverComponentTable.nextElementSibling
    //     if (nextElement && nextElement.classList.contains('Tiptap-invisible-character')) {
    //       nextElement.remove()
    //     }
    //   }
    // })

    function getPageBottom(pageNum) {
      return pageNum * page.contentHeight + page.pt
    }
    function getPageTop(pageNum) {
      console.log('page.contentHeight', page.contentHeight)
      return getPageBottom(pageNum) - page.contentHeight
    }
    // const totalPageNum = Math.max(...Object.keys(totalPageObj).map((pageNum) => +pageNum))

    // 重新更新高度
    const middleCrossPageTdList = document.querySelectorAll(
      'td[data-cross-page-flag]',
    )
    middleCrossPageTdList.forEach((cell) => {
      const childWrap = cell.children[0]
      if (childWrap && childWrap.classList.contains('cell-flex-center')) {
        const styleComputed = window.getComputedStyle(cell)
        const cellPaddingY =
          parseInt(styleComputed.paddingTop)
          parseInt(styleComputed.paddingBottom)
        childWrap.style.minHeight = cell.clientHeight - cellPaddingY + 'px'
      }
    })

    // 删除所有 tr-no-nested-001
    const trList = document.querySelectorAll('.tr-no-nested-001')
    trList.forEach((tr) => tr.remove())
  }
  load()

  /**
   * 获取纸张尺寸
   * @param {String} type 可选值：A4、A5、A6
   */
  function getPaperSize(type) {
    type ||= 'A4'

    const cssUtil = {
      /**
       * 获取dpi
       * @returns {*[]}
       */
      getDpi() {
        const result = []
        if (window.screen['deviceXDPI'] != undefined) {
          result[0] = window.screen['deviceXDPI']
          result[1] = window.screen['deviceYDPI']
        } else {
          const tmpNode = document.createElement('div')
          tmpNode.style.cssText =
            'width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden'
          document.body.appendChild(tmpNode)
          result[0] = parseInt(`${tmpNode.offsetWidth}`)
          result[1] = parseInt(`${tmpNode.offsetHeight}`)
          tmpNode.parentNode.removeChild(tmpNode)
        }
        return result
      },

      /**
       * mm 转成 px，
       * @param mm 单位是毫米
       */
      mmToPx(mm) {
        const DPI = cssUtil.getDpi()
        if (typeof mm === 'string') mm = parseFloat(mm)
        return +mm * (DPI[0] / 25.4)
      },

      /**
       * px 转成 mm，
       * @param px
       */
      pxToMm(px) {
        const DPI = cssUtil.getDpi()[0]
        if (typeof px === 'string') px = parseFloat(px)
        return (+px * 25.4) / DPI
      },
    }

    const sizeConf = {
      A4: {
        w: 210, // 宽
        h: 297, // 高
        mt: 20, // 外边距 上
        mb: 15, // 外边距 下
        ml: 15, // 外边距 左
        mr: 15, // 外边距 右
        pt: 25.4, // 页边距 上
        pb: 25.4, // 页边距 下
        pl: 20, // 页边距 左
        pr: 20, // 页边距 右
        hh: 6.6, // 页眉
        fh: 14, // 页脚
      },
      A5: {
        w: 148,
        h: 210,
        mt: 20, // 外边距 上
        mb: 15, // 外边距 下
        ml: 15, // 外边距 左
        mr: 15, // 外边距 右
        pt: 20, // 页边距 上
        pb: 15, // 页边距 下
        pl: 15, // 页边距 左
        pr: 15, // 页边距 右
        hh: 6.6, // 页眉
        fh: 14, // 页脚
      },
      A6: {
        w: 105,
        h: 148,
        mt: 20, // 外边距 上
        mb: 15, // 外边距 下
        ml: 15, // 外边距 左
        mr: 15, // 外边距 右
        pt: 20, // 页边距 上
        pb: 15, // 页边距 下
        pl: 15, // 页边距 左
        pr: 15, // 页边距 右
        hh: 6.6, // 页眉
        fh: 14, // 页脚
      },
    }
    const size = sizeConf[type]
    // 1px= 0.75pt
    return {
      _base: size,
      _basePx: Object.entries(size).reduce((pre, [key, value]) => {
        pre[key] = cssUtil.mmToPx(value)
        return pre
      }, {}),
    }
  }
}

// TODO
const theads = document.querySelectorAll('thead')
theads.forEach((thead) => {
  thead.remove()
})

const tfoots = document.querySelectorAll('tfoot')
tfoots.forEach((tfoot) => {
  tfoot.remove()
})

const trs = document.querySelectorAll('.tr-auto-fill-001')
trs.forEach((tr) => tr.remove())

// css

const style = document.createElement('style')
style.textContent = `
tfoot {
  position: relative;
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: blue;
  }
}

td:has( > .cell-flex-center) {
  position: relative;
}
.cell-flex-center {
  /*position: absolute;*/
  /*width: 100%;*/
  /*height: 100%;*/
  /*top: 50%;*/
  /*left: 0;*/
  display: flex;
  flex-direction: column;
  justify-content: center;
  /*transform: translateY(-50%);*/
}
`
document.head.insertAdjacentElement('beforeend', style)

window.requestIdleCallback(() => {
  renderTablePagingBorder()
})
