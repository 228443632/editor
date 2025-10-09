<script setup lang="ts">
/* eslint-disable */
import umoEditorPureCss from '@/views/doc-editor/style/umo-editor-pure.css?raw'
import { arrayToObj, debounce, template, uniq } from 'sf-utils2'
import { isPlainObject } from '@tiptap/core'

const container = inject('container')
const editor = inject('editor')
const page = inject('page')
const options = inject('options')
const printing = inject('printing')
const exportFile = inject('exportFile')
const getWholeHtml = inject('getWholeHtml')

const iframeRef = ref<HTMLIFrameElement>()
const iframeCode = ref('')
const isShowIframe = ref(false)

/**
 * 获取svg html
 */
function getSvgHtml(ids = []) {
  const svgHtmlDom = Array.from(document.body.children).find(
    (item) =>
      item.id == 'umo-icons' &&
      (item.tagName == 'svg' || item.tagName == 'SVG'),
  )
  if (!svgHtmlDom) return ''

  const idsMap = arrayToObj(ids)
  const svgIds = Array.from(svgHtmlDom.querySelectorAll('symbol'))
    .map((item) => item.id)
    .filter((item) => idsMap[item])
  console.log('svgHtmlDom', svgIds)

  const svgHtmlDomClone = svgHtmlDom.cloneNode(false) as HTMLElement
  svgHtmlDomClone.innerHTML = ''

  Array.from(svgHtmlDom.querySelectorAll('symbol')).forEach((item) => {
    if (idsMap[item.id]) {
      svgHtmlDomClone.insertAdjacentHTML('afterbegin', item.outerHTML)
    }
  })
  console.log('svgHtmlDomClone', svgHtmlDomClone.outerHTML)
  return svgHtmlDomClone?.outerHTML ?? ''
}

/**
 * 获取样式html
 */
function getStylesHtml() {
  return Array.from(document.querySelectorAll('link, style'))
    .map((item) => item.outerHTML)
    .join('')
}

/**
 * 获取所有视频html
 */
function getPlyrSprite() {
  return document.querySelector('#sprite-plyr')?.innerHTML ?? ''
}

/**
 * 获取所有html内容
 */
function getContentHtml() {
  const originalContent =
    document.querySelector(`${container} .umo-page-content`)?.outerHTML ?? ''
  return prepareEchartsForPrint(originalContent)
}

/**
 * 因echart依赖于组件动态展示，打印时效果无法通过html实现，所以通过转成图片方式解决
 * @param htmlContent
 */
function prepareEchartsForPrint(htmlContent: string) {
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

/**
 * 默认lineHeight
 */
const defaultLineHeight = computed(
  () =>
    options.value.dicts?.lineHeights.find(
      (item: { default: any }) => item.default,
    )?.value,
)

/**
 * 获取html代码，用于打印
 * @param fillFieldData
 */
function getPrintPageHtml(fillFieldData = {}) {
  const { orientation, size, margin, background } = page.value

  let body = getContentHtml()
  if (isPlainObject(fillFieldData)) {
    body = template(body, fillFieldData || {}, {
      tmplRE: /\$\{{2}([.\w[\]\s]+)\}{2}/g as any,
    })
  }
  const parser = new DOMParser()
  const doc = parser.parseFromString(body, 'text/html')

  // 1、删除水印
  const watermark = doc.querySelector(
    '.umo-watermark > .umo-page-node-footer+div',
  ) as HTMLHtmlElement
  if (watermark) {
    watermark.remove()
  }
  const umoPageContentDOM = doc.querySelector('.umo-watermark.umo-page-content')
  if (umoPageContentDOM.children) {
    const lastChildDOM = umoPageContentDOM.children[
      umoPageContentDOM.children.length - 1
    ] as HTMLElement
    if (
      lastChildDOM.style.position == 'absolute' &&
      lastChildDOM.style.inset == '0px'
    ) {
      lastChildDOM.remove()
    }
  }

  // watermark2DOM
  // 2、删除页头和页脚
  const corners = doc.querySelectorAll(
    '.umo-page-corner',
  ) as unknown as HTMLHtmlElement[]
  if (corners) {
    corners.forEach((corner) => {
      corner.remove()
    })
  }

  const editorDom = doc.querySelector(
    '.tiptap.ProseMirror.umo-editor',
  ) as HTMLHtmlElement
  if (editorDom) {
    editorDom.setAttribute('contenteditable', 'false')
  }

  // 3、删除图片分隔符
  const imgSepList = Array.from(
    doc.querySelectorAll('img.ProseMirror-separator'),
  ) as unknown as HTMLHtmlElement[]
  if (imgSepList) {
    imgSepList.forEach((imgSep) => {
      imgSep.remove()
    })
    imgSepList.length = 0
  }

  // 4、删除所有不可见字符
  const spanCharacterList = Array.from(
    doc.querySelectorAll('span.Tiptap-invisible-character--paragraph'),
  ) as unknown as HTMLHtmlElement[]
  if (spanCharacterList) {
    spanCharacterList.forEach((item) => {
      item.remove()
    })
    spanCharacterList.length = 0
  }

  // 删除所有换行节点
  // const brBreakList = Array.from(
  //   doc.querySelectorAll('br.ProseMirror-trailingBreak'),
  // )
  // if (brBreakList) {
  //   brBreakList.forEach((item) => {
  //     item.remove()
  //   })
  //   brBreakList.length = 0
  // }

  // 5、是否存在分页，分页处理逻辑
  const isFrontPagination =
    doc.querySelector('div[data-sf-pagination="true"]') ||
    doc.querySelector('.sf-page-first__header[data-page-num]')

  console.log('printScript.toString()', printScript.toString())

  // 6、添加打印脚本
  const scriptListString = [`${printScript.toString()}`]
    .map(
      (scriptString) => `<script>${scriptString}; \n printScript(); <\/script>`,
    )
    .join('\n')

  // 7、获取svg代码
  const svgIds = uniq(
    Array.from(doc.querySelectorAll('svg > use')).map((item) =>
      (item.getAttribute('xlink:href') || '').replace(/^#/, ''),
    ),
  )
  const svgHtml = getSvgHtml(svgIds)
  console.log('svgHtml', svgHtml)

  // 7、添加打印样式
  const styleListString = [
    // ` @media print {
    //   table {
    //     page-break-inside: auto;
    //   }
    //   tr {
    //     page-break-inside: auto !important;
    //   }
    //   thead {
    //     display: table-header-group;
    //   }
    // }
    //
    // @media print {
    //   table, img, svg {
    //     page-break-inside: avoid;
    //   }
    //
    //   h1, h2 {
    //     page-break-after: avoid;
    //   }
    // }`
  ]
    .filter(Boolean)
    .join('\n')

  // 8、移除注释节点
  const walker = document.createTreeWalker(
    doc.documentElement,
    NodeFilter.SHOW_COMMENT,
    null,
  )

  let currentNode: HTMLHtmlElement
  // 遍历所有文本节点
  // @ts-expect-error
  while ((currentNode = walker.nextNode())) {
    if (currentNode.nodeType == Node.COMMENT_NODE) {
      currentNode.remove()
    }
  }

  return `
    <!DOCTYPE html>
    <html lang="zh-CN" theme-mode="${options.value.theme}" mode="print">
    <head>
      <title></title>
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
          ${isFrontPagination ? '' : `padding: ${margin?.top}cm 0 ${margin?.bottom}cm;`}
          margin: 0;
        }
        @page:first {
          padding-top: 0;
        }
        @page:last {
          padding-bottom: 0;
          page-break-after: avoid;
        }
        ${styleListString}
      </style>
      <style>
        span text.hidden {
          display: inline;
        }
        .no-print {
          display: none;
        }
      </style>
    </head>
    <body class="is-print preview">
      ${svgHtml}
      <div id="sprite-plyr" style="display: none;">${getPlyrSprite()}</div>
      <div class="umo-editor-container" style="line-height: ${defaultLineHeight.value};" aria-expanded="false">
        <div class="tiptap umo-editor" translate="no" style="display: flex; flex-direction: column; align-items: center">
          ${doc.body.innerHTML}
        </div>
      </div>
      ${scriptListString}
    </body>
    </html>
   `
}

/**
 * 打印脚本
 */
function printScript() {
  repairTable()

  /**
   * 修复table 表格
   */
  function repairTable() {
    const tableDOMAll = document.querySelectorAll('table')

    tableDOMAll.forEach((tableDOM) => {
      const tableId = tableDOM.getAttribute('tableid')
      const colgroupDOMList = tableDOM.querySelectorAll(
        `colgroup[tableid='${tableId}']`,
      )
      const templateColgroupDOM = colgroupDOMList[0]

      // 删除无用的colgroup
      colgroupDOMList.forEach((colgroupDOM, colgroupDOMIndex) => {
        if (colgroupDOMIndex > 0) {
          colgroupDOM.remove()
        }
      })

      // tr DOM 集合
      const trDOMList = tableDOM.querySelectorAll(`tr[tableid='${tableId}']`)

      // 表格中直接子节点
      const tableChildren = Array.from(tableDOM.children)

      const willAppendChildren = [] // 将要添加到table子节点dom

      tableChildren.forEach((tableChildDOM) => {
        if (tableChildDOM.tagName === 'TBODY') {
          const tbodyChildrenDOM = Array.from(tableChildDOM.children) // tbody 元素直接子节点
          if (tbodyChildrenDOM.length > 1) {
            // 说明是合并的
            const tableRowGroupMergeDOM = document.createElement('section')
            tableRowGroupMergeDOM.classList.add('table-row-group-merge')

            const tableRowGroupDOM = document.createElement('section')
            tableRowGroupDOM.classList.add('table-row-group')

            tableRowGroupMergeDOM.append(tableRowGroupDOM)

            tbodyChildrenDOM.forEach((trDOM) => {
              tableRowGroupDOM.append(trDOM)
            })

            willAppendChildren.push(tableRowGroupMergeDOM)
          } else {
            const tableRowGroupDOM = document.createElement('section')
            tableRowGroupDOM.classList.add('table-row-group')
            tbodyChildrenDOM.forEach((trDOM) => {
              tableRowGroupDOM.append(trDOM)
            })
            willAppendChildren.push(tableRowGroupDOM)
          }
        }
        // 移除直接子节点
        tableChildDOM.remove()
      })

      // tr容器
      const tbodyWrapDOM = document.createElement('tbody')
      tbodyWrapDOM.classList.add('table-wrapper-tbody')
      tbodyWrapDOM.append(...willAppendChildren)

      tableDOM.append(templateColgroupDOM, tbodyWrapDOM)
    })

    // 清除表格直接子节点
    const tableWrapperList = document.querySelectorAll(
      '.tableWrapper.table-wrapper',
    )
    console.log('tableWrapperList', tableWrapperList)

    tableWrapperList.forEach((tableWrapperDOM) => {
      const children = Array.from(tableWrapperDOM.children)
      children.forEach((childItemDOM) => {
        if (childItemDOM.tagName !== 'TABLE') {
          childItemDOM.remove()
        }
      })
    })
  }
}

/**
 * 获取打印代码
 * @param fillFieldData
 */
const printPage = async (fillFieldData = {}) => {
  editor.value?.commands.blur()
  await nextTick()
  iframeCode.value = getPrintPageHtml(fillFieldData)
  isShowIframe.value = true
  await nextTick()
  iframeRef.value.onload = () => {
    window.requestAnimationFrame(() => {
      iframeRef.value.contentWindow?.print()
      isShowIframe.value = false

      setTimeout(() => {
        printing.value = false
        exportFile.value.pdf = false
      }, 300)
    })
  }
}
const debouncePrintPage = debounce(printPage)

/**
 * 获取整个代码
 */
getWholeHtml.value = getPrintPageHtml

watch(
  () => [printing.value, exportFile.value.pdf],
  (value: [boolean, boolean]) => {
    if (value[0] || value[1]) {
      debouncePrintPage()
    }
  },
)

defineExpose({
  /**
   * 打印页
   */
  printPage,

  /**
   * 获取
   */
  getPrintPageHtml,
})
</script>

<template>
  <iframe
    v-if="isShowIframe"
    ref="iframeRef"
    class="umo-print-iframe"
    :srcdoc="iframeCode"
  />
</template>

<style lang="less" scoped>
.umo-print-iframe {
  position: absolute;
  width: 0;
  height: 0;
  border: none;
  overflow: auto;
}
</style>
