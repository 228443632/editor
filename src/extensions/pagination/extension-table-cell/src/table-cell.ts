import { mergeAttributes, Node } from '@tiptap/core'
// import { isNoNullable } from 'sf-utils2'

export interface TableCellOptions {
  /**
   * The HTML attributes for a table cell node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

/**
 * This extension allows you to create table cells.
 * @see https://www.tiptap.dev/api/nodes/table-cell
 */
export const TableCell = Node.create<TableCellOptions>({
  name: 'tableCell',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  content: 'block+',

  addAttributes() {
    return {
      colspan: {
        default: 1,
      },
      rowspan: {
        default: 1,
      },
      colwidth: {
        default: null,
        parseHTML: (element) => {
          const colwidth = element.getAttribute('colwidth')
          const value = colwidth
            ? colwidth.split(',').map((width) => parseInt(width, 10))
            : null

          return value
        },
      },
    }
  },

  tableRole: 'cell',

  isolating: true,

  parseHTML() {
    return [{ tag: 'td' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'td',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ]
  },

  // addNodeView() {
  //   return ({ node }) => {
  //     const dom = document.createElement('td')
  //     Object.entries(node.attrs).forEach(([key, value]) => {
  //       if (isNoNullable(value)) {
  //         dom.setAttribute(key, value)
  //       }
  //     })
  //
  //     return {
  //       dom,
  //       contentDOM: dom,
  //       update(updateNode) {
  //         // if (!updateNode.sameMarkup(node)) return false
  //         if (updateNode.type.name !== node.type.name) return false
  //         // window.requestAnimationFrame(() => {
  //         //   // dom.setAttribute('h', dom.clientHeight + '')
  //         //   dom.style.display = 'table-cell'
  //         // })
  //         return true
  //       },
  //       // ignoreMutation() {
  //       //   return true
  //       // },
  //     }
  //   }
  // },
})
