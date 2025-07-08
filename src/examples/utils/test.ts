/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 05/07/25 PM1:24
 */
import type { Editor } from '@tiptap/vue-3'

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

      default: {
        break
      }
    }
  }
}
