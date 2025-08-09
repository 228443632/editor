import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { NodeView, ViewMutationRecord } from '@tiptap/pm/view'

import { getColStyleDeclaration } from './utilities/colStyle.js'
import { getTableIndexListPro } from '@/utils/browser'
import { rafThrottle, uniq } from 'sf-utils2'
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

  static tableRowGroupMergeClass = 'table-row-group-merge'

  node: ProseMirrorNode

  cellMinWidth: number

  dom: HTMLDivElement

  view: EditorView

  table: HTMLTableElement

  colgroup: HTMLTableColElement

  contentDOM: HTMLTableSectionElement
  // contentDOM: HTMLDivElement

  _colgroupObserver: MutationObserver

  constructor(node: ProseMirrorNode, cellMinWidth: number, view: EditorView) {
    this.view = view
    this.node = node
    this.cellMinWidth = cellMinWidth
    this.dom = document.createElement('div')
    this.dom.className = 'tableWrapper table-wrapper'
    this.dom.id ||= this.node.attrs.id
    this.table = this.dom.appendChild(document.createElement('table'))
    this.colgroup = this.table.appendChild(document.createElement('colgroup'))

    this.colgroup.setAttribute('tableid', this.node.attrs.id)

    updateColumns(node, this.colgroup, this.table, cellMinWidth)
    this.contentDOM = this.table.appendChild(document.createElement('tbody'))
    this.contentDOM.classList.add('table-wrapper-tbody')

    // FIXME: 添加id
    this.table.setAttribute('tableid', this.dom.id)

    const mutationCallback = (mutations: MutationRecord[]) => {
      this._computedTrProperties()
      this._computedColWidth()
    }
    const rafMutationCallback = rafThrottle(mutationCallback)
    this._colgroupObserver = new MutationObserver(rafMutationCallback)
    this._colgroupObserver.observe(this.colgroup, {
      childList: true,
      subtree: true,
      attributes: true,
    })

    this.dom.style.visibility = 'hidden'
    this.dom['_computedCalcLayout'] = () => {
      this._computedColWidth()
      this._computedTrProperties()
      this.dom.style.visibility = 'unset'
    }
  }

  update(node: ProseMirrorNode) {
    if (node.type !== this.node.type) {
      return false
    }

    this.node = node
    updateColumns(node, this.colgroup, this.table, this.cellMinWidth)
    window.requestAnimationFrame(this.dom['_computedCalcLayout'])
    return true
  }

  ignoreMutation(mutation: ViewMutationRecord) {
    // return (
    //   mutation.type === 'attributes' &&
    //   (mutation.target === this.table ||
    //     this.colgroup.contains(mutation.target))
    // )
    return true
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
   * 更新colgroup
   */
  _updateEverySubTableColgroup() {
    // _getTrDOMList
    const trDOMs = this._getTrDOMList()
    trDOMs.forEach((trDOM: HTMLTableRowElement) => {
      const tableDom = this.getNearsetTable(trDOM)
      const colgroupDomList = Array.from(
        tableDom.querySelectorAll(`colgroup[tableid=${this.dom.id}]`),
      )
      colgroupDomList.forEach((colgroupDom: HTMLTableColElement) => {
        colgroupDom.remove()
      })
      const colgroupDomClone = this.colgroup.cloneNode(
        true,
      ) as HTMLTableColElement
      tableDom.appendChild(colgroupDomClone)
    })
  }

  _getPos() {
    let result: number
    const doc = this.view.state.doc as unknown as ProseMirrorNode
    doc.descendants((node, pos) => {
      if (node === this.node) {
        result = pos
        return false
      }
    })
    return result
  }

  /**
   * 获取当前table的父元素table
   */
  getNearsetTable(trDOM: HTMLTableRowElement) {
    if (trDOM?.tagName != 'TR') return
    const parentElement = trDOM.parentElement.parentElement
    if (parentElement.classList.contains(TableView.tableRowGroupMergeClass)) {
      return parentElement
    }
    return trDOM.parentElement.classList.contains('table-row-group')
      ? trDOM.parentElement
      : null
  }

  /**
   * 获取tr DOM 列表
   */
  _getTrDOMList() {
    const tableId = this.dom.id
    const trDOMs = this.dom.querySelectorAll(
      `table[tableid="${tableId}"] tr[tableid="${tableId}"]`,
    ) as NodeListOf<HTMLTableRowElement>
    if (!trDOMs?.length) return [] as unknown as NodeListOf<HTMLTableRowElement>
    return trDOMs
  }

  /**
   * 更新tr属性
   */
  _computedTrProperties() {
    if (!TableView.isEnablePagination) return
    const trDOMs = this._getTrDOMList()
    if (!trDOMs?.length) return

    trDOMs.forEach((trDOM: HTMLTableRowElement) => {
      const parentElement = this.getNearsetTable(trDOM)
      const colgroupDomList = Array.from(
        parentElement.querySelectorAll(`colgroup[tableid=${this.dom.id}]`),
      )
      colgroupDomList.forEach((colgroupDom: HTMLTableColElement) => {
        colgroupDom.remove()
      })
      if (parentElement.classList.contains(TableView.tableRowGroupMergeClass)) {
        // 父元素是table-row-group-merge
        removePrentNode(parentElement)
      }
    })

    const indexListPro = getTableIndexListPro({
      rows: trDOMs,
    } as unknown as HTMLTableElement)
    // let isChangePosition: boolean // 位置是否发生变化

    // console.log("this.dom['__originRelList']", this.dom['__originRelList'])

    // if (
    //   this.dom['__originRelList'] &&
    //   looseEqual(this.dom['__originRelList'], indexListPro.__originRelList)
    // ) {
    //   isChangePosition = false
    // } else {
    //   isChangePosition = true
    // }
    //
    // if (!isChangePosition) return
    //
    // this.dom['__originRelList'] = indexListPro.__originRelList

    const tdAccRowspanList = [] as number[]
    const rowHiddenGroup = [] as {
      groupRowIndex: number
      children: number[]
    }[]

    indexListPro.forEach((trInfo, trInfoIndex) => {
      trInfo.forEach((colInfo, colIndex) => {
        tdAccRowspanList[colIndex] ??= 0
        if (colInfo.isRowPart && colInfo.isColPart) {
          tdAccRowspanList[colIndex] += colInfo.rSpan || 1
        }
      })

      const tdAccRowspanListSet = uniq(tdAccRowspanList)
      if (tdAccRowspanListSet?.length == 1) {
        if (tdAccRowspanList[0] > 1) {
          const lastGroupRowIndex = trInfoIndex - tdAccRowspanList[0]
          const children = []
          const groupRowIndex = lastGroupRowIndex ? lastGroupRowIndex + 1 : 0
          for (let i = groupRowIndex + 1; i <= trInfoIndex; i++) {
            children.push(i)
          }
          rowHiddenGroup.push({
            groupRowIndex: lastGroupRowIndex ? lastGroupRowIndex + 1 : 0,
            children,
          })
        }
        tdAccRowspanList.length = 0
      }
    })

    rowHiddenGroup.forEach((group) => {
      const groupTrDom = trDOMs[group.groupRowIndex]
      const div = document.createElement('section')
      const tableRowGroupDom = groupTrDom.parentElement
      tableRowGroupDom.parentElement.insertBefore(div, tableRowGroupDom)
      div.classList.add(TableView.tableRowGroupMergeClass)
      div.append(tableRowGroupDom)
      group.children.forEach((child) => {
        const childTrDom = trDOMs[child]
        const childTableRowGroupDom = childTrDom.parentElement
        div.append(childTableRowGroupDom)
      })
    })

    this._updateEverySubTableColgroup()
  }
}

/**
 * 只删除删除父节点，保留子节点
 * @param node
 * @returns {*}
 */
function removePrentNode(node: Node) {
  const parent = node.parentNode
  let child: Node
  if (parent) {
    if (node.hasChildNodes()) {
      while ((child = node.firstChild)) {
        parent.insertBefore(child, node)
      }
    }
    parent.removeChild(node)
  }
  return node
}
