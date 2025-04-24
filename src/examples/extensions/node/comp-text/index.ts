import { mergeAttributes, Node, VueNodeViewRenderer } from '@tiptap/vue-3'

import NodeView from './NodeView.vue'
// import type { Editor } from '@tiptap/core'
import { ReplaceStep } from 'prosemirror-transform'
import { simpleUUID } from '@/utils/short-id'

type TSetCompOptions = {
  type: 'compText'
  attrs?: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setCompText: {
      setCompText: (options: any) => ReturnType
    }
    setComp: {
      setComp: (options: TSetCompOptions) => ReturnType
    }

    swapNodes: {
      swapNodes: (pos1: number, pos2: number) => ReturnType
    }
  }
}

export const NAME = 'compText'

export default Node.create({
  name: NAME,
  group: 'inline',
  content: 'text*', // 允许包含文本内容
  inline: true, // 关键：标记为行内元素[4](@ref)
  defining: true,
  // marks: '',

  addAttributes() {
    return {
      /** 组件名称*/
      name: {
        default: NAME,
        parseHTML: () => NAME,
      },
      /** 唯一标识 */
      nodeId: {
        default: undefined,
        parseHTML: (element) => element.getAttribute('nodeid') ?? simpleUUID(),
      },

      /** 占位 */
      placeholder: {
        default: '',
      },

      /** 字段名称 */
      fieldName: {
        default: 'name',
      },

      /** 是否参数组件 */
      isCompParams: {
        default: true,
      },

      /** 备注，填写说明 */
      desc: {
        default: '',
      },

      /** 默认值 */
      defaultValue: {
        default: '',
      },
    }
  },

  // 解析规则（从HTML到编辑器节点） , getAttrs() {}
  parseHTML() {
    return [{ tag: 'span[data-comp-is="text"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-placeholder': HTMLAttributes.placeholder,
      }),
      [
        'text', // 占位符
        { class: 'hidden' },
        `\${${HTMLAttributes?.fieldName}}`,
      ],
    ]
  },

  addNodeView() {
    return VueNodeViewRenderer(NodeView)
  },

  addCommands() {
    return {
      setCompText:
        (options) =>
        ({ commands, editor }) => {
          return commands.insertContentAt(editor.state.selection.anchor, {
            type: this.name,
            attrs: options,
          })
        },

      setComp:
        (options) =>
        ({ commands, editor }) => {
          return commands.insertContentAt(editor.state.selection.anchor, {
            ...options,
            type: options.type,
            attrs: options.attrs,
          })
        },

      /**
       * 交换节点位置
       * @param pos1
       * @param pos2
       */
      swapNodes:
        (pos1, pos2) =>
        ({  tr, state }) => {
          const node1 = state.doc.nodeAt(pos1)
          const node2 = state.doc.nodeAt(pos2)

          if (!node1 || !node2) return false

          // 计算节点尺寸差异
          const sizeDiff = node1.nodeSize - node2.nodeSize

          // 动态调整 pos2（避免重叠或越界）
          let adjustedPos2 = pos2
          if (pos1 < pos2) {
            adjustedPos2 += sizeDiff // 如果 node1 比 node2 大，pos2 需向后偏移
          } else {
            adjustedPos2 -= sizeDiff // 反向交换时向前偏移
          }

          // 原子化交换（使用 ReplaceStep 保证事务一致性）
          tr.step(
            new ReplaceStep(
              pos1,
              pos1 + node1.nodeSize,
              state.doc.slice(pos2, pos2 + node2.nodeSize),
            ),
          ).step(
            new ReplaceStep(
              adjustedPos2,
              adjustedPos2 + node2.nodeSize,
              state.doc.slice(pos1, pos1 + node1.nodeSize),
            ),
          )

          return true
        },
    }
  },

  // addOptions() {
  //   return {
  //     types: ['textStyle'],
  //     defaultFontSize: '14px',
  //   }
  // },
  // addGlobalAttributes() {
  //   return [
  //     {
  //       types: this.options.types,
  //       attributes: {
  //         fontSize: {
  //           default: this.options.defaultFontSize,
  //           parseHTML: (element) =>
  //             element.style.fontSize || this.options.defaultFontSize,
  //           renderHTML: (attributes) => {
  //             if (attributes.fontSize === this.options.defaultFontSize) {
  //               return {}
  //             }
  //             return { style: `font-size: ${attributes.fontSize}` }
  //           },
  //         },
  //       },
  //     },
  //   ]
  // },
})

