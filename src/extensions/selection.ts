import { type Editor, Extension } from '@tiptap/core'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setCurrentNodeSelection: {
      setCurrentNodeSelection: () => ReturnType
    }
    deleteSelectionNode: {
      deleteSelectionNode: () => ReturnType
    }
  }
}
export default Extension.create({
  name: 'selection',
  addProseMirrorPlugins() {
    const { editor } = this

    return [
      new Plugin({
        key: new PluginKey('selection'),
        props: {
          decorations(state) {
            if (state.selection.empty) {
              return null
            }

            if (editor.isFocused) {
              return null
            }

            return DecorationSet.create(state.doc, [
              Decoration.inline(state.selection.from, state.selection.to, {
                class: 'umo-text-selection',
              }),
            ])
          },

          // handleScrollToSelection(view) {
          //   const tr = view.state.tr
          //   const mark = tr.getMeta('scrollIntoView')
          //   console.log('Meta mark:', mark, tr.steps)
          //
          //   // 自定义滚动逻辑（如需禁止滚动，返回 false）
          //   return false // 禁止自动滚动
          // },
        },
      }),
    ]
  },
  addCommands() {
    return {
      selectAllV2:
        () =>
        ({ tr, dispatch, commands }) => {
          if (dispatch) {
            commands.focus()
            tr.setSelection(
              TextSelection.create(tr.doc, 0, tr.doc.content.size),
            )
          }
          return true
        },

      setCurrentNodeSelection:
        () =>
        ({ editor, chain }) => {
          editor.commands.selectParentNode()
          const { $anchor } = editor.state.selection
          return chain()
            .setNodeSelection($anchor.pos - $anchor.depth)
            .run()
        },
      deleteSelectionNode:
        () =>
        ({ editor, commands }) => {
          const node = getSelectionNode(editor)
          if (!node) {
            return false
          }
          if (node.attrs.vnode) {
            if (
              editor.isActive('image') ||
              editor.isActive('video') ||
              editor.isActive('audio') ||
              editor.isActive('file')
            ) {
              const { options } = editor.storage
              const { id, src } = node.attrs
              options.onFileDelete?.(id, src)
            }
          }
          if (commands.deleteSelection()) {
            return true
          }
          return commands.deleteNode(node.type.name)
        },
    }
  },
})
export function getSelectionNode(editor: Editor) {
  // @ts-ignore
  const { $anchor, node } = editor.state.selection
  if (node?.type?.isAtom) {
    return node
  }
  editor.commands.selectParentNode()
  return $anchor.node(1) || node
}
export function getSelectionText(editor: Editor) {
  const { from, to, empty } = editor.state.selection
  if (empty) {
    return ''
  }
  return editor.state.doc.textBetween(from, to, '')
}
