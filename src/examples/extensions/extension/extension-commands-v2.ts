/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 24/07/25 PM5:13
 */
/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 06/07/25 AM10:50
 */
import { type Editor, Extension } from '@tiptap/core'
import { COMP_PARAMS_CONFIG_MAP } from '@/examples/extensions/constant'
import { type EditorState, NodeSelection } from '@tiptap/pm/state'
import { type Node } from '@tiptap/pm/model'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    clearFormatV2: {
      clearFormatV2: () => ReturnType
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

    setFontSizeV2: {
      setFontSize: (fontSize: any) => ReturnType
    }
    unsetFontSizeV2: {
      unsetFontSize: () => ReturnType
    }
  }
}
export type CommandsV2Options = object
export const ExtensionCommandsV2 = Extension.create<CommandsV2Options>({
  name: 'extensionCommandsV2',
  addOptions() {
    return {}
  },
  // @ts-expect-error
  addCommands() {
    return {
      clearFormatV2:
        () =>
        ({ chain, editor }) => {
          const chainResult = chain().focus().unsetAllMarks()
          const { from, to } = editor.state.selection
          editor.state.doc.nodesBetween(from, to, (node) => {
            if (COMP_PARAMS_CONFIG_MAP[node.type.name]?.bold) {
              chainResult.updateAttributes(node.type.name, { cssText: {} })
            }
          })
          return chainResult.removeEmptyTextStyle().run()
        },

      /**
       * 粗体
       */
      toggleBoldV2:
        () =>
        ({ chain, editor }) => {
          const chainResult = chain()
          // editor.commands.setNodeSelection(13)
          const fontWeight = editor.isActive('bold') ? 'bold' : undefined
          const selection = editor.state.selection
          const { from, to } = selection
          const node = getSelectionNode(editor, selection)

          // if (node?.type) {
          //   if (COMP_PARAMS_NAME_MAP.compInvisibleBlock == node.type.name) {
          //     // 如果是占位符
          //   }
          //
          //   if (COMP_PARAMS_NAME_MAP.compTextDrag == node.type.name) {
          //     // 如果是拖拽的
          //     handleCustomNode(node, node?.nodeSize)
          //     return chainResult.run()
          //   }
          // }

          chainResult.focus().toggleBold()
          if (from === to) {
            // 光标合并
            node?.type && handleCustomNode(node, node?.nodeSize)
          } else {
            editor.state.doc.nodesBetween(from, to, (node) => {
              handleCustomNode(node)
            })
          }
          return chainResult.run()
          function handleCustomNode(node: Node, nodeSize?: number) {
            if (COMP_PARAMS_CONFIG_MAP[node.type.name]?.bold) {
              const cssText = {
                ...node.attrs.cssText,
                fontWeight:
                  fontWeight ||
                  node.attrs.cssText.fontWeight === 'normal' ||
                  !node.attrs.cssText.fontWeight
                    ? 'bold'
                    : 'normal',
              }
              if (nodeSize) {
                chainResult.setTextSelection({ from, to: from + nodeSize })
              }
              chainResult.updateAttributes(node.type.name, {
                cssText,
              })
            }
          }
        },

      /**
       * 斜体
       */
      toggleItalicV2:
        () =>
        ({ chain, editor }) => {
          const chainResult = chain().focus().toggleItalic()
          const { from, to } = editor.state.selection
          editor.state.doc.nodesBetween(from, to, (node) => {
            if (COMP_PARAMS_CONFIG_MAP[node.type.name]?.italic) {
              chainResult.updateAttributes(node.type.name, {
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
            if (COMP_PARAMS_CONFIG_MAP[node.type.name]?.underline) {
              chainResult.updateAttributes(node.type.name, {
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
            if (COMP_PARAMS_CONFIG_MAP[node.type.name]?.strike) {
              chainResult.updateAttributes(node.type.name, {
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
            if (COMP_PARAMS_CONFIG_MAP[node.type.name]?.color) {
              chainResult.updateAttributes(node.type.name, {
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
            if (COMP_PARAMS_CONFIG_MAP[node.type.name]?.color) {
              chainResult.updateAttributes(node.type.name, {
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
            if (COMP_PARAMS_CONFIG_MAP[node.type.name]?.backgroundColor) {
              chainResult.updateAttributes(node.type.name, {
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
            if (COMP_PARAMS_CONFIG_MAP[node.type.name]?.backgroundColor) {
              chainResult.updateAttributes(node.type.name, {
                cssText: {
                  ...node.attrs.cssText,
                  backgroundColor: null,
                },
              })
            }
          })
          return chainResult.run()
        },

      setFontSizeV2:
        (fontSize) =>
        ({ chain, editor }) => {
          const chainResult = chain().focus().setMark('textStyle', { fontSize })
          const { from, to } = editor.state.selection
          editor.state.doc.nodesBetween(from, to, (node) => {
            if (COMP_PARAMS_CONFIG_MAP[node.type.name]?.fontSize) {
              chainResult.updateAttributes(node.type.name, {
                cssText: {
                  ...node.attrs.cssText,
                  fontSize,
                },
              })
            }
          })
          return chainResult.run()
        },

      unsetFontSizeV2:
        () =>
        ({ chain, editor }) => {
          const chainResult = chain()
            .focus()
            .setMark('textStyle', { fontSize: null })
          const { from, to } = editor.state.selection
          editor.state.doc.nodesBetween(from, to, (node) => {
            if (COMP_PARAMS_CONFIG_MAP[node.type.name]?.fontSize) {
              chainResult.updateAttributes(node.type.name, {
                cssText: {
                  ...node.attrs.cssText,
                  fontSize: null,
                },
              })
            }
          })
          return chainResult.removeEmptyTextStyle().run()
        },

      /**
       * 删除
       */
      intentDeleteV2: () => {
        return ({ chain, editor }) => {
          // editor.view.dom.dispatchEvent(
          //   new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }),
          // )
          const { $from, $to } = editor.state.selection
          const chainResult = chain()
          if ($from.pos === $to.pos) {
            if ($from.nodeBefore?.type.spec.atom) {
              chainResult.deleteRange({
                from: $from.pos - $from.nodeBefore.nodeSize,
                to: $from.pos,
              })
            } else {
              chainResult.deleteRange({ from: $from.pos - 1, to: $from.pos })
            }
          } else {
            chainResult.deleteSelection()
          }
          // 删除字符或默认行为
          return chainResult.run()
        }
      },
    }
  },
})

/**
 * 获取当前选中的节点
 * @param editor
 * @param selection
 */
function getSelectionNode(
  editor: Editor,
  selection?: EditorState['selection'],
) {
  selection ||= editor.state.selection
  let node: Node
  if (selection instanceof NodeSelection) {
    node = selection.node
  } else {
    node = editor.state.doc.nodeAt(selection.from)
  }
  return node
}
