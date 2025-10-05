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
    if (!contentDom) throw new Error('未找到导出内容')

    const { default: html2pdf } = await import('html2pdf.js')

    // 配置选项
    const opt = {
      margin: 0,
      filename: filename || `${dayjs().format('YYYY_MM_DD_HH_mm_ss')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: window.devicePixelRatio || 1,
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] },
      // 核心：配置pagebreak的mode，加入 'avoid-all'
    }

    // 执行导出
    await html2pdf()
      // @ts-expect-error
      .set(opt)
      .from(contentDom)
      .save()

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
onMounted(() => {
  // 初始化成功
  window.dispatchEvent(new CustomEvent('editor-ready'))
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
