<!--
 * @Description: pdf预览页面
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 04/09/24 PM12:55
 -->
<!--setup-->
<script setup lang="ts">
import Preview from './components/Preview.vue'
import { useRoute } from 'vue-router'
import { deepClone, to } from 'sf-utils2'
import { isInIframe } from '@/views/doc-editor/utils/common-util.ts'
import { pageUtils } from '@/views/sign-editor/utils/commons.ts'
import type { IParamsCompItem } from '@/views/sign-editor/types/types.ts'
// import { COMP_PARAMS_NAME_MAP } from '@/views/doc-editor/extensions/constant.ts'

const { proxy } = getCurrentInstance()

const props = defineProps({})
const emit = defineEmits({})

/* 状态 */
const isShowDownload = ref(false)
const route = useRoute()

const model = ref(route.query.model as 'preview' | 'download')
model.value ||= 'preview'
const source = ref(route.query.source as string)
const paramsCompList = ref([])

const downloadPreviewRef = ref<InstanceType<typeof Preview>>()
const previewRef = ref<InstanceType<typeof Preview>>()
const updateFlag = ref(0)

/* 方法 */
/**
 * 导出pdf
 */
const exportPdf = (filename?: string) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    isShowDownload.value = true
    await nextTick()

    if (downloadPreviewRef.value.previewContext?.contentInitial) {
      await to(downloadPreviewRef.value.exportPdf(filename))
      return resolve(true)
    }

    const watcher = watch(
      () => downloadPreviewRef.value.previewContext?.contentInitial,
      async (newVal) => {
        if (newVal) {
          await to(downloadPreviewRef.value.exportPdf(filename))
          watcher()
          resolve(true)
        }
      },
    )
  })
}

const previewPdfStyle = ref({})

/**
 * 初始化 组件参数
 * @param paramsCompListArg
 * @param retainField
 */
function initParamsCompList(
  paramsCompListArg: IParamsCompItem[],
  retainField?: IParamsCompItem['type'][],
) {
  paramsCompList.value = pageUtils.reverseExpandCompParams(
    deepClone(paramsCompListArg || []),
    retainField,
    // Object.values(COMP_PARAMS_NAME_MAP),
  )
}

/* 计算 */

/* 监听 */
watch(source, () => {
  updateFlag.value++
})

/* 周期 */
onMounted(() => {
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('editor-ready'))
  })

  if (!isInIframe()) {
    source.value = './pdfs/3.pdf'
    // paramsCompList.value._isSkip = true

    initParamsCompList([
      { type: 'compSeal', key: '1', offsetX: 717, offsetY: 1045, pageNum: 1 },
    ])
  }
})

/* 暴露 */
defineExpose({
  $: proxy.$,
})

/** 预览的pdf 样式*/
provide('__previewPdfStyle__', previewPdfStyle)

window['pagePreviewContent'] = {
  /** 导出 */
  exportPdf,

  /** 模式 */
  model,

  /** pdf 来源*/
  source,

  /** 预览pdf样式 */
  previewPdfStyle,

  /** 初始化参数 */
  initParamsCompList,

  /**
   * 是否内容初始化
   */
  isContentInitial: computed(
    () => previewRef.value.previewContext?.contentInitial,
  ),

  pageUtils,
}
</script>

<!--render-->
<template>
  <div v-if="source" :key="updateFlag" class="contents">
    <div v-if="!isInIframe()" class="sticky top-0 z-10">
      <t-button @click="exportPdf">导出</t-button>
    </div>

    <!--预览  -->
    <Preview
      v-if="model == 'preview'"
      ref="previewRef"
      :source="source"
      model="preview"
      :params-comp-list="paramsCompList"
    ></Preview>

    <!-- 下载  -->
    <Preview
      v-if="isShowDownload || model == 'download'"
      ref="downloadPreviewRef"
      model="download"
      :source="source"
      :params-comp-list="paramsCompList"
      class="absolute -z-1 opacity-0"
    ></Preview>
  </div>
</template>

<!--style-->
<style scoped lang="less"></style>
