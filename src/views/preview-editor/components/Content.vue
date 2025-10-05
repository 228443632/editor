<!--
 * @Description: 内容区域
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/10/25 PM3:05
 -->
<!--default-->
<script setup lang="ts">
import VuePdfEmbed, { useVuePdfEmbed } from 'vue-pdf-embed'
import { cssUtil } from '@/views/doc-editor/utils/css-util.ts'
import { deepClone, div, getAbsOffsetTop, uuid } from 'sf-utils2'
import ContentCompSign from './ContentCompSign.vue'
import ContentCompSeal from './ContentCompSeal.vue'
import { PREVIEW_AUX_LINE_CTOR } from './ContentLineWrap.vue'
import { useMouseDragLine } from '../hooks/use-mouse-drag-line.ts'
import useAnchor from '@/views/preview-editor/hooks/use-anchor'
import ContentCompSignDate from '@/views/preview-editor/components/ContentCompSignDate.vue'
import { useHotKeysV2 } from '@/composables/hotkeys.ts'
// import 'vue-pdf-embed/dist/styles/annotationLayer.css'
// import 'vue-pdf-embed/dist/styles/textLayer.css'

/* 状态 */
const props = defineProps({})
const emit = defineEmits([])
const embedPdfWrapRef = ref<HTMLDivElement>()
const initialProgress = ref(0)

const __activePageNum__ = inject('__activePageNum__')
const __layoutSize__ = inject('__layoutSize__')
const __previewContext__ = inject('__previewContext__') // 预览上下文

const rootRef = ref<HTMLElement>()
const {
  _width: _dragAreaWidth,
  _height: _dragAreaHeight,
  _fromX: _dragAreaFromX,
  _fromY: _dragAreaFromY,
  isMoving: dragAreaIsMoving,
  isInRect,
} = useMouseDragLine(embedPdfWrapRef, {
  mouseEventContainerRef: rootRef,
})

const pageRefs = ref([]) // 页面元素集合
const pageVisibility = ref({}) // 页面可见性
const pageRendered = ref({})
let pageIntersectionObserver: IntersectionObserver

const copyContentInfo = ref()

const activeElement = useActiveElement()
const { x, y } = usePointer()

const a4 = cssUtil.getPaperSize('A4')

const { doc } = useVuePdfEmbed({
  source: __previewContext__.value.source,
  onProgress: (progressParams) => {
    initialProgress.value = div(progressParams.loaded / progressParams.total)
    // console.log('c', progress, progress == '1')
  },
})
console.log('doc', doc, doc.value)
const { registerHotKeys } = useHotKeysV2({
  filter: () => {
    if (!activeElement.value) return false
    if (rootRef.value.contains(activeElement.value)) return true
    return false
  },
})

// 全选
registerHotKeys('ctrl+a, command+a', (e: KeyboardEvent) => {
  const paramsCompList = __previewContext__.value.paramsCompList
  if (!paramsCompList?.length) return
  if (paramsCompList?.length == 1) {
    __previewContext__.value.selectParamsComp(paramsCompList[0])
    return
  }
  __previewContext__.value.paramsCompList.forEach((item) => {
    item.isInRect = true
  })
})

// 拷贝
registerHotKeys('ctrl+c, command+c', copy)
function copy() {
  const inRectNums = __previewContext__.value.paramsCompList
    .filter((item) => item.isInRect)
    .concat(__previewContext__.value.activeCompParam)
    .filter(Boolean)
  if (inRectNums?.length) {
    copyContentInfo.value = inRectNums.map((item) => item)
  }
}

// 粘贴
registerHotKeys('ctrl+v, command+v', paste)
function paste() {
  const inScrollViewOffsetTop = getAbsOffsetTop(
    embedPdfWrapRef.value,
    rootRef.value,
  )
  const scrollViewFitTop = rootRef.value.getBoundingClientRect().top // 根元素距离视口顶部的距离
  const scrollTop = rootRef.value.scrollTop
  const offsetY = y.value + scrollTop - scrollViewFitTop - inScrollViewOffsetTop

  const { left, top, right, bottom } =
    embedPdfWrapRef.value.getBoundingClientRect()
  if (
    x.value >= left &&
    y.value >= top &&
    x.value <= right &&
    y.value <= bottom
  ) {
    // 在其范围内
    const list = copyContentInfo.value || []
    const minTop = Math.min(...list.map((item) => item.top))
    const minLeft = Math.min(...list.map((item) => item.left))
    list.forEach((item) => {
      const itemClone = deepClone(item)
      itemClone.top = offsetY + (item.top - minTop)
      itemClone.left = x.value - left + (item.left - minLeft)
      itemClone.isInRect = false
      itemClone.key = uuid()
      __previewContext__.value.paramsCompList.push(itemClone)
    })
  }
}

// 剪切
registerHotKeys('ctrl+x, command+x', () => {
  // 删除
  del()

  // 粘贴
  paste()
})

// 撤回
registerHotKeys('ctrl+z, command+z', () => {
  useMessage('warning', { content: '暂不支持撤回操作' })
})

// 删除
registerHotKeys('backspace, delete', del)
function del() {
  // 删除键
  __previewContext__.value.removeParamsComp()
  __previewContext__.value.paramsCompList =
    __previewContext__.value.paramsCompList.filter((item) => !item.isInRect)
}

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
  pageRendered.value[pageNum] = true

  const isRenderSuccess =
    _pageNumsList.value?.length &&
    _pageNumsList.value.every((pageNum) => pageRendered.value[pageNum])

  if (isRenderSuccess) {
    loadAllPdfPagesRaf['_resolve']?.()
  }
}

/**
 * 根元素按键事件
 * @param e
 */
const onKeyDownRoot = (e: KeyboardEvent) => {
  console.log('e.key', e)
  // 判断按下的键是删除键
  if (e.key == 'Delete' || e.key == 'Backspace') {
    // 删除键
    __previewContext__.value.removeParamsComp()
    __previewContext__.value.paramsCompList = []
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
 * 嵌入项每一项样式
 */
const _embedItemStyle = computed(() => {
  return {
    width: '210mm',
    height: '297mm',
    overflow: 'hidden',
    // width: `${a4._basePx.w}px`,
    // height: `${a4._basePx.h}px`,
    // margin: `${a4._basePx.mt}px ${a4._basePx.ml}px ${a4._basePx.mb}px ${a4._basePx.mr}px`,
    // padding: `${a4._basePx.pt}px ${a4._basePx.pl}px ${a4._basePx.pb}px ${a4._basePx.pr}px`,
  }
})

/**
 * 是否加载结束
 */
const _initial = computed(() => {
  return initialProgress.value == 1 && _pageNumsList.value.length > 0
})

/* 监听 */

watchEffect(() => {
  __previewContext__.value.contentPageNums = _pageNumsList.value.at(-1)
})

watchEffect(() => {
  __previewContext__.value.contentInitial = _initial.value
})

/**
 * 监听初始化完成，初始化锚点
 */
watch([_initial, _pageNumsList, embedPdfWrapRef], () => {
  const totalPageNum = _pageNumsList.value.at(-1)
  if (_initial.value && totalPageNum > 0 && embedPdfWrapRef.value) {
    if (__previewContext__.value.anchorInfo?.removeEvents) {
      __previewContext__.value.anchorInfo.removeEvents()
    }
    __previewContext__.value.anchorInfo = useAnchor({
      target: embedPdfWrapRef,
      selectors: new Array(totalPageNum).fill(0).map((_, idx) => {
        return {
          selector: `.pdf-embed__item.page-num-${idx + 1}`,
          value: idx + 1,
        }
      }),
      defaultValue: 1,
      offsetTop: -12,
    })
    __previewContext__.value.anchorInfo.init()
  }
})

/**
 * 监听激活的页码变化，触发页面滚动
 */
watch(__activePageNum__, (newVal: number) => {
  const idx = +newVal - 1
  const pageDom = pageRefs.value[idx]
  if (pageDom) {
    pageDom.scrollIntoView()
  }
})

watchEffect(() => {
  void _dragAreaWidth.value
  void _dragAreaHeight.value
  void _dragAreaFromX.value
  void _dragAreaFromY.value
  void dragAreaIsMoving.value

  const paramsCompList = __previewContext__.value.paramsCompList || []

  paramsCompList.forEach((item) => {
    item.bottom = item.top + item.height
    item.right = item.left + item.width
    if (isInRect(item)) {
      item.isInRect = true
    }
  })
})

watch(_pageNumsList, (newPageNums: number[]) => {
  pageVisibility.value = { [newPageNums[0]]: true }
  nextTick(resetPageIntersectionObserver)
})

onBeforeUnmount(() => {
  pageIntersectionObserver?.disconnect()

  if (__previewContext__.value.anchorInfo?.removeEvents) {
    __previewContext__.value.anchorInfo.removeEvents()
  }
})

/** 暴露 */
defineExpose({
  embedPdfWrapRef,
})
</script>

<template>
  <div
    ref="rootRef"
    :class="[
      `pdf-preview__content umo-scrollbar`,
      !_initial && '!overflow-y-hidden pointer-events-none cursor-not-allowed',
      __previewContext__.isExporting && 'is-exporting',
    ]"
    tabindex="10"
  >
    <!--    {{ __previewContext__._paramsCompList }}-->
    <div ref="embedPdfWrapRef" class="pdf-embed__wrap">
      <!-- 加载成功 -->
      <template v-if="_initial">
        <!--  激活的组件虚线   -->
        <div :class="[PREVIEW_AUX_LINE_CTOR, 'absolute top-0 left-0']"></div>

        <!--  鼠标选中区域   -->
        <div
          v-show="
            dragAreaIsMoving &&
            !__previewContext__.activeCompParam?.isEsDragging &&
            !__previewContext__.isDragging
          "
          class="mouse-area"
          :style="{
            left: _dragAreaFromX + 'px',
            top: _dragAreaFromY + 'px',
            '--w': Math.abs(_dragAreaWidth) + 'px',
            '--h': Math.abs(_dragAreaHeight) + 'px',
          }"
        >
          <div class="mouse-area__top"></div>
          <div class="mouse-area__right"></div>
          <div class="mouse-area__bottom"></div>
          <div class="mouse-area__left"></div>
        </div>

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
              @rendered="onRendered(pageNum)"
            />
          </div>
        </template>

        <!-- 参数悬浮 -->
        <div
          v-for="(item, index) in __previewContext__._paramsCompList"
          :key="item.key"
          :data-id="'id-' + item.key"
          class="content-comp__item"
          :style="{
            '--page-num': item.pageNum,
            '--mt': -((item.pageNum - 1) * __layoutSize__.perPageGap) + 'px',
          }"
        >
          <!-- 印章 -->
          <template v-if="item.type == 'compSeal'">
            <ContentCompSeal
              v-model:node-data="__previewContext__.paramsCompList[index]"
            ></ContentCompSeal>
          </template>

          <!-- 签名 -->
          <template v-else-if="item.type == 'compSign'">
            <ContentCompSign
              v-model:node-data="__previewContext__.paramsCompList[index]"
            ></ContentCompSign>
          </template>

          <!-- 签署日期 -->
          <template v-else-if="item.type == 'compSignDate'">
            <ContentCompSignDate
              v-model:node-data="__previewContext__.paramsCompList[index]"
            ></ContentCompSignDate>
          </template>
        </div>

        <t-back-top
          :visible-height="800"
          :container="() => __previewContext__.contentElRef"
          size="small"
          :offset="['300px', '48px']"
        />
      </template>

      <!-- 骨架屏 -->
      <template v-else>
        <div
          v-for="pageNum in 3"
          :key="pageNum"
          ref="pageRefs"
          class="pdf-embed__item bg-white py-6 px-4 flex flex-col gap-4 mb-12px"
          :style="{
            ..._embedItemStyle,
            padding: `${a4._basePx.pt}px ${a4._basePx.pl}px ${a4._basePx.pb}px ${a4._basePx.pr}px`,
          }"
        >
          <t-skeleton
            class="w-full"
            :loading="true"
            animation="gradient"
            theme="paragraph"
          ></t-skeleton>
          <t-skeleton
            class="w-full"
            :loading="true"
            animation="gradient"
            theme="paragraph"
          ></t-skeleton>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="less" scoped>
@import '@/style/transition';
.pdf-preview__content {
  flex: 1;
  width: 0;
  overflow: auto;
  height: 100%;
  padding: 16px 0;
  scroll-behavior: smooth;
  &.caret--is-dragging {
    .pdf-embed__item {
      outline: 2px dashed var(--umo-primary-color);
    }
  }

  &.is-exporting {
    .pdf-embed__item {
      margin-top: 0;
      box-shadow: none;
    }
    :deep {
      .content-comp__item > * {
        margin-top: var(--mt);
      }
    }
    .preview-page-content__auxline {
      opacity: 0;
    }
  }
}

.mouse-area {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
  width: var(--w);
  height: var(--h);
  z-index: 9999;
  background: rgba(0, 0, 0, 0.1);
  border: 1px dashed var(--umo-primary-color);
  //.mouse-area__top, .mouse-area__bottom {
  //  width: var(--w);
  //  height: 1px;
  //}
  //
  //.mouse-area__left, .mouse-area__right {
  //}
}

.pdf-embed__wrap {
  width: fit-content;
  margin: 0 auto;
  position: relative;
}

.pdf-embed__item {
  margin: 0 auto;
  box-shadow: 0 0 4px 2px rgba(154, 161, 177, 0.15);
  scroll-margin-block-start: 12px;
  break-after: avoid;
  & + .pdf-embed__item {
    margin-top: var(--per-page-gap);
  }
  &.is-last {
    break-after: auto;
  }
}
</style>
