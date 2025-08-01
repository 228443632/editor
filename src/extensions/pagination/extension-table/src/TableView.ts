import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { NodeView, ViewMutationRecord } from '@tiptap/pm/view'

import { getColStyleDeclaration } from './utilities/colStyle.js'
import { getTableIndexListPro } from '@/utils/browser'
import { simpleUUID } from '@/utils/short-id'
import { rafThrottle } from 'sf-utils2'
import type { EditorView } from '@codemirror/view'

export function updateColumns(
  node: ProseMirrorNode,
  colgroup: HTMLTableColElement, // <colgroup> has the same prototype as <col>
  table: HTMLTableElement,
  cellMinWidth: number,
  overrideCol?: number,
  overrideValue?: number,
) {
  let totalWidth = 0
  let fixedWidth = true
  let nextDOM = colgroup.firstChild
  const row = node.firstChild

  if (row !== null) {
    for (let i = 0, col = 0; i < row.childCount; i += 1) {
      const { colspan, colwidth } = row.child(i).attrs

      for (let j = 0; j < colspan; j += 1, col += 1) {
        const hasWidth =
          overrideCol === col
            ? overrideValue
            : ((colwidth && colwidth[j]) as number | undefined)
        const cssWidth = hasWidth ? `${hasWidth}px` : ''

        totalWidth += hasWidth || cellMinWidth

        if (!hasWidth) {
          fixedWidth = false
        }

        if (!nextDOM) {
          const colElement = document.createElement('col')

          const [propertyKey, propertyValue] = getColStyleDeclaration(
            cellMinWidth,
            hasWidth,
          )

          colElement.style.setProperty(propertyKey, propertyValue)

          colgroup.appendChild(colElement)
        } else {
          if ((nextDOM as HTMLTableColElement).style.width !== cssWidth) {
            const [propertyKey, propertyValue] = getColStyleDeclaration(
              cellMinWidth,
              hasWidth,
            )

            ;(nextDOM as HTMLTableColElement).style.setProperty(
              propertyKey,
              propertyValue,
            )
          }

          nextDOM = nextDOM.nextSibling
        }
      }
    }
  }

  while (nextDOM) {
    const after = nextDOM.nextSibling

    nextDOM.parentNode?.removeChild(nextDOM)
    nextDOM = after
  }

  if (fixedWidth) {
    table.style.width = `${totalWidth}px`
    table.style.minWidth = ''
  } else {
    table.style.width = ''
    table.style.minWidth = `${totalWidth}px`
  }
  table.style.setProperty('--cell-count', String(colgroup.children?.length))
}

export class TableView implements NodeView {
  /** 是否开启分页 */
  static isEnablePagination = false

  node: ProseMirrorNode

  cellMinWidth: number

  dom: HTMLDivElement

  table: HTMLTableElement

  colgroup: HTMLTableColElement

  contentDOM: HTMLTableSectionElement
  // contentDOM: HTMLDivElement

  _colgroupObserver: MutationObserver

  constructor(node: ProseMirrorNode, cellMinWidth: number, view: EditorView) {
    this.node = node
    this.cellMinWidth = cellMinWidth
    this.dom = document.createElement('div')
    this.dom.className = 'tableWrapper table-wrapper'
    this.dom.id = simpleUUID().slice(8)
    this.table = this.dom.appendChild(document.createElement('table'))
    this.colgroup = this.table.appendChild(document.createElement('colgroup'))
    updateColumns(node, this.colgroup, this.table, cellMinWidth)
    this.contentDOM = this.table.appendChild(document.createElement('tbody'))
    this.contentDOM.classList.add('table-wrapper-tbody')

    // FIXME: 添加id
    this.table.dataset.id = this.dom.id

    const mutationCallback = (mutations: MutationRecord[]) => {
      this._computedColWidth()
    }
    const rafMutationCallback = rafThrottle(mutationCallback)
    this._colgroupObserver = new MutationObserver(rafMutationCallback)
    this._colgroupObserver.observe(this.colgroup, {
      childList: true,
      subtree: true,
      attributes: true,
    })

    this.dom['_computedCalcLayout'] = rafThrottle(() => {
      this._computedColWidth()
      this._computedTrProperties()
    })
  }

  update(node: ProseMirrorNode) {
    if (node.type !== this.node.type) {
      return false
    }

    this.node = node
    updateColumns(node, this.colgroup, this.table, this.cellMinWidth)
    this._computedColWidth()
    this._computedTrProperties()
    return true
  }

  ignoreMutation(mutation: ViewMutationRecord) {
    return (
      mutation.type === 'attributes' &&
      (mutation.target === this.table ||
        this.colgroup.contains(mutation.target))
    )
  }

  destroy() {
    if (this._colgroupObserver) {
      this._colgroupObserver.disconnect()
      this._colgroupObserver = null
    }
    return true
  }

  /**
   * 计算列宽度
   */
  _computedColWidth() {
    if (!TableView.isEnablePagination) return
    const colDOMs = Array.from(this.colgroup.children)
    colDOMs.forEach((col: HTMLTableColElement, colIndex: number) => {
      const width =
        col.style.width ||
        (col.getAttribute('width')
          ? `${col.getAttribute('width')}px`
          : undefined)
      const minWidth = col.style.minWidth || col.getAttribute('min-width')
      if (width) this.table.style.setProperty(`--col-${colIndex}-w`, width)
      if (minWidth)
        this.table.style.setProperty(`--col-${colIndex}-min-w`, minWidth)
      this.table.style.setProperty(`--width`, this.table.style.width || '100%')
    })
  }

  /**
   * 更新tr属性
   */
  _computedTrProperties() {
    console.log('_computedTrProperties', '_computedTrProperties')
    if (!TableView.isEnablePagination) return
    const trDOMs = this.dom.querySelectorAll(
      `table[data-id="${this.dom.id}"] > .table-wrapper-tbody> .table-row-group > tr`,
    ) as NodeListOf<HTMLTableRowElement>
    const indexListPro = getTableIndexListPro({
      rows: trDOMs,
    } as unknown as HTMLTableElement)
    indexListPro.forEach((trInfo, trInfoIndex) => {
      const gridTemplateColumns = [] as string[]
      const trDOM = trInfo[0].trEle
      const noCrossRowTdHeightList = []
      trInfo.forEach((colInfo, colIndex) => {
        const minWidthVarPropertyName = `--col-${colIndex}-min-w`
        const widthVarPropertyName = `--col-${colIndex}-w`
        colInfo.tdEle.style.minWidth = `var(${minWidthVarPropertyName})`

        const width = this.table.style.getPropertyValue(widthVarPropertyName)
        if (colInfo.isRowPart && colInfo.isColPart) {
          colInfo.tdEle.style.gridColumn = `${colInfo.index + 1} / span ${colInfo.cSpan}`
          if (colInfo.rSpan > 1) {
            // colInfo.tdEle.style.gridRow = `${colInfo.rIndex + 1} / span ${colInfo.rSpan}`
            const heightList = []
            for (let i = 0; i < colInfo.rSpan; i++) {
              heightList.push(`var(--row-${colInfo.rIndex + i}-h)`)
            }
            // colInfo.tdEle.style.height = `max(calc(${heightList.join(' + ')}), 100%)`
          } else {
            // 非跨行
            noCrossRowTdHeightList.push(colInfo.tdEle.clientHeight)
          }
        }
        gridTemplateColumns.push(width ? `var(${widthVarPropertyName})` : '1fr')
      })
      trDOM.style.gridTemplateColumns = gridTemplateColumns.join(' ')
      trDOM.style.width = `var(--width)`
      const maxTdHeight = Math.max(...noCrossRowTdHeightList)
      this.table.style.setProperty(`--row-${trInfoIndex}-h`, `${maxTdHeight}px`)
      trDOM.style.height = `calc(--row-${trInfoIndex}-h)`
    })
  }
}
