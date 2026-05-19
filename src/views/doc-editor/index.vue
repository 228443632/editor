<!--
 * @Description: 编辑器
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 04/09/24 PM12:55
 -->
<!--setup-->
<script setup lang="ts">
import { shortId } from '@/utils/short-id'
import ParamsLib from './toolbar/base/ParamsLib.vue'
import RightParamsLib from './components/RightParamsLib.vue'
import LeftParamsToc from './components/LeftParamsToc.vue'
import { defaultOptions } from './utils/default-options'
import { shallowMergeWithArrayOverride } from '@/views/doc-editor/utils/object-util'
import extensions from './extensions'
import { debounce, hasOwn, to, deepMerge, parseJsonNoError } from 'sf-utils2'
import type { Editor } from '@tiptap/vue-3'
import { testEditor } from '@/views/doc-editor/utils/test'
import { useZIndexManage } from '@/views/doc-editor/hooks/use-z-index-manage'
import { tiptapUtil } from '@/views/doc-editor/utils/tiptap-util'
import { COMP_PARAMS_NAME_MAP } from '@/views/doc-editor/extensions/constant'
import { isInIframe } from '@/views/doc-editor/utils/common-util.ts'
import Print from '@/components/container/print.vue'
import { blobToBase64, fileToBase64 } from 'file64'
import profile from '@/profile'
import template01 from './template/template01.html?raw'
// import { imgMap, loadImgToBase64 } from '@/views/doc-editor/extensions/node/comp-text/utils.ts'

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

const umoEditorRef = ref(null)
const editorRef = ref<Editor>()
const rightParamsLibRef = ref<InstanceType<typeof RightParamsLib>>()
const printRef = ref<InstanceType<typeof Print>>()

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
    deepMerge(
      {
        isPagination: false, // 开启分页
        extensions,
        toolbar: {
          defaultMode: 'ribbon',
          menus: ['base', 'table'],
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

            // 插入
            'video',
            'chineseDate',
            'emoji',
            'hr',

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
            'pageBreakSymbol',

            // 导出
            'share',
            'embed',
          ],
        },
        document: {
          title: '合同低码平台',
          content: profile.IS_DEV ? template01 : undefined,
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
         * 富文本内容保存之前
         * @param content
         */
        async onBeforeSave(content: { html: string }) {
          const callOnSave = window['pageDocEditor']?.callOnSave
          if (callOnSave) {
            await callOnSave(content?.html)
          }
          // localStorage.setItem('document.content', content?.html)
          // return new Promise((resolve, reject) => {
          //   setTimeout(() => {
          //     const success = true
          //     if (success) {
          //       resolve('操作成功')
          //     } else {
          //       reject(new Error('操作失败'))
          //     }
          //   }, 500)
          // })
          return false
        },

        /**
         * 文件上传
         * @param file
         */
        async onFileUpload(file: File & { url?: string }) {
          if (!file) {
            // useMessage('error', { content: '没有找到要上传的文件' })
            throw new Error('没有找到要上传的文件')
          }

          // //     const blob = await getHttpBlob(node.attrs.src)
          console.log('onUpload', file)

          let fileUrl = undefined
          if (file.url) {
            // 发起GET请求（fetch默认是GET方法）
            const [response, err] = (await to(fetch(file.url))) as unknown as [
              Response,
              Error,
            ]
            // 检查请求是否成功（状态码200-299）
            if (!response?.ok || err) {
              // useMessage('error', { content: '图片转化失败，请手动上传图片' })
              throw new Error(`图片转化失败，请手动上传图片`)
            }
            // 将响应体转换为ArrayBuffer
            const arrayBuffer = await response.arrayBuffer()
            const blob = new Blob([arrayBuffer], { type: file.type })
            fileUrl = await blobToBase64(blob)
          }

          return {
            id: shortId(),
            url: fileUrl ?? (await fileToBase64(file)),
            name: file.name,
            type: file.type,
            size: file.size,
          }

          // function fileToBase64(file: File) {
          //   return new Promise((resolve, reject) => {
          //     const reader = new FileReader()
          //     reader.readAsDataURL(file)
          //     reader.onload = () => resolve(reader.result)
          //     reader.onerror = (error) => reject(error)
          //   })
          // }
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
      /**
       * 编辑器属性
       */
      window['pageDocEditor']?.editorOptions || {},
    ),
  ),
)

const rightTpFields = ref([]) // 右侧参数字段

watch(umoEditorRef, () => {
  editorRef.value = window.editor = umoEditorRef.value.useEditor()

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

  // const originIsActive = editorRef.value.isActive
  // const activeNamePropertiesMap = {
  //   bold: (node: ProseMirrorNode) => node.attrs.cssText?.fontWeight == 'bold',
  //   italic: (node: ProseMirrorNode) =>
  //     node.attrs.cssText?.fontStyle == 'italic',
  //   strike: (node: ProseMirrorNode) =>
  //     node.attrs.cssText?.textDecoration == 'line-through',
  //   underline: (node: ProseMirrorNode) =>
  //     node.attrs.cssText?.textDecoration == 'underline',
  // }
  // 重写 isActive 方法
  // editorRef.value.isActive = function (...args) {
  //   const [activeName] = args
  //   const { selection } = editorRef.value.state || {}
  //
  //   let node: ProseMirrorNode
  //
  //   // 1. 检查是否为节点选区（如点击选中图片节点）
  //   if (selection instanceof NodeSelection) {
  //     node = selection.node
  //   } else {
  //     const $pos = editorRef.value.$pos(selection.from + 1)
  //     if ($pos?.node) node = $pos.node
  //     console.log('$pos.node', $pos.node?.type?.name)
  //   }
  //   if (node && node?.type?.name == COMP_PARAMS_NAME_MAP.compText) {
  //     const activeNameFunc = activeNamePropertiesMap[activeName]
  //     if (activeNameFunc) return activeNameFunc(node)
  //   }
  //   return originIsActive.apply(this, args)
  // }

  if (!isInIframe()) {
    window.requestAnimationFrame(async () => {
      const targetUrl = '/lowcode-tp-editor/template/division-order-tp.scheme.txt'
      const [res] = await to(fetch(targetUrl))
      if (res.ok) {
        const content = await res.text()
        editorRef.value?.chain().setContent(content, true).focus().run()
      }
    })

    rightTpFields.value = [
      {
        label: '文本',
        children: [
          {
            label: '应支付乙方的委托服务报酬',
            value: 'compText',
            attrs: {
              serverRenderComp: 'orderPartyBServicePayable',
              fieldName: 'cf_commission_plan.orderPartyBServicePayable',
            },
          },
          {
            label: '标的债权',
            value: 'compText',
            attrs: {
              serverRenderComp: 'orderSubjectClaim',
              fieldName: 'cf_outsourcing_batch.orderSubjectClaim',
            },
          },
          {
            label: '留案债权',
            value: 'compText',
            attrs: {
              serverRenderComp: 'orderRetentionClaim',
              fieldName: 'cf_outsourcing_batch.orderRetentionClaim',
            },
          },
          ...Array.from({ length: 2 }).map((_, index) => ({
            label: `身份证${index}`,
            value: 'compText',
          })),
        ],
      },
    ]
  }

  // 初始化成功
  setTimeout(() => {
    window.dispatchEvent(
      new CustomEvent('editor-ready', { detail: editorRef.value }),
    )
  })

  // editorRef.value.on('update', ({ editor }) => {
  //   console.log('update', editor)
  // })

  // editorRef.value.on('create', ({ editor }) => {
  //   console.log('create', editor)
  //   const positionList = editor.view.dom.__pageNumPosList as Array
  // })
})

console.log('编辑器【options】', options)
const testEditorFunc = testEditor(window.editor)

// 加载图片
// loadImgToBase64()

window['pageDocEditor'] = {
  editorRef,

  /** 右侧 参数属性*/
  rightTpFields,

  /** 打印实例 */
  printRef,

  /** 右侧模版字段库组件实例 */
  rightParamsLibRef,

  /** 选项*/
  options,
}

provide('__printRef__', printRef)
</script>

<!-- render -->
<template>
  <div class="doc-editor">
    <div
      v-if="false && profile.IS_DEV"
      class="flex flex-col gap-2 p-4px max-w-5em"
    >
      <t-button size="small" @click="testEditorFunc('demo001')">获取</t-button>
      <t-button size="small" @click="testEditorFunc('demo002')"
        >点击demo002</t-button
      >
      <t-button size="small" @click="testEditorFunc('getCurrentFontSize')"
        >光标字大小</t-button
      >
      <t-button size="small" @click="testEditorFunc('demo004')"
        >设置属性不在选区</t-button
      >
      <t-button size="small" @click="testEditorFunc('demoInTable')"
        >在表格中</t-button
      >
      <t-button size="small" @click="testEditorFunc('deleteRowInTable')"
        >删除行</t-button
      >
      <t-button size="small" @click="testEditorFunc('wrapTrTable')"
        >手动添加包裹</t-button
      >
      <t-button size="small" @click="testEditorFunc('truncate001')"
        >截取</t-button
      >
    </div>
    <umo-editor ref="umoEditorRef" v-bind="options">
      <template #hidden>
        <Print ref="printRef"></Print>
      </template>

      <!-- 基础工具   -->
      <template #toolbar_base>
        <ParamsLib></ParamsLib>
      </template>

      <!--  TOC 内容  -->
      <template #toc-content-params>
        <LeftParamsToc></LeftParamsToc>
      </template>

      <!--  内容右侧  -->
      <template #container-page-right>
        <RightParamsLib
          ref="rightParamsLibRef"
          :right-tp-fields="rightTpFields"
        ></RightParamsLib>
      </template>
    </umo-editor>
  </div>
</template>

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
