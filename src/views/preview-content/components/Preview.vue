<!--
 * @Description: pdf预览页面
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 04/09/24 PM12:55
 -->
<!--setup-->
<script setup lang="ts">
import Content from './Content.vue'
import { noop } from 'sf-utils2'
// import paramsCompList from './mock.ts'
import { pageUtils } from '@/views/sign-editor/utils/commons.ts'
import { cssUtil } from '@/views/doc-editor/utils/css-util.ts'
// import { saveAs } from 'file-saver'
import { exportPDFPuppeteer, exportPDFWorker } from '@/views/preview-content/utils/export-pdf.ts'
import type { useSearchPDF } from '@/views/sign-editor/hooks/use-search-pdf.ts'
import { useVuePdfEmbed } from 'vue-pdf-embed'
// import type { IParamsCompItem } from '@/views/sign-editor/types/types.ts'

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

const __paramsCompList__ = inject('__paramsCompList__')
const __keywordsParamsCompList__ = inject('__keywordsParamsCompList__')

const previewContext = ref({
  /** 文件来源 */
  source: props.source,

  doc: shallowRef() as ReturnType<typeof useVuePdfEmbed>['doc'],

  /** 加载 */
  loading: 0,

  /** 关键是否渲染成功 */
  keywordsRenderSuccess: false,

  /** 是否处于打印中*/
  isExporting: false,

  /** 内容是否加载结束 */
  contentInitial: false,

  /** 内容分页数 */
  contentPageNums: 0,

  /** 一次性加载所有pdf页面，主要是为了导出功能*/
  loadAllPdfPagesRaf: noop,

  /** 关键字位置 */
  keywordsPosList: [] as ReturnType<typeof useSearchPDF>['keywordsPosList'],

  /** pdf搜索方法 */
  pdfSearch: undefined as ReturnType<typeof useSearchPDF>['search'],
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

    // domToPng(contentDom, {
    //   type: 'image/png', // 优先用PNG保证文字清晰度
    //   quality: 1, // 高质量参数（PNG接近无损）
    //   scale: 2, // 应用设备像素比缩放
    //   workerNumber: navigator.hardwareConcurrency || 2, // 利用CPU核心数
    //   backgroundColor: '#ffffff',
    //   debug: false, // 生产环境关闭调试
    // }).then((dataUrl) => {
    //   const link = document.createElement('a')
    //   link.download = 'screenshot.png'
    //   link.href = dataUrl
    //   link.click()
    // })

    if (!pagesDomList?.length) throw new Error('未找到导出内容')
    await exportPDFWorker(pagesDomList, filename)
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
  return pageUtils.enhanceCompParams(__paramsCompList__.value as any)
})

/* 计算 */
/**
 * loading 状态
 */
const _loading = computed(() => {
  return (
    previewContext.value.loading > 0 ||
    !previewContext.value.contentInitial ||
    !previewContext.value.keywordsRenderSuccess
  )
})

/* 监听 */

/**
 * 内容初始化完成，回调
 */
watch(
  () => previewContext.value.contentInitial,
  (newVal) => {
    if (newVal && props.model == 'preview') {
      // void onExportPdf()
      window['pagePreviewContent']?.callMounted?.()
    }
  },
)

/* 周期 */
onMounted(() => {
  if (!__keywordsParamsCompList__.value?.length)
    previewContext.value.keywordsRenderSuccess = true
})

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
      loading: _loading,
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
  padding: 12px;
  overflow-y: auto;
  background-color: var(--umo-container-background);
}

.preview-page__inner {
}
</style>
