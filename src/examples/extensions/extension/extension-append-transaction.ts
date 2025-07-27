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

import { Fragment } from 'prosemirror-model'
import {
  AddMarkStep,
  RemoveMarkStep,
  ReplaceAroundStep,
  ReplaceStep,
} from 'prosemirror-transform'
import { useMessage } from '@/composables/dialog'

const debounceUseMessage = debounce(useMessage, 500)

export const ExtensionAppendTransaction = Extension.create({
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
        key: new PluginKey('AppendTransactionPlugin'),
        filterTransaction: (tr, state) => {
          return true
        },

        appendTransaction(transactions, oldState, newState) {
          let isBreakChange = false
          const newTr = newState.tr
          for (const tr of transactions) {
            for (const step of tr.steps) {
              if (step instanceof ReplaceStep) {
                const { from, to, slice } = step
                if (slice.content.size === 0) {
                  // 删除操作
                  console.log('删除操作:', `从 ${from} 到 ${to}`)
                  oldState.doc.nodesBetween(from, to, (node) => {
                    // 拖拽文本组件
                    if (node.type.name === 'compTextDrag') {
                      const dataId = node.attrs['data-id']

                      const comInvisibleBlockNode = oldState.doc.children.find(
                        (node) => {
                          return (
                            node.type.name === 'compInvisibleBlock' &&
                            node.attrs['refId'] === dataId
                          )
                        },
                      )
                      if (comInvisibleBlockNode) {
                        let tempPos
                        oldState.doc.descendants((node, pos) => {
                          if (
                            node.type.name === 'compInvisibleBlock' &&
                            node.attrs['refId'] === dataId
                          ) {
                            tempPos = pos
                            return true
                          }
                          return false
                        })

                        console.log(
                          'comInvisibleBlockNode',
                          comInvisibleBlockNode,
                          tempPos,
                        )
                        if (tempPos >= 0) {
                          newTr.delete(
                            tempPos,
                            tempPos + comInvisibleBlockNode.nodeSize,
                          )
                        }
                        isBreakChange = true
                      }
                    }
                  })

                  if (isBreakChange) {
                    break
                  }
                } else {
                  console.log(
                    '替换操作:',
                    `从 ${from} 到 ${to}，内容为 ${slice.content.toJSON()}`,
                  )
                }
              } else if (step instanceof AddMarkStep) {
                const { from, to, mark } = step
                console.log(
                  '添加样式:',
                  `从 ${from} 到 ${to}，标记为 ${mark.type.name}`,
                )
              } else if (step instanceof RemoveMarkStep) {
                const { from, to, mark } = step
                console.log(
                  '移除样式:',
                  `从 ${from} 到 ${to}，标记为 ${mark.type.name}`,
                )
              } else if (step instanceof ReplaceAroundStep) {
                const { from, to, gapFrom, gapTo, slice } = step
                console.log(
                  '复杂替换:',
                  `范围 [${from}, ${to}], 插入内容: ${slice.content.toJSON()}`,
                )
              }
            }
          }
          if (isBreakChange) return newTr
          return null // 不修改事务
        },
      }),
    ]
  },
})
