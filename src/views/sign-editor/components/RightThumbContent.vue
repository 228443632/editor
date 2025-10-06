<!--
 * @Description: 内容区域
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/10/25 PM3:05
 -->
<!--default-->
<script setup lang="ts">
import VuePdfEmbed, { useVuePdfEmbed } from 'vue-pdf-embed'
import { div, debounce } from 'sf-utils2'

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
let pageIntersectionObserver: IntersectionObserver
const initialProgress = ref(0)

const isWheeling = ref(false)

const { doc } = useVuePdfEmbed({
  source: __signContext__.value.source,
  onProgress: (progressParams) => {
    initialProgress.value = div(progressParams.loaded / progressParams.total)
    // console.log('c', progress, progress == '1')
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
  pageRefs.value.forEach((element) => {
    pageIntersectionObserver.observe(element)
  })
}

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
      behavior: 'smooth', // instant
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

/**
 * 是否加载结束
 */
const _initial = computed(() => {
  return initialProgress.value == 1
})

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
  return {}
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
</script>

<template>
  <div class="preview-thumb" @wheel="onWheel">
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
          :source="doc"
          :page="pageNum"
        />

        <div class="embed__item-num">第 {{ pageNum }} 页</div>
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
.preview-thumb {
}

.pdf-embed__item {
  max-width: 120px;
  margin: 0 auto;
  cursor: pointer;
  position: relative;
  outline: 1px solid #ddd;
  scroll-margin-block-start: 10px;
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
