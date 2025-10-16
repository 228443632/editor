<!--
 * @Description: 内容区域
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/10/25 PM3:05
 -->
<!--default-->
<script setup lang="ts">
import VuePdfEmbed from 'vue-pdf-embed'
import { debounce, arrayToObj, rafThrottle } from 'sf-utils2'
import ContentCompSign from '@/views/preview-content/components/ContentCompSign.vue'
import ContentCompSeal from '@/views/preview-content/components/ContentCompSeal.vue'
import ContentCompSignDate from '@/views/preview-content/components/ContentCompSignDate.vue'
import type { IParamsCompItem } from '@/views/sign-editor/types/types.ts'
import { pageUtils } from '@/views/sign-editor/utils/commons.ts'

const props = defineProps({})
const emit = defineEmits<{
  /**
   * 发生变化
   */
  (e: 'change', val: any): void
}>()

/* 状态 */
const __activePageNum__ = inject('__activePageNum__')
const __signContext__ = inject('__signContext__') // 预览上下文

const pageRefs = ref([]) // 页面元素集合
const pageVisibility = ref({}) // 页面可见性
const rootRef = ref<HTMLElement>()
let pageIntersectionObserver: IntersectionObserver
const a4 = pageUtils.a4
const { width: pageItemWidth } = useElementBounding(
  computed(() => pageRefs.value?.[0]),
)
const dpi = window.devicePixelRatio || 1

const isWheeling = ref(false)
const { height: parentHeight } = useElementSize(
  computed(() => rootRef.value?.parentElement),
)
/**
 * 虚拟滚动可见nums
 */
// const _vsPageNums = computed(() => {
//   return Math.ceil(parentHeight.value / ((210 / 120) * 297))
// })

/* 方法 */
/**
 * 重置页面交集观察者
 */
const resetPageIntersectionObserver = () => {
  pageIntersectionObserver?.disconnect()
  pageIntersectionObserver = new IntersectionObserver((entries) => {
    // rafThrottleUpdatePageVisibility(entries)
    debounceUpdatePageVisibility(entries)
  })
  pageRefs.value.forEach((element: HTMLDivElement) => {
    pageIntersectionObserver.observe(element)
  })
}

const updatePageVisibility = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const index = pageRefs.value.indexOf(entry.target)
      const pageNum = _pageNumsList.value[index]
      pageVisibility.value[pageNum] = true
    }
  })
}
// const rafThrottleUpdatePageVisibility = rafThrottle(updatePageVisibility)
const debounceUpdatePageVisibility = debounce(updatePageVisibility, 200)

/**
 * 选择pdf一项
 */
const onChooseItem = (pageNum: number) => {
  __activePageNum__.value = pageNum
  onWheel()
  pageScrollIntoView(pageNum)
  emit('change', pageNum)
}

/**
 * 页面滚动到指定页码
 * @param pageNum
 */
const pageScrollIntoView = (pageNum: number) => {
  const idx = +pageNum - 1
  const pageDom = pageRefs.value[idx]
  if (pageDom) {
    if (isWheeling.value) return
    pageDom.scrollIntoView({
      // behavior: 'smooth', // instant
      block: 'start',
    })
  }
}
const debouncePageScrollIntoView = debounce(pageScrollIntoView, 200)

/**
 * 鼠标滚轮滚动事件
 */
const onWheel = () => {
  if (onWheel['timer']) clearTimeout(onWheel['timer'])
  isWheeling.value = true
  onWheel['timer'] = setTimeout(() => {
    isWheeling.value = false
  }, 500)
}

/* 计算 */

const _scalePos = computed(() => {
  return pageItemWidth.value / a4._basePx.w
})

/**
 * 参数组件列表
 */
const _paramsCompList$pageNum = computed(() => {
  return arrayToObj(__signContext__.value._paramsCompList, 'pageNum', {
    valueType: 'array',
  }) as Record<string, IParamsCompItem[]>
})

/**
 * 是否加载结束
 */
const _initial = computed(() => {
  return __signContext__.value.contentInitial
})

/**
 * 分页数量
 */
const _pageNumsList = computed(() =>
  __signContext__.value.doc
    ? [...Array(__signContext__.value.doc.numPages + 1).keys()].slice(1)
    : [],
)

/**
 * 嵌入项每一项样式
 */
const _embedItemStyle = computed(() => {
  return {
    // width: '210mm',
    // height: '297mm',
  }
})

/* 监听 */
watchEffect(() => {
  __signContext__.value.rightInitial = _initial.value
})

watch(_pageNumsList, (newPageNums: number[]) => {
  pageVisibility.value = { [newPageNums[0]]: true }
  nextTick(resetPageIntersectionObserver)
})

watch(
  () => __signContext__.value.anchorInfo?.active,
  (newVal) => {
    debouncePageScrollIntoView(newVal)
  },
)

onBeforeUnmount(() => {
  pageIntersectionObserver?.disconnect()
})

const { list, containerProps, wrapperProps } = useVirtualList(_pageNumsList, {
  itemHeight: 182,
})
</script>

<template>
  <div class="preview-thumb" ref="rootRef" @wheel="onWheel">
    <template v-if="_initial">
      <div
        v-for="pageNum in _pageNumsList"
        :key="pageNum"
        ref="pageRefs"
        :class="[
          'pdf-embed__item',
          __activePageNum__ == pageNum && 'is-active',
        ]"
        :style="{
          ..._embedItemStyle,
        }"
        @click="onChooseItem(pageNum)"
      >
        <vue-pdf-embed
          v-if="pageVisibility[pageNum]"
          :source="__signContext__.doc"
          :page="pageNum"
          class="animation-fade"
          :scale="dpi / 3"
        />

        <div class="embed__item-num">第 {{ pageNum }} 页</div>

        <template
          v-if="
            _paramsCompList$pageNum[pageNum]?.length && pageVisibility[pageNum]
          "
        >
          <div
            v-for="item in _paramsCompList$pageNum[pageNum]"
            :key="item.key"
            :data-id="'id-' + item.key"
            class="content-comp__item"
            :style="{
              '--page-num': item.pageNum,
              // top: item.top - (item.pageNum - 1) * 12 + 'px',
              top: item.offsetTop * +_scalePos + 'px',
              left: item.offsetLeft * +_scalePos + 'px',
              transform: `scale(${_scalePos})`,
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

    <!-- 骨架屏   -->
    <template v-else>
      <div
        v-for="pageNum in 8"
        :key="pageNum"
        ref="pageRefs"
        class="pdf-embed__item aspect-item bg-white py-6 px-6 flex flex-col gap-4"
        :style="{
          ..._embedItemStyle,
        }"
      >
        <t-skeleton
          class="w-full"
          :loading="true"
          animation="gradient"
          theme="paragraph"
        ></t-skeleton>
      </div>
    </template>
  </div>
</template>

<style lang="less" scoped>
@import '@/style/vars';
@import '@/style/transition';

.preview-thumb {
}

.pdf-embed__item {
  max-width: 120px;
  width: 100vw;
  aspect-ratio: 210 / 297;
  margin: 0 auto;
  cursor: pointer;
  position: relative;
  outline: 1px solid #ddd;
  background: #fff;
  scroll-margin-block-start: 10px;
  content-visibility: auto;
  contain-intrinsic-size: 210mm 297mm;
  overflow: hidden;

  .content-comp__item {
    break-after: auto;
    position: absolute;
    z-index: 10;
    outline: 1px dashed @primary-color;
    background-color: rgba(@primary-color, 0.06);
    transform-origin: 0 0;
  }

  & + .pdf-embed__item {
    margin-top: var(--per-page-gap);
  }

  &:hover {
    box-shadow: 0 0 4px 2px rgba(154, 161, 177, 0.15);
  }

  &.is-active {
    outline: 2px solid var(--umo-primary-color);
    box-shadow: 0 0 4px 2px rgba(154, 161, 177, 0.15);
    //box-shadow:
    //  //0 0 4px 2px rgba(154, 161, 177, 0.15),
    //  //0 0 0 1px rgba(0, 0, 0, 0.05),
    //  0 0 0 2px var(--umo-primary-color) inset;
    .embed__item-num {
      @apply: bg-primary;
    }
  }
}

.vue-pdf-embed__page {
  box-shadow: 0 2px 8px 4px rgba(0, 0, 0, 0.1);
}

.embed__item-num {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  font-size: 12px;
  color: #fff;
}

.aspect-item {
  aspect-ratio: 794 / 1122;
}

:deep {
  .t-skeleton__row {
    --td-font-size-body-large: 10px;
    --td-comp-margin-l: 8px;
  }
}
</style>
