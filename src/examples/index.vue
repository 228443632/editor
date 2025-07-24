<template>
  <div class="examples">
    <div v-if="IS_DEV" class="flex flex-col gap-2 p-4px">
      <t-button @click="testEditorFunc('demo001')" size="small">获取</t-button>
      <t-button @click="testEditorFunc('demo002')" size="small"
        >点击demo002</t-button
      >
      <t-button @click="testEditorFunc('getCurrentFontSize')" size="small"
        >光标字大小</t-button
      >
    </div>
    <umo-editor ref="umoEditorRef" v-bind="options">
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
import { debounce, hasOwn } from 'sf-utils2'

// types
import type { Editor } from '@tiptap/vue-3'
import { template01 } from '@/examples/template/demo01'
import { testEditor } from '@/examples/utils/test'
import { useZIndexManage } from '@/examples/hooks/use-z-index-manage'
// import type { Editor } from '@tiptap/core'
// import { type EditorView } from 'prosemirror-view'
// import type { Node as TNode } from 'prosemirror-model'
// import { Plugin } from 'prosemirror-state'

// {
//   doc: {...} // 顶级文档
//   blockquote: {...} //<blockquote>
//   code_block: {...} //<pre>
//   hard_break: {...} //<br>
//   heading: {...} //<h1>..<h6>
//   horizontal_rule: {...} //<hr>
//   image: {...} //<img>
//   paragraph: {...} //<p>
//   text: {...} //文本
// }
const IS_DEV = process.env.NODE_ENV === 'development'

const umoEditorRef = ref(null)
const editorRef = ref<Editor>()

const nodeList = ref([])
const globalBizState = ref({
  /** 当前选中的node节点 */
  nodeActive: undefined,
})
useZIndexManage(editorRef, { autoCalcInitial: true })

provide('__compNodeList__', nodeList)
provide('__globalBizState__', globalBizState)

function selectionChange({ editor }: { editor: Editor }) {
  const node = editor.state.doc.nodeAt(editor.state.selection.anchor)
  // const node = editor.state.selection.$anchor.parent
  if (
    hasOwn(node?.attrs, 'isShowBubbleMenu') &&
    !node?.attrs.isShowBubbleMenu
  ) {
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
        content: localStorage.getItem('document.content') ?? template01,
        // content: '<p><strong>AB<span style="color: red;">C</span></strong></p>',
        // content: '<p><strong>ABC</strong></p><p>，</p>',
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
        showRightSlot: true,
        showBookmark: false,
        // watermark: {
        //   // text: `开发环境 ${window.location.host}`,
        // },
        tocTabsOptions: [{ label: '参数', value: 'params' }],
      },
      // templates,
      cdnUrl: undefined,
      shareUrl: undefined,
      file: {
        allowedMimeTypes: [],
      },

      /**
       * 富文本内容保存
       * @param content
       */
      async onSave(content: { html: string }) {
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

watch(umoEditorRef, () => {
  editorRef.value = window.editor = umoEditorRef.value.useEditor()
})

console.log('options', options)

const testEditorFunc = testEditor(window.editor)
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
