/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 05/07/25 PM1:24
 */
import type { Editor } from '@tiptap/vue-3'
import type { NodeSelection } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from 'prosemirror-view'

declare global {
  interface Window {
    editor: Editor
  }
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
                  fontWeight: 'bold'
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
