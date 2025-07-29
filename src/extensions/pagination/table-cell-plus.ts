/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 28/07/25 PM11:08
 */
import TableCell from '@tiptap/extension-table-cell'

export const TableCellPlus = TableCell.extend({
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('td')
      let colspan = node.attrs.colspan
      let rowspan = node.attrs.rowspan
      const updateGrid = (colspan: number, rowspan: number) => {
        dom.style.gridColumn = `auto / span ${colspan || 1}`
        dom.rowSpan = rowspan || 1
        dom.setAttribute('colspan', `${colspan || 1}`)
      }

      updateGrid(colspan, rowspan)

      return {
        dom,
        contentDOM: dom,

        update(updatedNode) {
          if (updatedNode.type.name !== 'tableCell') {
            return false
          }
          const updatedColspan = updatedNode.attrs.colspan
          if (updatedColspan !== colspan) {
            colspan = updatedColspan
            updateGrid(updatedColspan, rowspan)
          }
          return true
        },
      }
    }
  },
})

export default TableCellPlus
