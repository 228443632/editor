/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 23/04/25 PM2:10
 */

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { parseJsonNoError } from 'sf-utils2'
import type { TPrettifyString } from 'sf-utils2/types/generic-helper'
// import type { Editor } from '@tiptap/vue-3'
import type { EditorView } from 'prosemirror-view'
import { COMP_PARAMS_MAP } from '@/examples/extensions/constant'

export interface IDragNodeParamsNode {
  /** node 参数组件类型*/
  value: string
  /** 等同于上面*/
  type: TPrettifyString<keyof typeof COMP_PARAMS_MAP>

  /** node 参数组件名称*/
  label: string

  /** 传入的属性 */
  attrs: Record<string, any>

  /** 是否是自定义参数节点 */
  isCompParams: boolean
}

export const ExtensionDragParams = Extension.create({
  name: 'dragNodeParams',
  addProseMirrorPlugins() {
    /**
     * 如果返回 true，则不允许有元素生成在内
     * 如果是false， 允许
     */
    const handleDrop = (
      view: EditorView,
      e: DragEvent,
      slice,
      move: boolean,
    ) => {
      if (move) return false

      const nodeData = (parseJsonNoError(
        e.dataTransfer?.getData('text/plain'),
      ) || {}) as IDragNodeParamsNode

      if (!COMP_PARAMS_MAP[nodeData.type]) return true

      switch (nodeData.type) {
        case COMP_PARAMS_MAP.compText: {
          e.preventDefault()

          // 获取位置并验证
          const coordinates = view.posAtCoords({
            left: e.clientX,
            top: e.clientY,
          })
          const $pos = view.state.doc.resolve(coordinates.pos)
          const nodeTypeName = $pos.parent.type.name
          if (COMP_PARAMS_MAP[nodeTypeName]) {
            useMessage('error', {
              content: '当前位置已有普通文本，请拖拽到其他位置',
            })
            return true
          }

          // 插入内容
          const editor = this.editor
          editor
            .chain()
            .focus()
            .insertContentAt(coordinates.pos, {
              type: nodeData.value, // 替换为你的自定义节点类型
              attrs: nodeData.attrs,
            })
            .run()
          break
        }

        // 文本悬浮
        case COMP_PARAMS_MAP.compTextDrag: {
          e.preventDefault()

          const viewRect = view.dom.getBoundingClientRect()
          const viewDomPl = Math.floor(
            +window.getComputedStyle(view.dom).paddingLeft.replace('px', ''),
          )
          const offsetX = e.clientX - viewRect.left - viewDomPl
          const offsetY = e.clientY - viewRect.top

          this.editor
            .chain()
            .insertCompTextDragByAttrs({
              dragAttrs: {
                top: offsetY,
                left: offsetX,
              },
            })
            .run()
          break
        }

        // 图片段落
        case COMP_PARAMS_MAP.imageParagraph: {
          const viewRect = view.dom.getBoundingClientRect()
          const viewDomPl = Math.floor(
            +window.getComputedStyle(view.dom).paddingLeft.replace('px', ''),
          )
          const offsetX = e.clientX - viewRect.left - viewDomPl
          const offsetY = e.clientY - viewRect.top

          this.editor
            .chain()
            .focus()
            .setImageParagraph({
              left: offsetX,
              top: offsetY,
              src: 'https://minio.tezixing.com/zsap/icon/20250616/1934517885540306945_1934517885540306946.jpg',
            })
            .run()
          break
        }
        default: {
          break
        }
      }
      return true
    }

    return [
      new Plugin({
        key: new PluginKey('PluginDragParams'),
        props: {
          handleDrop,
        },
      }),
    ]
  },
})
