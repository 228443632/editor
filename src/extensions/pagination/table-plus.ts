/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 28/07/25 PM11:09
 */
import Table, { createColGroup } from '@tiptap/extension-table'
import { mergeAttributes } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { type DOMOutputSpec } from '@tiptap/pm/model'
import { TableRowGroup } from './table-row-group'
export const TablePlus = Table.extend({
  content: '(tableRowGroup|tableRow)+',
  addExtensions() {
    return [TableRowGroup]
  },
  renderHTML({ node, HTMLAttributes }) {
    const table: DOMOutputSpec = [
      'table',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        border: 1,
      }),
      0,
    ]
    return table
  },
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('table')
      let maxCellCount = 0
      node.forEach((child) => {
        if (child.type.name === 'tableRowGroup') {
          child.forEach((row) => {
            if (row.type.name === 'tableRow') {
              if (row.childCount > maxCellCount) {
                maxCellCount = row.childCount
              }
            }
          })
        } else if (child.type.name === 'tableRow') {
          if (child.childCount > maxCellCount) {
            maxCellCount = child.childCount
          }
        }
      })

      dom.style.setProperty('--cell-count', maxCellCount.toString())
      return { dom, contentDOM: dom }
    }
  },
})

export default TablePlus
