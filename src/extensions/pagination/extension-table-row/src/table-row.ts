import { mergeAttributes, Node } from '@tiptap/core'
import { isNoNullable } from 'sf-utils2'

export interface TableRowOptions {
  /**
   * The HTML attributes for a table row node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

/**
 * This extension allows you to create table rows.
 * @see https://www.tiptap.dev/api/nodes/table-row
 */
export const TableRow = Node.create<TableRowOptions>({
  name: 'tableRow',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  content: '(tableCell | tableHeader)*',

  tableRole: 'row',

  parseHTML() {
    return [{ tag: 'tr' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'tr',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0, // 0 表示插入子节点（即 tr 的内容）
    ]
    // return [
    //   'section', // 外层包裹 section
    //   {
    //     class: 'table-row-group',
    //   }, // section 的属性（可留空或自定义）
    //   [
    //     'tr',
    //     mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    //     0, // 0 表示插入子节点（即 tr 的内容）
    //   ],
    // [
    //   'tbody',
    //   {
    //     class: 'table-row-tbody',
    //   },
    //   [
    //     'tr',
    //     mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    //     0, // 0 表示插入子节点（即 tr 的内容）
    //   ],
    // ],
    // ]
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('section')
      dom.classList.add('table-row-group')
      const trDom = document.createElement('tr')
      trDom.classList.add('table-row')
      dom.append(trDom)
      window.requestAnimationFrame(() => {
        const cells = Array.from(trDom.cells)
        cells.forEach((cellDOM) => {
          cellDOM.style.display = 'table-cell'
        })
      })
      Object.entries(node.attrs).forEach(([key, value]) => {
        if (isNoNullable(value)) {
          trDom.setAttribute(key, value)
        }
      })
      return {
        dom,
        contentDOM: trDom,
        update(updateNode) {
          if (updateNode.type.name !== node.type.name) return false
          return true
        },
        ignoreMutation() {
          return true
        },
      }
    }
  },
})
