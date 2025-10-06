<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 04/10/25 PM3:03
 -->
<!--setup-->
<script setup lang="ts">
import VuePdfEmbed, { useVuePdfEmbed } from 'vue-pdf-embed'
import 'vue-pdf-embed/dist/styles/annotationLayer.css'
import 'vue-pdf-embed/dist/styles/textLayer.css'
import { arrayToObj, div } from 'sf-utils2'
import ContentCompSign from '@/views/preview-content/components/ContentCompSign.vue'
import ContentCompSignDate from '@/views/preview-content/components/ContentCompSignDate.vue'
import ContentCompSeal from '@/views/preview-content/components/ContentCompSeal.vue'
import type { IParamsCompItem } from '@/views/sign-editor/types/types.ts'
import { cssUtil } from '@/views/doc-editor/utils/css-util.ts'

const { proxy } = getCurrentInstance()
const props = defineProps({
  /**
   * 模式
   */
  model: {
    type: String as PropType<'preview' | 'download'>,
    default: 'preview',
  },

  /**
   * pdf 来源
   */
  source: {
    type: Object,
    default: () => {},
  },

  /**
   * 组件参数列表
   */
  paramsCompList: {
    type: Array,
    default: () => [],
  },
})
const emit = defineEmits([])

/* 状态 */
const pageRefs = ref([]) // 页面元素集合
const pageVisibility = ref({}) // 页面可见性
const pageRendered = ref({})
let pageIntersectionObserver: IntersectionObserver

const __previewContext__ = inject('__previewContext__', ref({}))
const __previewPdfStyle__ = inject('__previewPdfStyle__', ref({}))
const initialProgress = ref(0)
const a4 = cssUtil.getPaperSize('A4')
const scaleFactor = ref(0)
const rootRef = ref<HTMLDivElement>()
const dpr = ref(window.devicePixelRatio)

/**
 * 嵌入项每一项样式
 */
const _embedItemStyle = computed(() => {
  if (props.model == 'download') {
    return {
      width: '210mm',
      height: '297mm',
    }
  }
  return {
    width: '450px',
    // height: '100%',
    maxWidth: '210mm',
    maxHeight: '297mm',
    ...__previewPdfStyle__.value,
    // margin: `${a4._basePx.mt}px ${a4._basePx.ml}px ${a4._basePx.mb}px ${a4._basePx.mr}px`,
    // padding: `${a4._basePx.pt}px ${a4._basePx.pl}px ${a4._basePx.pb}px ${a4._basePx.pr}px`,
  }
})

const { doc } = useVuePdfEmbed({
  source: props.source,
  onProgress: (progressParams) => {
    window.requestAnimationFrame(() => {
      initialProgress.value = div(progressParams.loaded / progressParams.total)
    })
  },
})

/* 方法 */
/**
 * 重置页面交集观察者
 */
const resetPageIntersectionObserver = () => {
  pageIntersectionObserver?.disconnect()
  pageIntersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = pageRefs.value.indexOf(entry.target)
        const pageNum = _pageNumsList.value[index]
        pageVisibility.value[pageNum] = true
      }
    })
  })
  pageRefs.value.forEach((element: HTMLDivElement) => {
    pageIntersectionObserver.observe(element)
  })
}

/**
 * 一次性加载所有页面
 */
const loadAllPdfPagesRaf = async () => {
  const maxPageNum = _pageNumsList.value.at(-1)
  const existMaxPageNum = Math.max(
    ...Object.keys(pageVisibility.value).map((key) => +key || 0),
    0,
  )
  if (existMaxPageNum < maxPageNum) {
    for (let i = existMaxPageNum + 1; i <= maxPageNum; i++) {
      pageVisibility.value[i] = true
      await nextTick()
      await rafPromise()
    }
  }
  return new Promise((resolve) => {
    const isRenderSuccess =
      _pageNumsList.value?.length &&
      _pageNumsList.value.every((pageNum) => pageRendered.value[pageNum])
    if (isRenderSuccess) return resolve(true)
    loadAllPdfPagesRaf['_resolve'] = resolve
  })

  function rafPromise() {
    return new Promise((resolve) => {
      requestAnimationFrame(resolve)
    })
  }
}
__previewContext__.value.loadAllPdfPagesRaf = loadAllPdfPagesRaf

/**
 * 渲染完成
 */
const onRendered = (pageNum: number) => {
  console.log('onRendered', pageNum)
  pageRendered.value[pageNum] = true

  nextTick(() => {
    scaleFactor.value =
      rootRef.value
        .querySelector('.vue-pdf-embed__page')
        .style.getPropertyValue('--scale-factor') || 1
  })

  const isRenderSuccess =
    _pageNumsList.value?.length &&
    _pageNumsList.value.every((pageNum) => pageRendered.value[pageNum])

  if (isRenderSuccess) {
    loadAllPdfPagesRaf['_resolve']?.()
  }
}

/* 计算 */

/**
 * 分页数量
 */
const _pageNumsList = computed(() =>
  doc.value ? [...Array(doc.value.numPages + 1).keys()].slice(1) : [],
)

/**
 * 是否加载结束
 */
const _initial = computed(() => {
  return initialProgress.value == 1 && _pageNumsList.value.length > 0
})

/**
 * 参数组件列表
 */
const _paramsCompList$pageNum = computed(() => {
  return arrayToObj(props.paramsCompList, 'pageNum', {
    valueType: 'array',
  }) as Record<string, IParamsCompItem[]>
})

/* 监听 */
watchEffect(() => {
  __previewContext__.value.contentInitial = _initial.value
})

watch(_pageNumsList, (newPageNums: number[]) => {
  pageVisibility.value = { [newPageNums[0]]: true }
  nextTick(resetPageIntersectionObserver)
})

watchEffect(() => {
  __previewContext__.value.contentPageNums = _pageNumsList.value.at(-1)
})

/* 周期 */
onMounted(() => {})

onBeforeUnmount(() => {
  pageIntersectionObserver?.disconnect()
})

/* 暴露 */
defineExpose({
  $: proxy.$,

  _pageNumsList,
})
</script>

<!--render-->
<template>
  <div
    ref="rootRef"
    :class="[
      'pdf-embed__wrap',
      props.model == 'preview' && 'is-preview',
      props.model == 'download' && 'is-download',
      __previewContext__.isExporting && 'is-exporting',
    ]"
    :style="{
      '--per-page-gap': __previewContext__.isExporting ? '0px' : '12px',
    }"
  >
    <!-- 内容区 -->
    <!-- iframe的  -->
    <template v-for="(pageNum, index) in _pageNumsList" :key="pageNum">
      <div
        ref="pageRefs"
        :class="[
          'pdf-embed__item',
          `page-num-${pageNum}`,
          _pageNumsList.length - 1 == index && `is-last`,
        ]"
        :style="{ ..._embedItemStyle }"
      >
        <VuePdfEmbed
          v-if="pageVisibility[pageNum]"
          :source="doc"
          :page="pageNum"
          annotation-layer
          text-layer
          :scale="dpr * 2"
          @rendered="onRendered(pageNum)"
        />

        <template v-if="_paramsCompList$pageNum[pageNum]?.length">
          <div
            v-for="item in _paramsCompList$pageNum[pageNum]"
            :key="item.key"
            :data-id="'id-' + item.key"
            class="content-comp__item"
            :style="{
              '--page-num': item.pageNum,
              // top: item.top - (item.pageNum - 1) * 12 + 'px',
              top: item.offsetTop + 'px',
              left: item.left + 'px',
              transform: `scale(${scaleFactor})`,
            }"
          >
            <!-- 印章 -->
            <ContentCompSeal
              v-if="item.type == 'compSeal'"
              :node-data="item"
            ></ContentCompSeal>

            <!-- 签名 -->
            <ContentCompSign
              v-else-if="item.type == 'compSign'"
              :node-data="item"
            >
            </ContentCompSign>

            <!-- 签署日期 -->
            <ContentCompSignDate
              v-else-if="item.type == 'compSignDate'"
              :node-data="item"
            ></ContentCompSignDate>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<!--style-->
<style scoped lang="less">
.pdf-embed__wrap {
  --per-page-gap: 12px;
  width: fit-content;
  margin: 0 auto;
  position: relative;
  .content-comp__item {
    break-after: auto;
    position: absolute;
    z-index: 10;
    transform-origin: 0 0;
  }
  &.is-exporting {
    .pdf-embed__item {
      box-shadow: none;
    }
  }
}

.pdf-embed__item {
  margin: 0 auto;
  box-shadow: 0 0 4px 2px rgba(154, 161, 177, 0.15);
  scroll-margin-block-start: 12px;
  break-after: page;
  //break-inside: avoid;
  background: white;
  position: relative;
  & + .pdf-embed__item {
    margin-top: var(--per-page-gap);
  }
  &.is-last {
    break-after: auto;
  }
}
</style>
