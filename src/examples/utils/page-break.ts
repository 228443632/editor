/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 11/08/25 PM8:42
 */
import type { Dispatch, Editor } from '@tiptap/core'
import { PageBreakBaseDom } from '@/examples/utils/page-break-base-dom'
import { addRow } from '@tiptap/pm/tables'
import { type EditorState, TextSelection } from '@tiptap/pm/state'

export class PageBreak extends PageBreakBaseDom {
  constructor(editor: Editor) {
    super(editor)
  }

  run() {
    const getAllTables = () => {
      const tables = []
      this.editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'table') {
          // 识别表格单元格节点
          tables.push({ node, pos }) // 记录节点及其位置
          console.log('getAllTables', this.state.doc.resolve(pos))
        }
      })
      return tables
    }

    // 获取所有 td 节点
    const getAllTds = () => {
      const tds = []
      this.editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'tableCell') {
          // 识别表格单元格节点
          tds.push({ node, pos }) // 记录节点及其位置
        }
      })
      return tds
    }

    const main = () => {
      const tableNodeList = getAllTables()
      console.log('tableNodeList', tableNodeList)

      const table$0NodeInfo = this.editor.$pos(tableNodeList[0].pos + 1)
      console.log('debug002', table$0NodeInfo, tableNodeList[0])

      const tableChildrenList = Array.from(
        table$0NodeInfo.children.map((item) => {
          const dom = this.view.nodeDOM(item.pos - 1) as HTMLElement
          const trDOM = dom.querySelector('tr')
          const rect = this.resolveBoundRect(trDOM)
          const pageNum = this.resolvePageNumByTop(rect.top) // 当前页码

          return {
            nodePos: item,
            pos: item.pos,
            dom: trDOM,
            rect,
            pageNum,
          }
        }),
      )

      tableChildrenList.forEach((item, index) => {
        if (index < 1) return
        const prevItem = tableChildrenList[index - 1]
        const diffY = Math.abs(item.rect.top - prevItem.rect.bottom)

        const pinHeight = this.a4Top * 2 + this.a4PageGap
        if (diffY > pinHeight + 10) {
          // 说明发生了间距
          console.log('diffY', diffY, index)
          console.log('diffYY', item.nodePos)

          const maxTruncateHeight = diffY - pinHeight + 2
          console.log('maxDiff', maxTruncateHeight)

          const tr = this.state.tr
          item.nodePos.children.forEach((cellNodePos, cellIndex) => {
            if (cellIndex != 1) return
            console.log(
              'cellNodePos',
              cellNodePos.pos,
              cellNodePos.node.type.name,
              this.editor.$pos(cellNodePos.pos).node?.type?.name,
            )
            const tdDOM = this.view.nodeDOM(cellNodePos.pos - 1)

            const s = getSelection()
            s.removeAllRanges()
            const r = document.createRange()
            r.selectNode(tdDOM.firstChild)
            s.addRange(r)
            console.log('tdDOM', tdDOM.firstChild, r)

            return
            const walker = document.createTreeWalker(
              tdDOM,
              NodeFilter.SHOW_ALL,
              {
                acceptNode: (node) => {
                  if (node.nodeType === Node.TEXT_NODE) {
                    return NodeFilter.FILTER_ACCEPT
                  }
                  if (node.nodeType === Node.ELEMENT_NODE) {
                    return NodeFilter.FILTER_ACCEPT
                  }
                  return NodeFilter.FILTER_REJECT
                },
              },
            )

            const ranges = [] as Range[]
            let currentNode: Node
            // 遍历所有文本节点
            while ((currentNode = walker.nextNode())) {
              console.log('currentNode', currentNode, currentNode.childNodes)
              if (currentNode.nodeType === Node.TEXT_NODE) {
                // 文本节点
                // 存在
                let textLen = 0
                while (textLen < currentNode.textContent.length) {
                  const r = document.createRange()
                  r.setStart(currentNode, textLen)
                  r.setEnd(currentNode, textLen + 1)
                  const lastItem = r.getBoundingClientRect()
                  const boundRect = this.resolveBoundRectByRect(lastItem)
                  if (boundRect.pageBottom - 96 <= maxTruncateHeight) {
                    ranges.push(r)
                  }
                  textLen++
                }
              } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                console.log('currentNode2', currentNode)
                // 元素节点
                if (!currentNode.childNodes.length) {
                  const r = document.createRange()
                  r.selectNode(currentNode)
                  // const el = currentNode as HTMLElement
                  const lastItem = r.getBoundingClientRect()
                  console.log('lastItem2', lastItem, currentNode)
                  const boundRect = this.resolveBoundRectByRect(lastItem)
                  if (boundRect.pageBottom - 96 <= maxTruncateHeight) {
                    ranges.push(r)
                  }
                }
              }
            }

            console.log('ranges', ranges)

            // const selection = TextSelection.create(
            //   this.state.doc,
            //   cellNodePos.pos,
            //   cellNodePos.pos + 1,
            // )
            // tr.setSelection(selection)
          })
          // this.view.dispatch(tr)

          // const firstCellNodePos = item.nodePos.children[0]

          // this.editor
          //   .chain()
          //   .focus()
          //   .setTextSelection(firstCellNodePos.pos)
          //   .addRowAfter()
          //   .run()
        }
      })
    }

    // 自定义命令：在指定行号后插入新行
    const addRowAt =
      (rowIndex: number) => (state: EditorState, dispatch?: Dispatch) => {
        const { schema, tr } = state
        const $pos = state.selection.$from
        const table = $pos.node(-3) // 获取表格节点
        console.log('table', table.type.name)

        // 1. 验证行号有效性
        if (rowIndex < 0 || rowIndex > table.childCount) return false

        // 2. 计算目标行的文档位置
        let rowOffset = 0
        for (let i = 0; i < rowIndex; i++) {
          rowOffset += table.child(i).nodeSize // 累加前行高度
        }
        const tableStart = $pos.before(-1) // 表格起始位置
        const insertPos = tableStart + rowOffset

        // 3. 创建新行（保持列数一致）
        const colCount = table.firstChild.childCount
        const cells = []
        for (let i = 0; i < colCount; i++) {
          cells.push(
            schema.nodes.tableCell.create(null, [
              schema.nodes.paragraph.create(), // 空单元格
            ]),
          )
        }
        console.log('schema.nodes', schema.nodes)
        const newRow = schema.nodes.tableRow.create(null, cells)

        // 4. 插入新行
        if (dispatch) {
          tr.insert(insertPos, newRow)
          dispatch(tr)
        }
        return true
      }

    main()

    // addRowAt(1)(this.state, this.view.dispatch)
  }
}
