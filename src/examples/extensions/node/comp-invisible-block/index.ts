/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 20/07/25 AM2:13
 */
import { mergeAttributes, Node, VueNodeViewRenderer } from '@tiptap/vue-3'

import NodeView from './NodeView.vue'
import { simpleUUID } from '@/utils/short-id'
import { tiptapUtil } from '@/examples/utils/tiptap-util'

export const NAME = 'compInvisibleBlock' as const

type TSetCompOptions = {
  type: typeof NAME
  attrs?: Record<string, any>
}

declare module '@tiptap/core' {
  // interface Commands<ReturnType> {}
}

export default Node.create({
  name: NAME,
  group: 'block',
  content: 'inline*', // 允许包含文本内容
  draggable: false,
  inline: false, // 关键：标记为行内元素[4](@ref)
  // marks: '',
  atom: true,

  addAttributes() {
    return {
      /** 组件名称*/
      compName: {
        default: NAME,
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

      /** 唯一标识 */
      'data-id': {
        default: undefined,
        parseHTML: (element) => element.getAttribute('data-id') ?? simpleUUID(),
      },

      /** 引用节点id */
      refId: {
        default: undefined,
      },

      ...tiptapUtil.addAttributes(),
    }
  },

  // 解析规则（从HTML到编辑器节点） , getAttrs() {}
  parseHTML() {
    return [{ tag: `div[compname="${NAME}"]` }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(NodeView)
  },

  addCommands() {
    return {}
  },
})

// /**
//  * 获取拖拽节点的矩形信息
//  */
// function computedDragRect() {
//
// }
