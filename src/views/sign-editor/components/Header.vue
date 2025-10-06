<!--
 * @Description: 头部
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 03/10/25 PM8:03
 -->
<!--setup-->
<script setup>
import { exportPDFWorker } from '@/views/preview-content/utils/export-pdf'

const { proxy } = getCurrentInstance()
const props = defineProps({})
const emit = defineEmits([])

/* 状态 */
const isExporting = ref(false)
const __signContext__ = inject('__signContext__') // 预览上下文

/* 方法 */

const onExport = async () => {
  try {
    isExporting.value = true
    await __signContext__.value.loadAllPdfPagesRaf()
    const contentDom = unrefElement(__signContext__.value.embedPdfWrapRef)
    const pagesDomList = Array.from(
      contentDom.querySelectorAll('.pdf-embed__item'),
    )
    await exportPDFWorker(pagesDomList)
    console.log('导出成功')
    useMessage('success', { content: '导出成功' })
  } catch (err) {
    console.error('导出失败:', err)
    useMessage('error', { content: '导出失败' })
  } finally {
    window.requestIdleCallback(() => {
      isExporting.value = false
    })
  }
}

const onLoadAllPdf = async () => {
  await __signContext__.value.loadAllPdfPagesRaf()
  console.log('加载结束')
}

/* 计算 */

/* 监听 */

watch(isExporting, () => {
  if (isExporting.value) {
    __signContext__.value.loading++
    __signContext__.value.isExporting = true
  } else {
    __signContext__.value.loading--
    __signContext__.value.isExporting = false
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
  <div class="sign-editor__header">
    <t-button :loading="isExporting" type="button" @click="onExport"
      >导出pdf</t-button
    >
    <t-button @click="onLoadAllPdf">一次性加载所有</t-button>
  </div>
</template>

<!--style-->
<style scoped lang="less">
.sign-editor__header {
  width: 100%;
  flex: none;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
