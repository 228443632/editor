/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 06/07/25 AM10:50
 */
import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    clearFormat: {
      clearFormat: () => ReturnType
    }

    toggleBoldV2: {
      toggleBoldV2: () => ReturnType
    }

    toggleItalicV2: {
      toggleItalicV2: () => ReturnType
    }

    toggleStrikeV2: {
      toggleStrikeV2: () => ReturnType
    }

    setColorV2: {
      setColorV2: () => ReturnType
    }

    unsetColorV2: {
      unsetColorV2: () => ReturnType
    }

    setHighlightV2: {
      setHighlightV2: () => ReturnType
    }

    unsetHighlightV2: {
      unsetHighlightV2: () => ReturnType
    }
  }
}
export type ClearFormatOption = object
export default Extension.create<ClearFormatOption>({
  name: 'clearFormat',
  addOptions() {
    return {}
  },
  // @ts-expect-error
  addCommands() {
    return {
      clearFormat:
        () =>
        ({ chain }) => {
          // feat 特定节点
          return chain()
            .focus()
            .unsetAllMarks()
            .updateAttributes('compText', { cssText: {} })
            .run()
        },

      /**
       * 粗体
       */
      toggleBoldV2:
        () =>
        ({ chain, editor }) => {
          const chainResult = chain().focus().toggleBold()
          const { from, to } = editor.state.selection
          editor.state.doc.nodesBetween(from, to, (node) => {
            if (node.type.name === 'compText') {
              chainResult.updateAttributes('compText', {
                cssText: {
                  ...node.attrs.cssText,
                  fontWeight:
                    node.attrs.cssText.fontWeight === 'bold'
                      ? 'normal'
                      : 'bold',
                },
              })
            }
          })
          return chainResult.run()
        },

      /**
       * 斜体
       */
      toggleItalicV2:
        () =>
        ({ chain, editor }) => {
          const chainResult = chain().focus().toggleBold()
          const { from, to } = editor.state.selection
          editor.state.doc.nodesBetween(from, to, (node) => {
            if (node.type.name === 'compText') {
              chainResult.updateAttributes('compText', {
                cssText: {
                  ...node.attrs.cssText,
                  fontStyle:
                    node.attrs.cssText.fontStyle === 'italic' ? null : 'italic',
                },
              })
            }
          })
          return chainResult.run()
        },

      /**
       * 下划线
       */
      toggleUnderlineV2:
        () =>
        ({ chain, editor }) => {
          const chainResult = chain().focus().toggleUnderline()
          const { from, to } = editor.state.selection
          editor.state.doc.nodesBetween(from, to, (node) => {
            if (node.type.name === 'compText') {
              chainResult.updateAttributes('compText', {
                cssText: {
                  ...node.attrs.cssText,
                  textDecoration:
                    node.attrs.cssText.textDecoration === 'underline'
                      ? null
                      : 'underline',
                },
              })
            }
          })
          return chainResult.run()
        },

      /**
       * 删除线
       */
      toggleStrikeV2:
        () =>
        ({ chain, editor }) => {
          const chainResult = chain().focus().toggleStrike()
          const { from, to } = editor.state.selection
          editor.state.doc.nodesBetween(from, to, (node) => {
            if (node.type.name === 'compText') {
              chainResult.updateAttributes('compText', {
                cssText: {
                  ...node.attrs.cssText,
                  textDecoration:
                    node.attrs.cssText.textDecoration === 'line-through'
                      ? null
                      : 'line-through',
                },
              })
            }
          })
          return chainResult.run()
        },

      /**
       * 设置颜色
       */
      setColorV2:
        (color: string) =>
        ({ chain, editor }) => {
          const chainResult = chain().focus().setColor(color)
          const { from, to } = editor.state.selection
          editor.state.doc.nodesBetween(from, to, (node) => {
            if (node.type.name === 'compText') {
              chainResult.updateAttributes('compText', {
                cssText: {
                  ...node.attrs.cssText,
                  color,
                },
              })
            }
          })
          return chainResult.run()
        },

      /**
       * 设置颜色
       */
      unsetColorV2:
        () =>
        ({ chain, editor }) => {
          const chainResult = chain().focus().unsetColor()
          const { from, to } = editor.state.selection
          editor.state.doc.nodesBetween(from, to, (node) => {
            if (node.type.name === 'compText') {
              chainResult.updateAttributes('compText', {
                cssText: {
                  ...node.attrs.cssText,
                  color: null,
                },
              })
            }
          })
          return chainResult.run()
        },

      setHighlightV2:
        ({ color }) =>
        ({ chain, editor }) => {
          const chainResult = chain().focus().setHighlight({ color })
          const { from, to } = editor.state.selection
          editor.state.doc.nodesBetween(from, to, (node) => {
            if (node.type.name === 'compText') {
              chainResult.updateAttributes('compText', {
                cssText: {
                  ...node.attrs.cssText,
                  backgroundColor: color,
                },
              })
            }
          })
          return chainResult.run()
        },

      unsetHighlightV2:
        () =>
        ({ chain, editor }) => {
          const chainResult = chain().focus().unsetHighlight()
          const { from, to } = editor.state.selection
          editor.state.doc.nodesBetween(from, to, (node) => {
            if (node.type.name === 'compText') {
              chainResult.updateAttributes('compText', {
                cssText: {
                  ...node.attrs.cssText,
                  backgroundColor: null,
                },
              })
            }
          })
          return chainResult.run()
        },
    }
  },
})
