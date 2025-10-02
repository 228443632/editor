<!--
 * @Description: 内容区域
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/10/25 PM3:05
 -->
<!--default-->
<script setup lang="ts">
import VuePdfEmbed, { useVuePdfEmbed } from 'vue-pdf-embed'
import { cssUtil } from '@/views/doc-editor/utils/css-util.ts'
import { div } from 'sf-utils2'

const props = defineProps({})
const emit = defineEmits([])

const __activePageNum__ = inject('__activePageNum__')

const pageRefs = ref([]) // 页面元素集合
const pageVisibility = ref({}) // 页面可见性
let pageIntersectionObserver: IntersectionObserver

const a4 = cssUtil.getPaperSize('A4')

const { doc } = useVuePdfEmbed({
  source: './2.pdf',
  onProgress: (progressParams) => {
    const progress = div(progressParams.loaded / progressParams.total)
    console.log('c', progress, progress == '1')
  },
})
console.log('doc', doc, doc.value)

/**
 * 分页数量
 */
const pageNums = computed(() =>
  doc.value ? [...Array(doc.value.numPages + 1).keys()].slice(1) : [],
)

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
 * 嵌入项每一项样式
 */
const _embedItemStyle = computed(() => {
  return {
    width: `${a4._basePx.w}px`,
    height: `${a4._basePx.h}px`,
    // margin: `${a4._basePx.mt}px ${a4._basePx.ml}px ${a4._basePx.mb}px ${a4._basePx.mr}px`,
    // padding: `${a4._basePx.pt}px ${a4._basePx.pl}px ${a4._basePx.pb}px ${a4._basePx.pr}px`,
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

watch(pageNums, (newPageNums: number[]) => {
  pageVisibility.value = { [newPageNums[0]]: true }
  nextTick(resetPageIntersectionObserver)
})

onBeforeUnmount(() => {
  pageIntersectionObserver?.disconnect()
})
</script>

<template>
  <div class="pdf-preview umo-scrollbar">
    <div class="pdf-embed__wrap">
      <div
        v-for="pageNum in pageNums"
        :key="pageNum"
        ref="pageRefs"
        class="pdf-embed__item"
        :style="{
          ..._embedItemStyle,
        }"
      >
        <vue-pdf-embed
          v-if="pageVisibility[pageNum]"
          :source="doc"
          :page="pageNum"
        />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.pdf-preview {
  flex: 1;
  overflow: auto;
  height: 100vh;
  width: 100vw;
  padding: 16px 0;
  scroll-behavior: smooth;
}

.pdf-embed__wrap {
  width: fit-content;
  margin: 0 auto;
}

.pdf-embed__item {
  margin: 0 auto;
  box-shadow: 0 0 4px 2px rgba(154, 161, 177, 0.15);
  scroll-margin-block-start: 12px;
  & + .pdf-embed__item {
    margin-top: 12px;
  }
}

.vue-pdf-embed__page {
  box-shadow: 0 2px 8px 4px rgba(0, 0, 0, 0.1);
}
</style>
