/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 05/07/25 PM1:24
 */
import type { Editor } from '@tiptap/vue-3'
import { type EditorState, NodeSelection } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from 'prosemirror-view'

//
import type { Node as Node2, ResolvedPos } from 'prosemirror-model'

declare global {
  interface Window {
    editor: Editor
  }
}

const isInTable = (state: EditorState): boolean => {
  const { $from } = state.selection
  for (let depth = $from.depth; depth > 0; depth--) {
    if ($from.node(depth).type.name === 'table') return true
  }
  return false
}

const getCurrentCell = (state: EditorState) => {
  const { $from } = state.selection
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth)
    // 匹配 Tiptap 默认表格节点类型
    if (['table_cell', 'table_header'].includes(node.type.name)) {
      return {
        cellNode: node,
        cellPos: $from.start(depth), // 单元格起始位置
        cellDepth: depth,
      }
    }
  }
  return null
}

const getCurrentTable = (state: EditorState, cellDepth: number) => {
  const { $from } = state.selection
  for (let depth = cellDepth; depth > 0; depth--) {
    const node = $from.node(depth)
    if (node.type.name === 'table') {
      return {
        tableNode: node,
        tablePos: $from.start(depth), // 表格起始位置
      }
    }
  }
  return null
}

export function testEditor(editorRef: Editor) {
  return (funcName: string) => {
    const editor = window.editor as Editor
    const selection = editor.state.selection
    const state = editor.state
    const doc = editor.state.doc
    const view = editor.view

    console.log('[funcName]', funcName)

    switch (funcName) {
      case 'demoInTable': {
        const { $from, $to } = selection
        let node: Node2
        if (selection instanceof NodeSelection) {
          node = selection.node
        }

        const nodeTypeNameMap = {
          tableCell: 1,
          tableTr: 1,
        }

        interface BaseNode {
          node?: Node2
          dom?: HTMLElement
          startPos?: number
          endPos?: number
          beforePos?: number
          afterPos?: number
          resolvePos?: ResolvedPos
        }

        interface CellNode extends BaseNode {
          dom?: HTMLTableCellElement
        }

        interface RowNode extends BaseNode {
          dom?: HTMLTableRowElement
        }

        interface TableNode extends BaseNode {
          dom?: HTMLTableElement
        }

        let tableCell: CellNode, // 单元格
          tableRow: RowNode, // tr
          table: TableNode // 表格

        let parent: Node2
        if (selection instanceof NodeSelection) {
          parent = node
        } else {
          parent = $from.parent
        }

        console.log('$from', $from.parent)
        node = $from.node($from.depth)
        let depth = $from.depth
        while (node && depth > 0) {
          node = $from.node(depth)
          const beforePos = $from.before(depth)
          const afterPos = $from.after(depth)
          const startPos = $from.start(depth)
          const endPos = $from.end(depth)
          console.log('$from2', { node, depth }, $from.parent === node)
          const posObj = { node, beforePos, afterPos, startPos, endPos }
          if (
            node.type.name == 'tableCell' ||
            node.type.name == 'tableHeader'
          ) {
            tableCell = {
              ...posObj,
              resolvePos: doc.resolve(startPos),
              dom: view.nodeDOM(startPos) as HTMLTableCellElement,
            }
          } else if (node.type.name == 'tableRow') {
            tableRow = {
              ...posObj,
              resolvePos: doc.resolve(startPos),
              dom: view.nodeDOM(startPos) as HTMLTableRowElement,
            }
          } else if (node.type.name == 'table') {
            table = {
              ...posObj,
              resolvePos: doc.resolve(startPos),
              dom: view.nodeDOM(startPos) as HTMLTableElement,
            }
          }

          depth--
        }

        console.log('输出结果', {
          table,
          tableCell,
          tableRow,
        })

        tableCell.node.descendants((node, pos) => {
          console.log('当前tableCell中 node', {
            node,
            pos: pos + tableCell.startPos,
          })
          const domRect = getDOMPosition(editor, pos)
          if (domRect) {
            console.log('当前tableCell中 node2', getDOMPosition(editor, pos))
          }
        })

        if (tableCell) {
          // const tr2 = state.tr
          // editor
          //   .chain()
          //   .insertContentAt(tableCell.startPos, {
          //     type: 'compFloat',
          //     attrs: {},
          //   })
          //   .focus()
          //   .run()
        }

        // const tempTr2 = state.tr.delete($from.pos, $to.pos)

        const sliceA = state.doc.slice($from.pos, $to.pos)
        const tempTr = state.tr
          .delete($from.pos, $to.pos)
          .insert(1, sliceA.content)
        view.dispatch(tempTr)
        console.log('sliceA', sliceA)

        /**
         * 获取当前dom位置
         * @param editor
         * @param pos
         */
        function getDOMPosition(editor: Editor, pos: number) {
          const view = editor.view
          const dom = view.nodeDOM(pos) as Node
          if (!dom) return null
          const rootDOM = view.dom
          const rootDOMRect = rootDOM.getBoundingClientRect()

          let tempRect: DOMRect
          if (dom.nodeType === Node.TEXT_NODE) {
            // 文本节点
            const range = document.createRange()
            range.selectNode(dom)
            tempRect = range.getBoundingClientRect() // getClientRects
          } else if (dom.nodeType === Node.ELEMENT_NODE) {
            // 元素节点
            tempRect = (dom as HTMLElement).getBoundingClientRect()
          }

          interface PageNumPosItem {
            top: number
            left: number
            right: number
            bottom: number
            height: number
            width: number
          }

          const top = tempRect.top - rootDOMRect.top
          const left = tempRect.left - rootDOMRect.left

          return {
            top,
            left,
            bottom: top + tempRect.height,
            right: left + tempRect.width,
            width: tempRect.width,
            height: tempRect.height,
          }
        }

        // if (node && node.type.name === 'table') {
        //   console.log('光标在表格内')
        // } else {
        //   let isInTable = false
        //   if ($from.depth > 0) {
        //     console.log('$from.node(0)', $from.node(0))
        //     // $from.node(0).descendants((node, pos) => {
        //     //   console.log('handleCustomNode', node, node, node?.type?.name)
        //     // })
        //   }
        // }

        break
      }

      case 'demo001': {
        const selection = editor.state.selection
        const state = editor.state

        console.log('anchor', selection.anchor, selection, {
          from: selection.from,
          from$: selection.$from.pos,
          to: selection.to,
          to$: selection.$to.pos,
          anchor: selection.anchor,
        })

        console.log('domAtPos', editor.view.domAtPos(selection.anchor))

        const $posA = state.doc.resolve(selection.anchor)
        const fromA = $posA.before($posA.depth)
        const toA = $posA.after($posA.depth)

        // const sliceA = state.doc.slice(fromA, toA)

        editor.view.dispatch(state.tr.delete(fromA, toA))

        editor.commands.updateAttributes('compText', {
          style: {
            backgroundColor: 'red',
          },
        })

        // console.log('domAtPos2', sliceA)

        // state.tr.

        // editor.view.dispatch(state.tr.)

        // editor.chain().insertContentAt(selection.anchor, '12342').focus().run()

        // editor.commands.insertContentAt(selection.anchor, '<h1>Example Text</h1>')
        // editor
        //   .chain()
        //   .focus()
        //   .insertContent(
        //     editor.state.selection.anchor,
        //     {
        //       type: 'text',
        //       content:' 12342'
        //     }
        //   )
        //   .run()
        break
      }

      case 'demo002': {
        // state.doc.descendants((node, pos) => {
        //   console.log('descendants', { node, pos })
        // })
        // console.log(
        //   'ss',
        //   state.doc.resolve(1),
        //   view.nodeDOM(1),
        //   view.domAtPos(1, 1),
        // )
        // editor.chain().deleteSelection().focus().run()
        // editor.commands.setMark('bold', { class: 'bold-tag' })
        editor.commands.focus()

        const { from, to } = selection
        // doc.nodesBetween(from, to, (node, pos) => {
        //   console.log('nodesBetween', node, pos)
        //   if (node.type.name === 'compText') {
        //     return false
        //   }
        // })

        // const mark = state.schema.marks.strong.create();
        // view.dispatch(state.tr.addMark(from, to, mark))

        editor.commands.updateAttributes('compText', {
          cssText: {
            backgroundColor: 'red',
          },
        })
        // editor.commands.setMark('textStyle', { fontSize: '20px' })

        break
      }

      case 'demo003': {
        // 创建一个装饰器，作用于文档位置 0 到 5
        const highlight = Decoration.inline(0, 5, {
          style: 'background-color: yellow',
        })
        const decorations = DecorationSet.create(state.doc, [highlight])
        break
      }

      // 设置样式不在光标内
      case 'demo004': {
        editor.state.doc.descendants((node, pos) => {
          if (node.type.name === 'compText') {
            console.log('node', pos)
            view.dispatch(
              // state.tr.setMeta('addAttributes', {
              //   style: 'background-color: yellow',
              // }),
              state.tr.setNodeMarkup(10, node.type, {
                ...node.attrs,
                cssText: {
                  color: 'red',
                  fontWeight: 'bold',
                },
              }),
            )
          }
        })

        // const nodePos = editor.$pos(10)
        // console.log('nodePos', nodePos)
        break
      }

      case 'getCurrentFontSize': {
        // 获取当前选区字体大小
        const getCurrentFontSize = () => {
          const { anchor, node } = selection as NodeSelection

          if (
            node &&
            node.type?.name === 'compText' &&
            node.attrs?.cssText?.fontSize
          ) {
            return node.attrs?.cssText?.fontSize
          }

          const resolvedPos = state.doc.resolve(anchor)

          // 方案1：直接通过编辑器命令获取（推荐）
          const styleAttrs = editor.getAttributes('textStyle')
          console.log('styleAttrs', styleAttrs, resolvedPos)
          if (styleAttrs.fontSize) return styleAttrs.fontSize

          // 方案2：遍历节点链获取
          for (let d = resolvedPos.depth; d >= 0; d--) {
            const node = resolvedPos.node(d)
            console.log('node', node)
            const mark = node.marks?.find((m) => m.type.name === 'textStyle')
            if (mark?.attrs?.fontSize) return mark.attrs.fontSize
          }

          return '默认大小'
        }
        console.log(getCurrentFontSize())
        break
      }

      default: {
        break
      }
    }
  }
}
