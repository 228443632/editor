/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 23/04/25 PM2:10
 */

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
// import type { Editor } from '@tiptap/vue-3'
import type { EditorView } from 'prosemirror-view'
import { DOMParser as DOMParser2 } from 'prosemirror-model'
import { debounce } from 'sf-utils2'
import { simpleUUID } from '@/utils/short-id'

import { Fragment } from 'prosemirror-model'
import { useMessage } from '@/composables/dialog'

const debounceUseMessage = debounce(useMessage, 500)

export const ExtensionPasteParams = Extension.create({
  name: 'pasteCustomParam',
  addProseMirrorPlugins() {
    /**
     * 如果返回 true，则不允许有元素生成在内
     * 如果是false， 允许
     */
    const handlePaste = (view: EditorView, e: ClipboardEvent, slice) => {
      const { clipboardData } = e
      const html = clipboardData.getData('text/html') // html
      if (html) {
        //   console.log('复制的html', html)

        // 加粗 b strong font-weight: bold
        // 斜体 em i font-style: italic
        // 删除线 s text-underline: line-through
        // 下标 sub
        // 上标 sup
        const fragmentDom = new DOMParser().parseFromString(html, 'text/html')
        const walker = document.createTreeWalker(
          fragmentDom.documentElement,
          NodeFilter.SHOW_ELEMENT,
          null,
        )

        let currentNode: HTMLHtmlElement
        // 遍历所有文本节点
        // @ts-expect-error
        while ((currentNode = walker.nextNode())) {
          if (currentNode.getAttribute('data-id')) {
            const compName = currentNode.getAttribute('compname')
            if (compName) {
              currentNode.setAttribute('data-id', simpleUUID())
            }
          }

          // 忽略空白文本节点
          if (currentNode['style'].fontFamily) {
            currentNode['style'].fontFamily = ''
          }
          // currentNode['style'].color = 'red'

          if (currentNode.tagName === 'IMG') {
            if (/^file:/.test(currentNode.getAttribute('src'))) {
              debounceUseMessage('error', {
                content:
                  '图片粘贴失败，请打开原图「复制」后粘贴，或用「插入图片」的方式',
              })
              currentNode.remove()
            }
          }
        }

        const { schema } = view.state
        const parser = DOMParser2.fromSchema(schema)
        const slice = parser.parseSlice(fragmentDom, {
          preserveWhitespace: true,
        })
        console.log('fragmentDom.documentElement', fragmentDom.documentElement)

        view.dispatch(view.state.tr.replaceSelection(slice))

        //   const scheme = view.state.schema
        //   const slice = DOMParserAlias.fromSchema(scheme).parseSlice(fragmentDom)
        //
        //   // fragmentDom.createTreeWalker(fragmentDom.documentElement)
        //
        //   const modifiedContent = modifyFragment(slice.content, 'Roboto')
        //   const newSlice = new Slice(
        //     Fragment.from(modifiedContent),
        //     slice.openStart,
        //     slice.openEnd,
        //   )
        //   console.log('newSlice', newSlice.toJSON())
        //   view.dispatch(view.state.tr.replaceSelection(newSlice))
        //   return true
        // }

        // const text = clipboardData.getData('text/text') // 文字
        // const plain = clipboardData.getData('text/plain') //
        // const urlList = clipboardData.getData('text/uri-list')
        // const files = Array.from(clipboardData.files)
        // console.log('parsePaste', {
        //   html,
        //   plain,
        //   text,
        //   files,
        //   urlList,
        // })
        return true
      }
      return false

      /**
       * 递归修改文本节点的字体
       * @param fragment
       * @param font
       */
      function modifyFragment(fragment: Fragment, font: string) {
        const nodes = []
        fragment.forEach((node) => {
          if (node.isText) {
            const newMarks = node.marks
              // .filter((m) => m.type.name !== 'textStyle')
              .concat(
                view.state.schema.marks.textStyle.create({ fontFamily: font }),
              )
            nodes.push(view.state.schema.text(node.text, newMarks))
          } else if (node.content) {
            nodes.push(
              node.type.create(node.attrs, modifyFragment(node.content, font)),
            )
          } else {
            nodes.push(node)
          }
        })
        return Fragment.from(nodes)
      }
    }

    return [
      new Plugin({
        key: new PluginKey('PasteCustomParam'),
        props: {
          handlePaste,
        },
      }),
    ]
  },

  /**
   * 可选：阻止通过键盘删除（如 Backspace/Delete 键）
   */
  addKeyboardShortcuts() {
    console.log('this', this)

    const preventDelete = () => {
      // const { selection } = this.editor.state
      // const { $from, $to } = selection
      // // const nodePos = this.node.pos
      // if ($from.pos === $to.pos) {
      //   // 光标闭合
      //   if ($from.nodeBefore?.type?.name == 'compText') {
      //     // this.editor.view.state.tr.setSelection({
      //     //   anchor: $from.pos,
      //     //   head: $from.pos,
      //     // })
      //     return true // 阻止默认删除行为
      //   }
      // } else {
      //   // 非光标闭合
      //   this.editor.state.doc.nodesBetween($from.pos, $to.pos, (node) => {
      //     if (node.type.name === 'compText') {
      //       return true
      //     }
      //   })
      // }
      return false // 允许其他区域的删除
    }

    return {
      Backspace: () => preventDelete(),
      'Shift-Backspace': () => preventDelete(),
      Delete: () => preventDelete(),
    }

    // 辅助方法：检查是否处于受保护节点内
  },
})
