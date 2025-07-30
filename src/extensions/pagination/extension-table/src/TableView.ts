import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { NodeView, ViewMutationRecord } from '@tiptap/pm/view'

import { getColStyleDeclaration } from './utilities/colStyle.js'
import { getTableIndexListPro } from '@/utils/browser'
import { simpleUUID } from '@/utils/short-id'
import { rafThrottle } from 'sf-utils2'

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
  node: ProseMirrorNode

  cellMinWidth: number

  dom: HTMLDivElement

  table: HTMLTableElement

  colgroup: HTMLTableColElement

  contentDOM: HTMLTableSectionElement
  // contentDOM: HTMLDivElement

  _colgroupObserver: MutationObserver

  constructor(node: ProseMirrorNode, cellMinWidth: number) {
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
  }

  /**
   * 计算列宽度
   */
  _computedColWidth() {
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
    const trDOMs = this.dom.querySelectorAll(
      `table[data-id="${this.dom.id}"] > .table-wrapper-tbody> .table-row-group > tr`,
    ) as NodeListOf<HTMLTableRowElement>
    const indexListPro = getTableIndexListPro({
      rows: trDOMs,
    } as unknown as HTMLTableElement)
    indexListPro.forEach((trInfo) => {
      const gridTemplateColumns = [] as string[]
      const trDOM = trInfo[0].trEle
      trInfo.forEach((colInfo, colIndex) => {
        const minWidthVarPropertyName = `--col-${colIndex}-min-w`
        const widthVarPropertyName = `--col-${colIndex}-w`
        colInfo.tdEle.style.minWidth = `var(${minWidthVarPropertyName})`

        const width = this.table.style.getPropertyValue(widthVarPropertyName)
        if (colInfo.isRowPart && colInfo.isColPart) {
          colInfo.tdEle.style.gridColumn = `${colInfo.index + 1} / span ${colInfo.cSpan}`
        }
        gridTemplateColumns.push(width ? `var(${widthVarPropertyName})` : '1fr')
      })
      trDOM.style.gridTemplateColumns = gridTemplateColumns.join(' ')
      trDOM.style.width = `var(--width)`
    })
  }
}
