<!--
 * @Description: pdf预览页面
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 04/09/24 PM12:55
 -->
<!--setup-->
<script setup lang="ts">
import Preview from './components/Preview.vue'
import { useRoute } from 'vue-router'
import { to } from 'sf-utils2'
import { isInIframe } from '@/views/doc-editor/utils/common-util.ts'

const { proxy } = getCurrentInstance()

const props = defineProps({})
const emit = defineEmits({})

/* 状态 */
const isShowDownload = ref(false)
const route = useRoute()

const model = ref(route.query.model as 'preview' | 'download')
model.value ||= 'preview'
const source = ref(route.query.source as string)

const downloadPreviewRef = ref<InstanceType<typeof Preview>>()
const updateFlag = ref(0)

/* 方法 */
/**
 * 导出pdf
 */
const exportPdf = async (filename?: string) => {
  isShowDownload.value = true
  await nextTick()

  if (downloadPreviewRef.value.previewContext?.contentInitial) {
    await to(downloadPreviewRef.value.exportPdf(filename))
    return
  }

  const watcher = watch(
    () => downloadPreviewRef.value.previewContext?.contentInitial,
    async (newVal) => {
      if (newVal) {
        await to(downloadPreviewRef.value.exportPdf(filename))
        watcher()
      }
    },
  )
}

const previewPdfStyle = ref({})

/* 计算 */

/* 监听 */
watch(source, () => {
  updateFlag.value++
})

/* 周期 */
onMounted(() => {
  window.dispatchEvent(new CustomEvent('editor-ready'))

  if (!isInIframe()) {
    source.value = './4.pdf'
  }
})

/* 暴露 */
defineExpose({
  $: proxy.$,
})

/** 预览的pdf 样式*/
provide('__previewPdfStyle__', previewPdfStyle)

window['pagePreviewContent'] = {
  /* 导出 */
  exportPdf,

  /** 模式 */
  model,

  /** pdf 来源*/
  source,

  /** 预览pdf样式 */
  previewPdfStyle,
}
</script>

<!--render-->
<template>
  <div v-if="source" class="contents" :key="updateFlag">
    <div class="sticky top-0 z-10">
      <t-button @click="exportPdf">导出</t-button>
    </div>

    <!--预览  -->
    <Preview
      v-if="model == 'preview'"
      :source="source"
      model="preview"
    ></Preview>

    <!-- 下载  -->
    <Preview
      v-if="isShowDownload || model == 'download'"
      ref="downloadPreviewRef"
      model="download"
      :source="source"
      class="absolute -z-1 opacity-0"
    ></Preview>
  </div>
</template>

<!--style-->
<style scoped lang="less"></style>
