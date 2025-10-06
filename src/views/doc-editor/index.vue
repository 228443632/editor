<template>
  <div class="doc-editor">
    <!--    <div v-if="IS_DEV" class="flex flex-col gap-2 p-4px max-w-5em">-->
    <!--      <t-button size="small" @click="testEditorFunc('demo001')">获取</t-button>-->
    <!--      <t-button size="small" @click="testEditorFunc('demo002')"-->
    <!--        >点击demo002</t-button-->
    <!--      >-->
    <!--      <t-button size="small" @click="testEditorFunc('getCurrentFontSize')"-->
    <!--        >光标字大小</t-button-->
    <!--      >-->
    <!--      <t-button size="small" @click="testEditorFunc('demo004')"-->
    <!--        >设置属性不在选区</t-button-->
    <!--      >-->
    <!--      <t-button size="small" @click="testEditorFunc('demoInTable')"-->
    <!--        >在表格中</t-button-->
    <!--      >-->
    <!--      <t-button size="small" @click="testEditorFunc('deleteRowInTable')"-->
    <!--        >删除行</t-button-->
    <!--      >-->
    <!--      <t-button size="small" @click="testEditorFunc('wrapTrTable')"-->
    <!--        >手动添加包裹</t-button-->
    <!--      >-->
    <!--      <t-button size="small" @click="testEditorFunc('truncate001')"-->
    <!--        >截取</t-button-->
    <!--      >-->
    <!--    </div>-->
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
        <RightParamsLib :rightTpFields="rightTpFields"></RightParamsLib>
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
import { shallowMergeWithArrayOverride } from '@/views/doc-editor/utils/object-util'

// extension
import extensions from './extensions'
import { debounce, hasOwn } from 'sf-utils2'

// types
import type { Editor } from '@tiptap/vue-3'
import { template01 } from '@/views/doc-editor/template/demo01'
import { testEditor } from '@/views/doc-editor/utils/test'
import { useZIndexManage } from '@/views/doc-editor/hooks/use-z-index-manage'
import { tiptapUtil } from '@/views/doc-editor/utils/tiptap-util'
import { COMP_PARAMS_NAME_MAP } from '@/views/doc-editor/extensions/constant'
import { isInIframe } from '@/views/doc-editor/utils/common-util.ts'
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

const { proxy } = getCurrentInstance()

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
      isPagination: false, // 开启分页
      extensions,
      toolbar: {
        // defaultMode: 'classic',
        // menus: ['base'],
        disableMenuItems: [
          'video',
          'audio',
          'file',
          'code-block',
          'math',
          'tag',
          'columns',
          'callout',
          'bookmark',
          'hard-break',
          'toc',
          'textBox',
          'template',
          'webPage',

          // 工具全部隐藏
          'qrcode',
          'barcode',
          'signature',
          'seal',
          'diagrams',
          'echarts',
          'mermaid',

          // 页面
          'watermark',
          'background',
          'preview',

          // 导出
          'share',
          'embed',
        ],
      },
      document: {
        title: '合同低码平台',
        content: undefined,
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

const rightTpFields = ref([]) // 右侧参数字段

watch(umoEditorRef, () => {
  editorRef.value = window.editor = umoEditorRef.value.useEditor()

  window.requestAnimationFrame(() => {
    // 聚焦override
    const originFocusCommands = editorRef.value.commandManager.rawCommands.focus
    editorRef.value.commandManager.rawCommands.focus = function () {
      const node = tiptapUtil.getSelectionNode(editorRef.value)
      if (COMP_PARAMS_NAME_MAP.compTextDrag === node?.type.name) {
        return () => false
      }
      return () => true
      // return originFocusCommands.call(this, ...arguments)
    }
    editorRef.value.view.dom.focus = () => undefined

    editorRef.value.commands.focus = () => true

    // 初始化成功
    window.dispatchEvent(
      new CustomEvent('editor-ready', { detail: editorRef.value }),
    )

    if (!isInIframe()) {
      rightTpFields.value = [
        {
          label: '文本',
          children: [
            {
              label: '身份证',
              value: 'compText',
            },
          ]
        }
      ]
    }
  })

  // editorRef.value.on('update', ({ editor }) => {
  //   console.log('update', editor)
  // })

  // editorRef.value.on('create', ({ editor }) => {
  //   console.log('create', editor)
  //   const positionList = editor.view.dom.__pageNumPosList as Array
  //
  //
  // })
})

console.log('编辑器【options】', options)
const testEditorFunc = testEditor(window.editor)

window['pageDocEditor'] = {
  editorRef,

  /** 右侧 参数属性*/
  rightTpFields,
}
</script>

<style>
html,
body {
  padding: 0;
  margin: 0;
}
.doc-editor {
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
