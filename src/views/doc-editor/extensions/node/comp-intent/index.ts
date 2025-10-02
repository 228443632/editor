import { mergeAttributes, Node, VueNodeViewRenderer } from '@tiptap/vue-3'

import NodeView from './NodeView.vue'
// import type { Editor } from '@tiptap/core'
// import { cssUtil } from '@/views/doc-editor/utils/css-util'
// import type { Node as TNode } from 'prosemirror-model'

type TSetCompOptions = {
  type: 'compText'
  attrs?: Record<string, any>
}

declare module '@tiptap/core' {
  // interface Commands<ReturnType> {
  // }
}

export const NAME = 'compIntent' as const

export default Node.create({
  name: NAME,
  group: 'inline',
  content: 'text*', // 允许包含文本内容
  inline: true, // 关键：标记为行内元素[4](@ref)
  defining: true,
  // marks: '',
  selectable: false,
  atom: true,

  addAttributes() {
    return {
      /** 组件名称*/
      name: {
        default: NAME,
        parseHTML: () => NAME,
      },

      /** 是否参数组件 */
      isCompParams: {
        default: true,
      },

      /**
       * 是否显示气泡菜单
       */
      isShowBubbleMenu: {
        default: false,
      },

      /**
       * 缩进个数
       * 2 表示 2em
       * 1 表示 1em
       */
      intentNum: {
        default: 2,
      },
    }
  },

  // parseHTML => addAttributes中parseHTML => renderHTML => addAttributes中renderHTML
  // 解析规则（从HTML到编辑器节点） , getAttrs() {}
  parseHTML() {
    return [{ tag: `span[name="${NAME}"][iscompparams]` }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return VueNodeViewRenderer(NodeView)
  },
})
