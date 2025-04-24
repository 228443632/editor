import { mergeAttributes, Node, VueNodeViewRenderer } from '@tiptap/vue-3'

import NodeView from './NodeView.vue'
// import type { Editor } from '@tiptap/core'
import { simpleUUID } from '@/utils/short-id'
// import type { Node as TNode } from 'prosemirror-model'

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

    // swapNodesByNodes: {
    //   swapNodesByNodes: (
    //     node1: TNode,
    //     node2: TNode,
    //     option?: { key: string },
    //   ) => ReturnType
    // }
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
      'data-id': {
        default: undefined,
        parseHTML: (element) => element.getAttribute('data-id') ?? simpleUUID(),
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
    return [{ tag: `span[name="${NAME}"][data-id][iscompparams]` }]
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
