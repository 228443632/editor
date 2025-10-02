/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 20/07/25 AM2:13
 */
import { mergeAttributes, Node, VueNodeViewRenderer } from '@tiptap/vue-3'
import { useZIndexManage } from '@/views/doc-editor/hooks/use-z-index-manage'

import NodeView from './NodeView.vue'
import { simpleUUID } from '@/utils/short-id'
import { tiptapUtil } from '@/views/doc-editor/utils/tiptap-util'
import { deepClone } from 'sf-utils2'
import { updateDefaultObjectValue } from '@/views/doc-editor/utils/common-util'

const { getTop } = useZIndexManage()

export const NAME = 'compTextareaDrag' as const

type TSetCompOptions = {
  type: typeof NAME
  attrs?: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    insertCompTextareaDrag: {
      insertCompTextareaDrag: (options: TSetCompOptions) => ReturnType
    }
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
    translateY: 0,
  },
}

export default Node.create({
  name: NAME,
  group: 'inline',
  content: 'text*', // 允许包含文本内容
  draggable: false,
  selectable: false,
  inline: true, // 关键：标记为行内元素[4](@ref)
  define: true,
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

      /** zIndex */
      zIndex: {
        default: null,
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
    return [{ tag: `div[compname="${NAME}"]` }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return VueNodeViewRenderer(NodeView)
  },

  addCommands() {
    return {
      insertCompTextareaDrag:
        (options) =>
        ({ editor, state, chain, view }) => {
          const dragAttrs = deepClone(options.attrs?.dragAttrs) || {}
          updateDefaultObjectValue(dragAttrs, defaultAttributes.dragAttrs)
          options.attrs['data-id'] ||= simpleUUID()
          return chain()
            .insertContent({
              type: NAME,
              attrs: {
                ...options.attrs,
                dragAttrs,
              },
            })
            .run()
        },
    }
  },
})
