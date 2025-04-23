<template>
  <div class="examples">
    <div class="box">
      <umo-editor ref="editorRef" v-bind="options">

        <!-- 基础工具   -->
        <template #toolbar_base>
          <ParamsLib></ParamsLib>
        </template>

        <!--  TOC 内容  -->
        <template #toc-content-params>
          <TocContentParams></TocContentParams>
        </template>

        <!--  内容右侧  -->
        <template #container-page-right>
          <RightParamsLib></RightParamsLib>
        </template>
      </umo-editor>
    </div>
    <!-- <div class="box">
      <umo-editor editor-key="testaaa" :toolbar="{ defaultMode: 'classic' }" />
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { shortId } from '@/utils/short-id'
import ParamsLib from './toolbar/base/ParamsLib.vue'
import RightParamsLib from './components/RightParamsLib.vue'
import TocContentParams from './components/TocContentParams.vue'

import { defaultOptions } from './utils/default-options'
import { shallowMergeWithArrayOverride } from '@/examples/utils/object-util'

// extension
import extensions from './extensions'

const editorRef = $ref(null)
const templates = [
  {
    title: '工作任务',
    description: '工作任务模板',
    content:
      '<h1>工作任务</h1><h3>任务名称：</h3><p>[任务的简短描述]</p><h3>负责人：</h3><p>[执行任务的个人姓名]</p><h3>截止日期：</h3><p>[任务需要完成的日期]</p><h3>任务详情：</h3><ol><li>[任务步骤1]</li><li>[任务步骤2]</li><li>[任务步骤3]...</li></ol><h3>目标：</h3><p>[任务需要达成的具体目标或结果]</p><h3>备注：</h3><p>[任何额外信息或注意事项]</p>',
  },
  {
    title: '工作周报',
    description: '工作周报模板',
    content:
      '<h1>工作周报</h1><h2>本周工作总结</h2><hr /><h3>已完成工作：</h3><ul><li>[任务1名称]：[简要描述任务内容及完成情况]</li><li>[任务2名称]：[简要描述任务内容及完成情况]</li><li>...</li></ul><h3>进行中工作：</h3><ul><li>[任务1名称]：[简要描述任务当前进度和下一步计划]</li><li>[任务2名称]：[简要描述任务当前进度和下一步计划]</li><li>...</li></ul><h3>问题与挑战：</h3><ul><li>[问题1]：[描述遇到的问题及当前解决方案或需要的支持]</li><li>[问题2]：[描述遇到的问题及当前解决方案或需要的支持]</li><li>...</li></ul><hr /><h2>下周工作计划</h2><h3>计划开展工作：</h3><ul><li>[任务1名称]：[简要描述下周计划开始的任务内容]</li><li>[任务2名称]：[简要描述下周计划开始的任务内容]</li><li>...</li></ul><h3>需要支持与资源：</h3><ul><li>[资源1]：[描述需要的资源或支持]</li><li>[资源2]：[描述需要的资源或支持]</li><li>...</li></ul>',
  },
]

const nodeList = ref([])
provide('__compNodeList__', nodeList)

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
        title: '测试文档',
        content: localStorage.getItem('document.content') ?? '<p>测试文档</p>',
        // content: '<p>2234243测试文档</p>',
      },
      page: {
        showRightSlot: true,
        showBookmark: false,
        watermark: {
          text: '开发环境' + '127.0.0.1',
        },
        tocTabsOptions: [
          {label: '参数', value: 'params'}
        ]
      },
      templates,
      cdnUrl: 'https://cdn.umodoc.com',
      shareUrl: 'https://umodoc.com',
      file: {
        // allowedMimeTypes: [
        //   'application/pdf',
        //   'image/svg+xml',
        //   'video/mp4',
        //   'audio/*',
        // ],
      },
      async onSave(
        content: string,
        page: number,
        document: { content: string },
      ) {
        localStorage.setItem('document.content', document.content)
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const success = true
            if (success) {
              console.log('onSave', { content, page, document })
              resolve('操作成功')
            } else {
              reject(new Error('操作失败'))
            }
          }, 1000)
        })
      },
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
      onFileDelete(id: string, url: string) {
        console.log(id, url)
      },
    },
  ),
)

console.log('options', options)

onMounted(() => {
  console.log('editorRef', editorRef)
  window.editor = editorRef
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
}
.box {
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 100%;
}

html,
body {
  height: 100vh;
  overflow: hidden;
}
</style>
