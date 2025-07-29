import { mergeAttributes, Node, VueNodeViewRenderer } from '@tiptap/vue-3'

import NodeView from './NodeView.vue'
// import type { Editor } from '@tiptap/core'
// import { cssUtil } from '@/examples/utils/css-util'
// import type { Node as TNode } from 'prosemirror-model'

type TSetCompOptions = {
  type: 'compBdPage'
  attrs?: Record<string, any>
}

declare module '@tiptap/core' {
  // interface Commands<ReturnType> {
  // }
}

export const NAME = 'compBdPage' as const

export default Node.create({
  name: NAME,
  group: 'block',
  content: 'block*', // 允许包含文本内容
  defining: true,
  // marks: '',
  atom: true,

  addAttributes() {
    return {
      /** 组件名称*/
      compName: {
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
    }
  },

  // parseHTML => addAttributes中parseHTML => renderHTML => addAttributes中renderHTML
  // 解析规则（从HTML到编辑器节点） , getAttrs() {}
  parseHTML() {
    return [{ tag: `div[compname="${NAME}"]` }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return VueNodeViewRenderer(NodeView)
  },
})
