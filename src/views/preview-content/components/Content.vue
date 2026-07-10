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
import { arrayToObj, div, rafThrottle, debounce, deepClone } from 'sf-utils2'
import ContentCompSign from '@/views/preview-content/components/ContentCompSign.vue'
import ContentCompSignDate from '@/views/preview-content/components/ContentCompSignDate.vue'
import ContentCompSeal from '@/views/preview-content/components/ContentCompSeal.vue'
import type { IParamsCompItem } from '@/views/sign-editor/types/types.ts'
import { pageUtils } from '@/views/sign-editor/utils/commons.ts'
import { useSearchPDF } from '../../sign-editor/hooks/use-search-pdf.ts'

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
})
const emit = defineEmits([])

/* 状态 */
const pageRefs = ref([]) // 页面元素集合
const pageVisibility = ref({}) // 页面可见性
const pageRendered = ref({})
let pageIntersectionObserver: IntersectionObserver
const updateKeyFlag = ref(0)

const __previewContext__ = inject('__previewContext__', ref({}))
const __previewPdfStyle__ = inject('__previewPdfStyle__', ref({}))
const __paramsCompList__ = inject('__paramsCompList__')
const __keywordsParamsCompList__ = inject('__keywordsParamsCompList__')

const initialProgress = ref(0)
const rootRef = ref<HTMLDivElement>()
const dpr = ref(window.devicePixelRatio)
const scaleFactor = ref(0) // 缩放因子 1.33

// const { width: pageItemWidth, height: pageItemHeight } = useElementSize(
//   computed(() => {
//     return unrefElement(pageRefs.value?.filter?.(Boolean)?.[0])
//   }),
// )
const realPageItemWidth = ref(0)
const realPageItemHeight = ref(0)
const scalePos = ref(1)
const _pageRefFirst = computed(() => unrefElement(pageRefs.value?.filter?.(Boolean)?.[0]))

if (!__previewContext__.value.doc) {
  const { doc } = useVuePdfEmbed({
    source: props.source,
    onProgress: (progressParams) => {
      initialProgress.value = div(progressParams.loaded / progressParams.total)
    },
  })
  __previewContext__.value.doc ||= doc
} else {
  initialProgress.value = 1
}
const doc = computed(() => __previewContext__.value.doc) // 为了兼容

const { keywordsPosList, search: pdfSearch } = useSearchPDF(doc, {
  dpr,
  scaleFactor,
})
__previewContext__.value.pdfSearch = pdfSearch
__previewContext__.value.keywordsPosList = keywordsPosList

// const canvasWidth = ref(undefined)
// const canvasHeight = ref(undefined)

let oldRootWidth = 0
async function winResize() {
  if (props.model == 'preview') {
    if (
      rootRef.value.offsetWidth &&
      rootRef.value.offsetWidth >= pageUtils.a4._basePx.w &&
      oldRootWidth >= pageUtils.a4._basePx.w
    )
      return

    // updateKeyFlag.value++
    await nextTick()
    resetPageIntersectionObserver()
    oldRootWidth = rootRef.value.offsetWidth
  } else {
    const pageItemHeight = _pageRefFirst.value?.offsetHeight
    const pageItemWidth = _pageRefFirst.value?.offsetWidth

    realPageItemWidth.value = pageItemWidth
    realPageItemHeight.value = pageItemHeight
  }
}
const debounceWinResize = debounce(winResize, 500) as typeof winResize

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
    // height: '100%',
    maxWidth: '210mm',
    maxHeight: '297mm',
    ...__previewPdfStyle__.value,
    // margin: `${a4._basePx.mt}px ${a4._basePx.ml}px ${a4._basePx.mb}px ${a4._basePx.mr}px`,
    // padding: `${a4._basePx.pt}px ${a4._basePx.pl}px ${a4._basePx.pb}px ${a4._basePx.pr}px`,
  }
})

/**
 * 根节点样式
 */
const _rootStyle = computed(() => {
  const [pageDOM] = pageRefs.value
  if (!pageDOM || !doc.value?.numPages) return {}
  return {
    // height: `${
    //   pageDOM.offsetHeight * doc.value.numPages +
    //   pageUtils.perPageGap * (doc.value.numPages - 1)
    // }px`,
  }
})

/* 方法 */
/**
 * 重置页面交集观察者
 */
const resetPageIntersectionObserver = () => {

  const pageItemHeight = _pageRefFirst.value?.offsetHeight
  const pageItemWidth = _pageRefFirst.value?.offsetWidth
  realPageItemWidth.value = pageItemWidth
  realPageItemHeight.value = pageItemHeight

  pageIntersectionObserver?.disconnect()
  pageIntersectionObserver = new IntersectionObserver((entries) => {
    rafThrottleUpdatePageVisibility(entries)
  })
  pageRefs.value.forEach((element: HTMLDivElement) => {
    pageIntersectionObserver.observe(element)
  })
  // @ts-expect-error
  rafThrottleUpdatePageVisibility([{ isIntersecting: true }])
}
const updatePageVisibility = (entries: IntersectionObserverEntry[]) => {
  // (n - 1) * 12 + height * n

  // n * 12 + n * height - 12 = totalHeight
  // => n = (totalHeight + 12) / (height + 12)

  const pageItemHeight = _pageRefFirst.value?.offsetHeight
  // const pageItemWidth = _pageRefFirst.value?.offsetWidth

  const totalHeight = document.body.offsetHeight
  const visibleMaxPages = Math.ceil(
    (totalHeight + 12) / (pageItemHeight + 12),
  )

  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const index = pageRefs.value.indexOf(entry.target)
      const pageNum = _pageNumsList.value[index]

      if (props.model == 'preview') {
        // 虚拟滚动显示
        const willLoadPageNumMap = { [pageNum]: true }

        for (let i = 1; i <= visibleMaxPages; i++) {
          const prevPageNum = pageNum - i
          if (prevPageNum > 0) willLoadPageNumMap[prevPageNum] = true
          const nextPageNum = pageNum + i
          if (nextPageNum <= _pageNumsList.value.length)
            willLoadPageNumMap[nextPageNum] = true
        }

        // const prevPageNum = pageNum - 1
        // if (prevPageNum > 0) willLoadPageNumMap[prevPageNum] = true
        // const prevPageNum2 = pageNum - 2
        // if (prevPageNum2 > 0) willLoadPageNumMap[prevPageNum2] = true

        // const nextPageNum = pageNum + 1
        // if (nextPageNum <= _pageNumsList.value.length)
        //   willLoadPageNumMap[nextPageNum] = true

        // const nextPageNum2 = pageNum + 2
        // if (nextPageNum2 <= _pageNumsList.value.length)
        //   willLoadPageNumMap[nextPageNum2] = true

        pageVisibility.value = willLoadPageNumMap
        // console.log('pageNum', pageNum)
      } else {
        // 下载
        pageVisibility.value[pageNum] = true
      }
    }
  })
}
const rafThrottleUpdatePageVisibility = rafThrottle(updatePageVisibility)

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
  pageRendered.value[pageNum] = true

  scaleFactor.value =
    rootRef.value
      .querySelector('.vue-pdf-embed__page')
      .style.getPropertyValue('--scale-factor') || 1.33

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
  return arrayToObj(__paramsCompList__.value, 'pageNum', {
    valueType: 'array',
  }) as Record<string, IParamsCompItem[]>
})

/* 监听 */
watchEffect(() => {
  __previewContext__.value.contentInitial =
    _initial.value && scaleFactor.value > 0
  if (_initial.value) {
    nextTick(() => {
      window.removeEventListener('resize', debounceWinResize)
      window.addEventListener('resize', debounceWinResize)
    })
  }
})

watch(_pageNumsList, (newPageNums: number[]) => {
  pageVisibility.value = { [newPageNums[0]]: true }
  nextTick(resetPageIntersectionObserver)
})

watchEffect(() => {
  __previewContext__.value.contentPageNums = _pageNumsList.value.at(-1)
})


watchEffect(() => {
  updateKeyFlag.value
  scalePos.value = realPageItemWidth.value / pageUtils.a4._basePx.w
})


/**
 * 参数组件列表监听
 */
watch(
  [
    () => __keywordsParamsCompList__.value,
    () => __previewContext__.value.contentInitial,
  ],
  async ([newValue]) => {
    newValue ||= []
    if (newValue.length && __previewContext__.value.contentInitial) {
      // 初始化结束
      const paramsCompListKeywords = newValue
      for (const item of paramsCompListKeywords) {
        const resultList = await pdfSearch(item.keywords, { matchRule: 'last' })
        if (resultList?.length) {
          const [keywordRect] = resultList || []
          const keywordRectClone = deepClone(keywordRect) as IParamsCompItem
          keywordRectClone.type = item.type
          keywordRectClone.translateX = item.translateX
          keywordRectClone.translateY = item.translateY
          pageUtils.updateItemOffsetXY(keywordRectClone)
          keywordRectClone.translateX = 0
          keywordRectClone.translateY = 0
          console.log('paramsCompListKeywords-resultList', keywordRectClone)
          __paramsCompList__.value.push(keywordRectClone)
        }
      }
      __keywordsParamsCompList__.value = []

      // 关键字 渲染成功
      __previewContext__.value.keywordsRenderSuccess = true
    }
  },
  {
    immediate: true,
  },
)

/* 周期 */
onMounted(() => {})

onBeforeUnmount(() => {
  pageIntersectionObserver?.disconnect()
  window.removeEventListener('resize', debounceWinResize)
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
    :key="updateKeyFlag"
    :class="[
      'pdf-embed__wrap',
      props.model == 'preview' && 'is-preview',
      props.model == 'download' && 'is-download',
      __previewContext__.isExporting && 'is-exporting',
    ]"
    :style="{
      '--per-page-gap': __previewContext__.isExporting ? '0px' : '12px',
      ..._rootStyle,
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
          :width="realPageItemWidth"
          :height="realPageItemWidth"
          text-layer
          :scale="dpr"
          @rendered="onRendered(pageNum)"
        />

        <!-- 绝对坐标定位  -->
        <template
          v-if="
            _paramsCompList$pageNum[pageNum]?.length && pageVisibility[pageNum]
          "
        >
          <template
            v-for="item in _paramsCompList$pageNum[pageNum]"
            :key="item.key"
          >
            <template
              v-if="(item.keywords && item.list?.length) || !item.keywords"
            >
              <div
                :data-id="'id-' + item.key"
                class="content-comp__item"
                :style="{
                  '--page-num': item.pageNum,
                  // top: item.top - (item.pageNum - 1) * 12 + 'px',
                  top: item.offsetTop * +scalePos + 'px',
                  left: item.offsetLeft * +scalePos + 'px',
                  transform: `scale(${scalePos})`,
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
          </template>
        </template>
      </div>
    </template>
  </div>
</template>

<!--style-->
<style scoped lang="less">
@import '@/style/vars';
@import '@/style/transition';

.pdf-embed__wrap {
  --per-page-gap: 12px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  .content-comp__item {
    break-after: auto;
    position: absolute;
    z-index: 10;
    transform-origin: 0 0;
    outline: 1px dashed @primary-color;
    background-color: rgba(@primary-color, 0.04);
    pointer-events: none;
  }
  &.is-exporting {
    .pdf-embed__item {
      box-shadow: none;
    }
  }

  &.is-preview {
  }
}

.pdf-embed__item {
  margin: 0 auto;
  box-shadow: 0 0 4px 2px rgba(154, 161, 177, 0.15);
  scroll-margin-block-start: 12px;
  break-after: page;
  //break-inside: avoid;
  position: relative;
  aspect-ratio: 210 / 297;
  :deep {
    .vue-pdf-embed {
      background: white;
      canvas {
        position: absolute;
        width: 100%;
        height: 100%;
        inset: 0;
      }
    }
  }
  & + .pdf-embed__item {
    margin-top: var(--per-page-gap);
  }
  &.is-last {
    break-after: auto;
  }
  :deep {
    a {
      pointer-events: none;
    }
  }
}
</style>
