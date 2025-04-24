<template>
  <div class="examples">
    <umo-editor ref="editorRef" v-bind="options">
      <!-- 基础工具   -->
      <template #toolbar_base>
        <ParamsLib></ParamsLib>
      </template>

      <!--  TOC 内容  -->
      <template #toc-content-params>
        <LeftTocParams></LeftTocParams>
      </template>

      <!--  内容右侧  -->
      <template #container-page-right>
        <RightParamsLib></RightParamsLib>
      </template>
    </umo-editor>
  </div>
</template>

<script setup lang="ts">
import { shortId } from '@/utils/short-id'
import ParamsLib from './toolbar/base/ParamsLib.vue'
import RightParamsLib from './components/RightParamsLib.vue'
import LeftTocParams from './components/LeftTocParams.vue'

import { defaultOptions } from './utils/default-options'
import { shallowMergeWithArrayOverride } from '@/examples/utils/object-util'

// extension
import extensions from './extensions'
import { debounce } from 'sf-utils2'

// types
import type { Editor } from '@tiptap/vue-3'
// import type { Editor } from '@tiptap/core'
// import { type EditorView } from 'prosemirror-view'
// import type { Node as TNode } from 'prosemirror-model'
// import { Plugin } from 'prosemirror-state'

const editorRef = $ref(null)

const nodeList = ref([])
const globalBizState = ref({
  /** 当前选中的node节点 */
  nodeActive: undefined,
})

provide('__compNodeList__', nodeList)
provide('__globalBizState__', globalBizState)

function selectionChange({ editor }: { editor: Editor }) {
  const node = editor.state.doc.nodeAt(editor.state.selection.anchor)
  // const node = editor.state.selection.$anchor.parent
  if (node?.attrs.isCompParams) {
    options.document.isShowBubbleMenu = false
  } else {
    options.document.isShowBubbleMenu = true
  }
}
const debounceSelectionChange = debounce(selectionChange, 100)

const options = $ref(
  shallowMergeWithArrayOverride(
    { ...defaultOptions },
    {
      extensions,
      toolbar: {
        // defaultMode: 'classic',
        // menus: ['base'],
        // disableMenuItems: [''],
      },
      document: {
        title: '合同低码平台',
        content:
          localStorage.getItem('document.content') ??
          '<p data-id="a99806c5f14e13b90a1d">2234243测试文档<span nodeid="1e7968a2c380aeffc764" placeholder="普通文本2" fieldname="name" data-comp-is="text" data-placeholder="普通文本2"><text class="hidden">${name}</text></span><span nodeid="16cd3c0a1b5a9c7de8bb" placeholder="普通文本3" fieldname="name" data-comp-is="text" data-placeholder="普通文本3"><text class="hidden">${name}</text></span><span nodeid="950efc7c23640bc1bbc2" placeholder="普通文本1" fieldname="name" data-comp-is="text" data-placeholder="普通文本1"><text class="hidden">${name}</text></span>234242年什么饭呢什么饭</p><p data-id="743f142b2d58fdc6b4b5"></p><p data-id="bc646db6aa0ab9037534"><span nodeid="ffd8f1a92c8488a6fb86" placeholder="普通文本4" fieldname="name" data-comp-is="text" data-placeholder="普通文本4"><text class="hidden">${name}</text></span></p><p data-id="ec6f114f38aca3358143"><span nodeid="af11fbfc77290caa3abf" placeholder="普通文本5" fieldname="name" data-comp-is="text" data-placeholder="普通文本5"><text class="hidden">${name}</text></span></p><p data-id="7db73bd16aef3fa686a1"><span nodeid="2ed5df2171b11787c09e" placeholder="普通文本6" fieldname="name" data-comp-is="text" data-placeholder="普通文本6"><text class="hidden">${name}</text></span></p><p data-id="8bca669eed645608107e"><span nodeid="a11035760e718c5a3ff3" placeholder="普通文本7" fieldname="name" data-comp-is="text" data-placeholder="普通文本7"><text class="hidden">${name}</text></span></p><p data-id="6dc6277f048703eab075"><span nodeid="f1f4c3710d75f4cf9d25" placeholder="普通文本8" fieldname="name" data-comp-is="text" data-placeholder="普通文本8"><text class="hidden">${name}</text></span></p><p data-id="ccb715ba53fd77ce00ea"><span nodeid="6b61e84782a475d42f75" placeholder="普通文本9" fieldname="name" data-comp-is="text" data-placeholder="普通文本9"><text class="hidden">${name}</text></span></p><p data-id="85c6b78fc00a78537b7d"><span nodeid="afd276ba5bab2f449a34" placeholder="普通文本10" fieldname="name" data-comp-is="text" data-placeholder="普通文本10"><text class="hidden">${name}</text></span></p><p data-id="e5a161ec0041024d2a02"><span nodeid="744f64615d9cca1461bf" placeholder="普通文本11" fieldname="name" data-comp-is="text" data-placeholder="普通文本11"><text class="hidden">${name}</text></span></p><p data-id="66ab3ba5bbbd47b48017"><span nodeid="444217019d0aa55b86a5" placeholder="普通文本12" fieldname="name" data-comp-is="text" data-placeholder="普通文本12"><text class="hidden">${name}</text></span></p><p data-id="49486046f563ffc32daf"><span nodeid="c631a8c034f171796f33" placeholder="普通文本13" fieldname="name" data-comp-is="text" data-placeholder="普通文本13"><text class="hidden">${name}</text></span></p>',
        /** 传递给proseMirror https://prosemirror.net/docs/ref/#view.EditorProps */
        editorProps: {
          // handleDrop(
          //   view: EditorView,
          //   event: DragEvent,
          //   moved: boolean,
          // ) {
          //   return true // 返回 true 表示已处理，阻止默认行为
          // },
        },
      },
      page: {
        showRightSlot: false,
        showBookmark: false,
        watermark: {
          text: '开发环境' + '127.0.0.1',
        },
        tocTabsOptions: [{ label: '参数', value: 'params' }],
      },
      // templates,
      // cdnUrl: 'https://cdn.umodoc.com',
      // shareUrl: 'https://umodoc.com',
      file: {
        allowedMimeTypes: [
          'application/pdf',
          'image/svg+xml',
          'video/mp4',
          'audio/*',
        ],
      },

      /**
       * 富文本内容保存
       * @param content
       */
      async onSave(content) {
        localStorage.setItem('document.content', content?.html)
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const success = true
            if (success) {
              resolve('操作成功')
            } else {
              reject(new Error('操作失败'))
            }
          }, 500)
        })
      },
      /**
       * 文件上传
       * @param file
       */
      async onFileUpload(file: File & { url?: string }) {
        if (!file) {
          throw new Error('没有找到要上传的文件')
        }
        console.log('onUpload', file)
        await new Promise((resolve) => setTimeout(resolve, 3000))

        return {
          id: shortId(),
          url: file.url ?? (await fileToBase64(file)),
          name: file.name,
          type: file.type,
          size: file.size,
        }

        function fileToBase64(file: File) {
          return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result)
            reader.onerror = (error) => reject(error)
          })
        }
      },

      /**
       * 文件删除
       * @param id
       * @param url
       */
      onFileDelete(id: string, url: string) {
        console.log(id, url)
      },

      /** 事件 */
      'onChanged:selection': debounceSelectionChange,
    },
  ),
)

console.log('options', options)

onMounted(() => {
  console.log('editorRef', editorRef)
  // @ts-expect-error
  window.editor = editorRef
  setTimeout(() => (options.page.showRightSlot = true), 500)
})
</script>

<style>
html,
body {
  padding: 0;
  margin: 0;
}
.examples {
  display: flex;
  height: 100vh;
  width: 100%;
}
html,
body {
  height: 100vh;
  overflow: hidden;
}
</style>
