/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 20/07/25 AM2:13
 */
import { mergeAttributes, Node, VueNodeViewRenderer } from '@tiptap/vue-3'
import { useZIndexManage } from '@/examples/hooks/use-z-index-manage'

import NodeView from './NodeView.vue'
import { simpleUUID } from '@/utils/short-id'
import { tiptapUtil } from '@/examples/utils/tiptap-util'
import { deepClone } from 'sf-utils2'
import { updateDefaultObjectValue } from '@/examples/utils/common-util'
import { COMP_PARAMS_NAME_MAP, COMP_SEAL_STYLE } from '@/examples/extensions/constant'

const { getTop } = useZIndexManage()

export const NAME = 'compSeal' as const

type TSetCompOptions = {
  type: typeof NAME
  attrs?: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    insertCompSeal: {
      insertCompSeal: (options: TSetCompOptions) => ReturnType
    }

    insertCompSealByAttrs: {
      insertCompSealByAttrs: (attrs: TSetCompOptions['attrs']) => ReturnType
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
    width: COMP_SEAL_STYLE.width,
    height: COMP_SEAL_STYLE.height,
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
  group: 'block',
  content: 'inline*', // 允许包含文本内容
  draggable: false,
  selectable: true,
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
      insertCompSeal:
        (options) =>
        ({ editor, state, chain, view, commands }) => {
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

          options.attrs['data-id'] ||= simpleUUID()
          // const node = tiptapUtil.nodeAt(editor, 0)
          // let pos = 0
          // if (node && node.type.name !== COMP_PARAMS_NAME_MAP.compInvisibleBlock) {
          //   commands.insertContentAt(0, {
          //     type: COMP_PARAMS_NAME_MAP.compInvisibleBlock,
          //   })
          // }

          let invisibleBlockPos = 0
          return chain()
            .insertContentAt(invisibleBlockPos, {
              type: COMP_PARAMS_NAME_MAP.compInvisibleBlock,
              attrs: {
                refId: options.attrs['data-id'],
              },
            })
            .command(({ tr }) => {
              invisibleBlockPos = tr.mapping.map(invisibleBlockPos) // 动态映射位置
              return true
            })
            .insertContentAt(invisibleBlockPos, {
              type: options.type,
              attrs: {
                ...options.attrs,
                dragAttrs,
              },
            })
            .run()
        },

      insertCompSealByAttrs:
        (attrs) =>
        ({ chain }) => {
          let invisibleBlockPos = 0
          const dragAttrs = deepClone(attrs?.dragAttrs) || {}
          attrs['data-id'] ||= simpleUUID()
          updateDefaultObjectValue(dragAttrs, defaultAttributes.dragAttrs)
          return chain()
            .insertContentAt(invisibleBlockPos, {
              type: COMP_PARAMS_NAME_MAP.compInvisibleBlock,
              attrs: {
                refId: attrs['data-id'],
              },
            })
            .command(({ tr }) => {
              invisibleBlockPos = tr.mapping.map(invisibleBlockPos) // 动态映射位置
              return true
            })
            .insertContentAt(2, {
              type: NAME,
              attrs: {
                ...attrs,
                dragAttrs,
              },
            })
            .run()
        },
    }
  },
})

// /**
//  * 获取拖拽节点的矩形信息
//  */
// function computedDragRect() {
//
// }
