<!--
 * @Description: pdf预览页面
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 04/09/24 PM12:55
 -->
<!--setup-->
<script setup lang="ts">
import Content from './components/Content.vue'
import { noop, sleep } from 'sf-utils2'
import paramsCompList from './components/mock.ts'
import { pageUtils } from '@/views/preview-editor/utils/commons.ts'

const props = defineProps({})
const emit = defineEmits({})

/* 状态 */
const rootRef = ref<HTMLElement>()
const contentRef = ref<InstanceType<typeof Content>>()
const previewContext = ref({
  /** 文件来源 */
  source: './2.pdf',

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
const onExportPdf = async () => {
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
      filename: 'vue-export-example.pdf',
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
  } catch (err) {
    console.error('导出失败:', err)
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
      void onExportPdf()
    }
  },
)

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({})

// 注入
provide('__previewContext__', previewContext)
</script>

<!--render-->
<template>
  <div
    ref="rootRef"
    :class="[
      'preview-page umo-scrollbar',
      previewContext.isExporting ? 'is-exporting' : '',
    ]"
    v-spin.fullscreen="{
      loading: previewContext.loading > 0 || !previewContext.contentInitial,
      size: 'small',
      showLoadingText: false,
      mask: true,
    }"
  >
    <div class="flex-none">
      <t-button @click="onExportPdf">导出</t-button>
    </div>
    <!-- 内容区 -->
    <Content
      :source="previewContext.source"
      :params-comp-list="_paramsCompList"
      ref="contentRef"
    ></Content>

    <t-back-top
      :visible-height="800"
      :container="() => rootRef"
      size="small"
      :offset="['300px', '48px']"
    />
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
</style>
