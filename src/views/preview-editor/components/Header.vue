<!--
 * @Description: 头部
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 03/10/25 PM8:03
 -->
<!--setup-->
<script setup>
import { sleep } from 'sf-utils2'

const { proxy } = getCurrentInstance()
const props = defineProps({})
const emit = defineEmits([])
import html2pdf from 'html2pdf.js'

/* 状态 */
const isExporting = ref(false)
const __previewContext__ = inject('__previewContext__') // 预览上下文

/* 方法 */

const onExport = async () => {
  try {
    isExporting.value = true
    await __previewContext__.value.loadAllPdfPagesRaf()
    const content = document.querySelector('.pdf-embed__wrap')
    if (!content) throw new Error('未找到导出内容')

    await sleep()

    // // 配置选项
    const opt = {
      margin: 0,
      filename: 'vue-export-example.pdf',
      html2canvas: { scale: window.devicePixelRatio || 1, useCORS: true },
      jsPDF: { format: 'a4', orientation: 'portrait' },
      // 核心：配置pagebreak的mode，加入 'avoid-all'
    }

    // 执行导出
    await html2pdf().set(opt).from(content).save()
    console.log('导出成功')
  } catch (err) {
    console.error('导出失败:', err)
  } finally {
    window.requestIdleCallback(() => {
      isExporting.value = false
    })
  }
}

const onLoadAllPdf = async () => {
  await __previewContext__.value.loadAllPdfPagesRaf()
  console.log('加载结束')
}

/* 计算 */

/* 监听 */

watch(isExporting, () => {
  if (isExporting.value) {
    // __previewContext__.value.loading++
    __previewContext__.value.isExporting = true
  } else {
    // __previewContext__.value.loading--
    __previewContext__.value.isExporting = false
  }
})

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({
  $: proxy.$,
})
</script>

<!--render-->
<template>
  <div class="preview-editor__header">
    <t-button :loading="isExporting" type="primary" @click="onExport"
      >导出pdf</t-button
    >
    <t-button @click="onLoadAllPdf">一次性加载所有</t-button>
  </div>
</template>

<!--style-->
<style scoped lang="less">
.preview-editor__header {
  width: 100%;
  flex: none;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
