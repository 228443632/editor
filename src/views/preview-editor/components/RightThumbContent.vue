<!--
 * @Description: 内容区域
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/10/25 PM3:05
 -->
<!--default-->
<script setup lang="ts">
import VuePdfEmbed, { useVuePdfEmbed } from 'vue-pdf-embed'
import { div } from 'sf-utils2'

const props = defineProps({})
const emit = defineEmits<{
  /**
   * 发生变化
   */
  (e: 'change', val: any): void
}>()

const __activePageNum__ = inject('__activePageNum__')
const pageRefs = ref([]) // 页面元素集合
const pageVisibility = ref({}) // 页面可见性
let pageIntersectionObserver: IntersectionObserver

const { doc } = useVuePdfEmbed({
  source: './2.pdf',
  onProgress: (progressParams) => {
    const progress = div(progressParams.loaded / progressParams.total)
    // console.log('c', progress, progress == '1')
  },
})
console.log('doc', doc, doc.value)

const resetPageIntersectionObserver = () => {
  pageIntersectionObserver?.disconnect()
  pageIntersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = pageRefs.value.indexOf(entry.target)
        const pageNum = pageNums.value[index]
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
  emit('change', pageNum)
}

/**
 * 分页数量
 */
const pageNums = computed(() =>
  doc.value ? [...Array(doc.value.numPages + 1).keys()].slice(1) : [],
)

/**
 * 嵌入项每一项样式
 */
const _embedItemStyle = computed(() => {
  return {}
})

watch(pageNums, (newPageNums: number[]) => {
  pageVisibility.value = { [newPageNums[0]]: true }
  nextTick(resetPageIntersectionObserver)
})

/**
 * 监听激活的页码变化，触发页面滚动
 */
watch(__activePageNum__, (newVal: number) => {
  const idx = +newVal - 1
  const pageDom = pageRefs.value[idx]
  console.log('pageDom', pageDom)
  if (pageDom) {
    pageDom.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
})

onBeforeUnmount(() => {
  pageIntersectionObserver?.disconnect()
})
</script>

<template>
  <div class="preview-thumb">
    <div
      v-for="pageNum in pageNums"
      :key="pageNum"
      ref="pageRefs"
      :class="['pdf-embed__item', __activePageNum__ == pageNum && 'is-active']"
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
  </div>
</template>

<style lang="less" scoped>
.preview-thumb {
}

.pdf-embed__item {
  max-width: 150px;
  margin: 0 auto;
  cursor: pointer;
  position: relative;
  outline: 1px solid #ddd;
  scroll-margin-block-start: 10px;
  & + .pdf-embed__item {
    margin-top: 12px;
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
  background: rgba(0, 0, 0, 0.28);
  font-size: 12px;
  color: #fff;
}
</style>
