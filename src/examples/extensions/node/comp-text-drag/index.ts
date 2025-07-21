/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 20/07/25 AM2:13
 */
import { mergeAttributes, Node, VueNodeViewRenderer } from '@tiptap/vue-3'

import NodeView from './NodeView.vue'
// import type { Editor } from '@tiptap/core'
import { simpleUUID } from '@/utils/short-id'
import { tiptapUtil } from '@/examples/utils/tiptap-util'
import { deepClone } from 'sf-utils2'
import { updateDefaultObjectValue } from '@/examples/utils/common-util'
// import type { Node as TNode } from 'prosemirror-model'

export const NAME = 'compTextDrag' as const

type TSetCompOptions = {
  type: typeof NAME
  attrs?: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    insertCompTextDrag: {
      insertCompTextDrag: (options: TSetCompOptions) => ReturnType
    }

    insertCompTextDragByAttrs: {
      insertCompTextDragByAttrs: (attrs: TSetCompOptions['attrs']) => ReturnType
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

const defaultAttributes = {
  dragAttrs: {
    width: 56,
    height: 20,
    left: 0,
    top: '0',
    angle: null,
    rotatable: false,
    equalProportion: false,
  },
}

export default Node.create({
  name: NAME,
  group: 'block',
  content: 'text*', // 允许包含文本内容
  inline: false, // 关键：标记为行内元素[4](@ref)
  defining: true,
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

      ...tiptapUtil.addAttributes(),

      /** 是否拖拽 */
      isDraggable: {
        default: true,
      },

      dragAttrs: {
        default: deepClone(defaultAttributes.dragAttrs),

        parseHTML: (element) => {
          const dragAttrs = element.getAttribute('dragattrs')
          return dragAttrs ? JSON.parse(decodeURIComponent(dragAttrs)) : null
        },

        renderHTML: (attrs) => {
          return {
            dragAttrs: encodeURIComponent(JSON.stringify(attrs.dragAttrs)),
          }
        },
      },

      /** 占位 */
      placeholder: {
        default: '占位文字',
      },

      /** 边框类型*/
      borderType: {
        default: 'none', // 下划线，可选值：underline solid dashed
      },

      /** 字段名称 */
      fieldName: {
        default: 'fieldName',
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
    return [{ tag: `span[compname="${NAME}"]` }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return VueNodeViewRenderer(NodeView)
  },

  addCommands() {
    return {
      insertCompTextDrag:
        (options) =>
        ({ editor, state, commands, view }) => {
          if (editor.isEmpty)
            return useMessage('error', {
              content:
                '当前内容为空，不支持悬浮控件，请输入内容后，再尝试！！！',
            })
          const { anchor } = state.selection
          const { left: clientX, top: clientY } = view.coordsAtPos(anchor)
          const viewRect = view.dom.getBoundingClientRect()
          const viewDomPl = Math.floor(
            +window.getComputedStyle(view.dom).paddingLeft.replace('px', ''),
          )

          const offsetX = clientX - viewRect.left - viewDomPl
          const offsetY = clientY - viewRect.top

          const dragAttrs = deepClone(options.attrs?.dragAttrs) || {}
          updateDefaultObjectValue(dragAttrs, defaultAttributes.dragAttrs)
          Object.assign(dragAttrs, {
            left: offsetX,
            top: offsetY,
          })
          return commands.insertContentAt(0, {
            type: options.type,
            attrs: {
              dragAttrs,
            },
          })
        },

      insertCompTextDragByAttrs:
        (attrs) =>
        ({ commands }) => {
          const dragAttrs = deepClone(attrs?.dragAttrs) || {}
          updateDefaultObjectValue(dragAttrs, defaultAttributes.dragAttrs)
          return commands.insertContentAt(0, {
            type: NAME,
            attrs: {
              ...attrs,
              dragAttrs,
            },
          })
        },
    }
  },
})
