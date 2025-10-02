/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 30/07/25 PM8:27
 */
import { Extension } from '@tiptap/core'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { Plugin, PluginKey } from 'prosemirror-state'

export const ExtensionDecorationTest = Extension.create({
  name: 'decorationTest',

  addProseMirrorPlugins() {
    const highlightDecoration = Decoration.inline(
      0,
      this.editor.state.doc.content.size,
      {
        class: 'umo-text-selection111',
      },
    )

    const decoset = DecorationSet.create(this.editor.state.doc, [
      highlightDecoration,
    ])

    return [
      new Plugin({
        key: new PluginKey('DecorationTest'),

        state: {
          init() {
            return decoset
          },
          apply(tr, old) {
            return old.map(tr.mapping, tr.doc)
          },
        },

        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },
})
