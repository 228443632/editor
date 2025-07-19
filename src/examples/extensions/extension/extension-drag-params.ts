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

const compParamsMap = {
  compText: 1,
  imageParagraph: 1,
} as const

export interface IDragNodeParamsNode {
  /** node 参数组件类型*/
  value: string
  /** 等同于上面*/
  type: TPrettifyString<keyof typeof compParamsMap>

  /** node 参数组件名称*/
  label: string

  /** 传入的属性 */
  attrs: Record<string, any>

  /** 是否是自定义参数节点 */
  isCompParams: boolean
}

export const ExtensionDragParams = Extension.create({
  addProseMirrorPlugins() {
    const handleDrop = (view: EditorView, e: DragEvent) => {
      const nodeData = (parseJsonNoError(
        e.dataTransfer?.getData('text/plain'),
      ) || {}) as IDragNodeParamsNode

      e.preventDefault()

      if (!nodeData.isCompParams) return true // 不是自定义的参数节点
      if (!compParamsMap[nodeData.type]) return true

      switch (nodeData.type) {
        case 'compText': {
          // 获取位置并验证
          const coordinates = view.posAtCoords({
            left: e.clientX,
            top: e.clientY,
          })
          const $pos = view.state.doc.resolve(coordinates.pos)
          const nodeTypeName = $pos.parent.type.name
          if (compParamsMap[nodeTypeName]) {
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

        // 图片段落
        case 'imageParagraph': {
          const viewRect = view.dom.getBoundingClientRect()
          const viewDomPl = Math.floor(
            +window.getComputedStyle(view.dom).paddingLeft.replace('px', ''),
          )
          const offsetX = e.clientX - viewRect.left - viewDomPl
          const offsetY = e.clientY - viewRect.top
          // console.log('coordinates', {
          //   offsetX,
          //   offsetY,
          //   coordinates,
          //   nodeTypeName,
          //   $pos,
          //   left: e.clientX,
          //   top: e.clientY,
          // })

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
