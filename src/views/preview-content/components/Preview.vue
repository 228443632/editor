<!--
 * @Description: pdf预览页面
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 04/09/24 PM12:55
 -->
<!--setup-->
<script setup lang="ts">
import Content from './Content.vue'
import { noop } from 'sf-utils2'
import paramsCompList from './mock.ts'
import { pageUtils } from '@/views/sign-editor/utils/commons.ts'
import dayjs from 'dayjs'
import { jsPDF } from 'jspdf'
import domtoimage from 'dom-to-image-more'
import { cssUtil } from '@/views/doc-editor/utils/css-util.ts'
// import { saveAs } from 'file-saver'
import modernScreenshot from 'modern-screenshot'

console.log('domtoimage', domtoimage)

const props = defineProps({
  /**
   * 模式
   */
  model: {
    type: String as PropType<'preview' | 'download'>,
    default: 'preview',
  },

  /**
   * 原始pdf文件
   */
  source: {
    type: String,
    default: () => '',
  },
})
const emit = defineEmits({})

/* 状态 */
const rootRef = ref<HTMLElement>()
const contentRef = ref<InstanceType<typeof Content>>()
console.log('props.source', props.source)
const previewContext = ref({
  /** 文件来源 */
  source: props.source,

  /** 加载 */
  loading: 0,

  /** 是否处于打印中*/
  isExporting: false,

  /** 内容是否加载结束 */
  contentInitial: false,

  /** 内容分页数 */
  contentPageNums: 0,

  /** 一次性加载所有pdf页面，主要是为了导出功能*/
  loadAllPdfPagesRaf: noop,
})
const a4 = cssUtil.getPaperSize('A4')

/* 方法 */

/**
 * 导出pdf
 */
const exportPdf = async (filename?: string) => {
  try {
    if (!previewContext.value.contentInitial) return
    if (previewContext.value.loading > 0) return
    previewContext.value.loading++
    previewContext.value.isExporting = true

    await previewContext.value.loadAllPdfPagesRaf()
    const contentDom = unrefElement(contentRef)
    const pagesDomList = Array.from(
      contentDom.querySelectorAll('.pdf-embed__item'),
    ) as HTMLElement[]
    if (!pagesDomList?.length) throw new Error('未找到导出内容')

    // 配置A4尺寸参数
    const a4Width = 210 // A4宽度(mm)
    const a4Height = 297 // A4高度(mm)
    const margin = 0 // 页边距(mm)
    const pdf = new jsPDF('p', 'mm', 'a4')

    const scale = window.devicePixelRatio * 2

    // 2. 循环处理每个页面，单独生成图片并添加到PDF
    for (let i = 0; i < pagesDomList.length; i++) {
      const pageDom = pagesDomList[i]
      // 确保当前页元素可见（避免隐藏元素渲染异常）
      pageDom.style.width = `${a4Width - margin * 2}mm` // 匹配A4宽度

      // 3. 为当前页生成高清图片（单独渲染）
      const dataUrl = await modernScreenshot.domToPng(pageDom, {
        type: 'image/png', // 优先用PNG保证文字清晰度
        quality: 0.95, // 高质量参数（PNG接近无损）
        scale, // 应用设备像素比缩放
        backgroundColor: '#ffffff',
        workerNumber: 2, // 多线程加速渲染
        debug: false, // 生产环境关闭调试
      })

      // 4. 计算当前页尺寸映射（px → mm）
      const contentWidth = pageDom.offsetWidth // 当前页宽度(px)
      const contentHeight = pageDom.offsetHeight // 当前页高度(px)
      const scaledWidth = contentWidth * scale // 缩放后宽度(px)
      const scaleToPdf = (a4Width - margin * 2) / scaledWidth // px转mm系数
      const pageHeightMm = contentHeight * scale * scaleToPdf // 当前页高度(mm)

      // 5. 添加新页面（第一页无需添加）
      if (i > 0) pdf.addPage()

      // 6. 精准添加当前页到PDF（位置居中对齐）
      pdf.addImage(
        dataUrl,
        'PNG', // 明确指定格式
        margin, // x坐标（左对齐，留边距）
        margin, // y坐标（上对齐，留边距）
        a4Width - margin * 2, // 宽度严格匹配A4
        pageHeightMm, // 高度自适应当前页内容
        undefined,
        'FAST', // 快速渲染模式（保证质量的同时提升速度）
      )
    }
    pdf.save(filename || `${dayjs().format('YYYYMMDDHHmmss')}.png`)

    console.log('导出成功')
    useMessage('success', { content: '导出成功' })
  } catch (err) {
    console.error('导出失败:', err)
    useMessage('error', { content: '导出失败' })
  } finally {
    window.requestIdleCallback(() => {
      previewContext.value.loading--
      previewContext.value.isExporting = false
    })
  }
}

/**
 * 获取参数组件列表
 */
const _paramsCompList = computed(() => {
  return pageUtils.expandCompParams(paramsCompList as any)
})

/* 计算 */

/* 监听 */

watch(
  () => previewContext.value.contentInitial,
  (newVal) => {
    if (newVal) {
      // void onExportPdf()
    }
  },
)

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({
  exportPdf,

  previewContext,
})

// 注入
provide('__previewContext__', previewContext)

provide('__previewContext__', previewContext)
</script>

<!--render-->
<template>
  <div
    ref="rootRef"
    v-spin.fullscreen="{
      loading: previewContext.loading > 0 || !previewContext.contentInitial,
      size: 'small',
      showLoadingText: false,
      mask: true,
    }"
    :class="[
      'preview-page umo-scrollbar',
      previewContext.isExporting ? 'is-exporting' : '',
    ]"
  >
    <div class="preview-page__inner">
      <!-- 内容区 -->
      <Content
        ref="contentRef"
        :source="previewContext.source"
        :params-comp-list="_paramsCompList"
        :model="model"
      ></Content>

      <t-back-top
        :visible-height="800"
        :container="() => rootRef"
        size="small"
        :offset="['48px', '48px']"
      />
    </div>
  </div>
</template>

<!--style-->
<style scoped lang="less">
.preview-page {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  margin: 0 auto;
  padding: 16px 0;
  overflow-y: auto;
  background-color: var(--umo-container-background);
}

.preview-page__inner {
}
</style>
