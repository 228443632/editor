<template>
  <iframe ref="iframeRef" class="umo-print-iframe" :srcdoc="iframeCode" />
</template>

<script setup lang="ts">
/* eslint-disable */
import umoEditorPureCss from '@/examples/style/umo-editor-pure.css?raw'

const container = inject('container')
const editor = inject('editor')
const printing = inject('printing')
const exportFile = inject('exportFile')
const page = inject('page')
const options = inject('options')

import { template } from 'sf-utils2'

const iframeRef = $ref<HTMLIFrameElement | null>(null)
let iframeCode = $ref('')
const getStylesHtml = () => {
  return Array.from(document.querySelectorAll('link, style'))
    .map((item) => item.outerHTML)
    .join('')
}

const getPlyrSprite = () => {
  return document.querySelector('#sprite-plyr')?.innerHTML ?? ''
}

const getContentHtml = () => {
  const originalContent =
    document.querySelector(`${container} .umo-page-content`)?.outerHTML ?? ''
  return prepareEchartsForPrint(originalContent)
}
// 因echart依赖于组件动态展示，打印时效果无法通过html实现，所以通过转成图片方式解决
const prepareEchartsForPrint = (htmlContent: any) => {
  // 创建一个临时DOM容器用于处理HTML内容
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlContent

  // 找到所有需要转换的ECharts实例
  const charts = tempDiv.querySelectorAll('.umo-node-echarts-body')
  for (const chartElement of charts) {
    const chartInstance = echarts.getInstanceByDom(chartElement)
    if (chartInstance) {
      // 使用getDataURL方法获取图表的base64图片数据
      const imgData = chartInstance.getDataURL({
        type: 'png', // 可以是'png'或'jpeg'
        pixelRatio: 2, // 提高分辨率，默认是1//分辨率太高会慢
        backgroundColor: '#fff', // 背景颜色，默认是透明
      })

      // 创建一个新的img元素并设置其src属性为图表的base64图片数据
      const imgElement = document.createElement('img')
      imgElement.src = imgData
      imgElement.style.width = '100%' // 确保图片宽度适合容器，根据实际情况调整

      // 替换原图表元素为img元素
      chartElement?.parentNode?.replaceChild(imgElement, chartElement)
    }
  }
  return tempDiv.innerHTML
}

const defaultLineHeight = $computed(
  () =>
    options.value.dicts?.lineHeights.find(
      (item: { default: any }) => item.default,
    )?.value,
)

const getIframeCode = (fillFieldData = {}) => {
  const { orientation, size, margin, background } = page.value

  // const fragment = document.createDocumentFragment()
  // fragment.append(getContentHtml())

  let body = getContentHtml()
  body = template(body, fillFieldData || {}, {
    tmplRE: /\$\{{2}([.\w[\]\s]+)\}{2}/g as any,
  })
  const parser = new DOMParser()
  const doc = parser.parseFromString(body, 'text/html')

  // const editorDom = doc.querySelector(
  //   '.tiptap.ProseMirror.umo-editor',
  // ) as HTMLHtmlElement

  // editor.value.getHTML()

  return `
    <!DOCTYPE html>
    <html lang="zh-CN" theme-mode="${options.value.theme}" mode="print">
    <head>
      <title>${options.value.document?.title}</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${umoEditorPureCss}</style>
      <style>
      html{
        margin: 0;
        padding: 0;
        overflow: visible;
      }
      body{
        margin: 0;
        padding: 0;
        background-color: ${background};
        -webkit-print-color-adjust: exact;
      }
      .umo-page-content{
        transform: scale(1) !important;
        overflow: hidden;
      }
      @page {
        size: ${orientation === 'portrait' ? size?.width : size?.height}cm ${orientation === 'portrait' ? size?.height : size?.width}cm;
        padding: ${margin?.top}cm 0 ${margin?.bottom}cm;
        margin: 0;
      }
      @page:first {
        padding-top: 0;
      }
      @page:last {
        padding-bottom: 0;
        page-break-after: avoid;
      }
      @media print {
        table {
          page-break-inside: auto;
        }
        tr {
          page-break-inside: auto !important;
        }
        thead {
          display: table-header-group;
        }
      </style>
      <style>
        span text.hidden {
          display: inline;
        }
      </style>
    </head>
    <body class="is-print preview">
      <div id="sprite-plyr" style="display: none;">
      ${getPlyrSprite()}
      </div>
      <div class="umo-editor-container" style="line-height: ${defaultLineHeight};" aria-expanded="false">
        <div class="tiptap umo-editor" translate="no" style="display: flex; flex-direction: column; align-items: center">
          ${doc.body.innerHTML}
        </div>
      </div>
      <script>
        document.addEventListener("DOMContentLoaded", (event) => {
          const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
              if (mutation.removedNodes) {
                Array.from(mutation.removedNodes).forEach(node => {
                  if (node?.classList?.contains('umo-page-watermark')) {
                    location.reload();
                  }
                });
              }
            });
          });
        });
      <\/script>
    </body>
    </html>`
  /* eslint-enable */
}

const printPage = (fillFieldData = {}) => {
  editor.value?.commands.blur()
  iframeCode = getIframeCode(fillFieldData)

  const dialog = useConfirm({
    attach: container,
    theme: 'info',
    header: printing.value ? t('print.title') : t('export.pdf.title'),
    body: printing.value ? t('print.message') : t('export.pdf.message'),
    confirmBtn: printing.value ? t('print.confirm') : t('export.pdf.confirm'),
    onConfirm() {
      dialog.destroy()
      setTimeout(() => {
        console.log(
          'debug-172',
          iframeRef.contentWindow.document.documentElement.outerHTML,
        )
        iframeRef?.contentWindow?.print()
      }, 300)
    },
    onClosed() {
      printing.value = false
      exportFile.value.pdf = false
    },
  })
}

defineExpose({
  printPage,
  getIframeCode,
})
</script>

<style lang="less" scoped>
.umo-print-iframe {
  position: absolute;
  width: 0;
  height: 0;
  border: none;
  overflow: auto;
}
</style>
