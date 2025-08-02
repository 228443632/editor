<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 30/07/25 PM11:28
 -->
<!--setup-->
<script setup lang="ts">
import { type PaginationBreakOptions } from './pagination-break'
import type { EditorView } from '@codemirror/view'
import PageHeader from './components/PageHeader.vue'
import PageFooter from './components/PageFooter.vue'
import { def } from 'sf-utils2'
// import { useElementBounding } from '@vueuse/core'
const props = defineProps({
  /**
   * 分页参数选项
   */
  pageOptions: {
    type: Object as PropType<PaginationBreakOptions>,
    default: () => ({}),
  },

  /**
   * 页码总数
   */
  pageCount: {
    type: Number,
    default: () => 1,
  },

  /**
   * 编辑器view 视图
   */
  view: {
    type: Object as PropType<EditorView>,
    default: () => null,
  },
})
const emit = defineEmits([])

/* 状态 */
// const pageBodyRef = ref<HTMLDivElement>()
// const pageBodyRect = useElementBounding(pageBodyRef)

const proxy = getCurrentInstance()

const _pageGap = props.pageOptions.pageGap
const _pageHeaderHeight = props.pageOptions.pageHeaderHeight
const _pageBodyHeight = props.pageOptions.pageHeight - _pageHeaderHeight * 2
const _pageBreakBackground = props.pageOptions.pageBreakBackground

/* 方法 */

function getPageBreakStyle() {
  const breakerWidth = props.view.dom.clientWidth
  return {
    width: `calc(${breakerWidth}px)`,
    // marginLeft: `calc(calc(calc(${breakerWidth}px - 100%) / 2) - calc(${breakerWidth}px - 100%))`,
    // marginRight: `calc(calc(calc(${breakerWidth}px - 100%) / 2) - calc(${breakerWidth}px - 100%))`,
    position: 'relative',
    float: 'left',
    clear: 'both',
    left: 0,
    right: 0,
    zIndex: 2,
  }
}

/**
 * 撑起容器 样式
 * @param pageIndex
 */
function getPageSpacerStyle(pageIndex: number) {
  return {
    position: 'relative',
    float: 'left',
    clear: 'both',
    marginTop: `${_pageBodyHeight}px`,
  }
}

/**
 * 获取页脚样式
 */
function getPageFooterStyle() {
  return {
    height: `${_pageHeaderHeight}px`,
    footerRight: null,
  }
}

/**
 * 获取页面间隔样式
 */
function getPageGapStyle() {
  return {
    height: `${_pageGap}px`,
    borderLeft: '1px solid',
    borderRight: '1px solid',
    position: 'relative',
    width: `calc(100% + 2px)`,
    left: '-1px',
    backgroundColor: _pageBreakBackground,
    borderLeftColor: _pageBreakBackground,
    borderRightColor: _pageBreakBackground,
  }
}

/**
 * 获取页面内容体样式
 * @param pageIndex
 */
function getPageBodyStyle(pageIndex: number) {
  const marginTop =
    (props.pageOptions.pageGap + props.pageOptions.pageHeight) * pageIndex

  return {
    position: 'absolute',
    width: 'calc(100% - 2 * var(--umo-page-margin-left))',
    left: 'var(--umo-page-margin-left)',
    marginTop: `${marginTop}px`,
    height: `${_pageBodyHeight}px`,
    pointerEvents: 'none',
    zIndex: 100,
    // backgroundColor: 'red',
    outline: '2px solid blue',
  }
}

function getPosAll() {
  const domRect = props.view.dom.getBoundingClientRect()
  const pageNumPosList = [] as {
    top: number
    left: number
    right: number
    bottom: number
    height: number
    width: number
  }[]
  for (let i = 0; i < props.pageCount; i++) {
    const baseIntervalMt =
      (props.pageOptions.pageGap + props.pageOptions.pageHeight) * i
    const marginTop = baseIntervalMt + (i == 0 ? 0 : _pageHeaderHeight)
    const tempRect =
      proxy.refs?.[`pageBodyRef$${i + 1}`]?.[0]?.getBoundingClientRect?.()
    const top = tempRect.top - domRect.top
    const left = tempRect.left - domRect.left
    pageNumPosList.push({
      top,
      left,
      bottom: top + tempRect.height,
      right: left + tempRect.width,
      width: tempRect.width,
      height: tempRect.height,
    })
  }
  return pageNumPosList
}

/* 计算 */

const _headerStyle = computed(() => {
  return {
    position: 'relative',
    height: `${_pageHeaderHeight}px`,
  }
})

/* 监听 */

/* 周期 */
onMounted(() => {
  def(props.view.dom, '__pageNumPosList', getPosAll())
})

/* 暴露 */
defineExpose({})
</script>

<!--render-->
<template>
  <div
    v-for="(item, index) in pageCount"
    :key="index"
    class="sf-page__sep-wrap"
    :page-num="index + 1"
    :total="pageCount"
  >
    <!-- 第一页的时候 -->
    <template v-if="index == 0">
      <!-- 页眉 -->
      <div class="sf-page__header" :style="_headerStyle" :page-num="index + 1">
        <PageHeader
          :page-options="pageOptions"
          :page-num="index + 1"
          :total="pageCount"
        ></PageHeader>
      </div>
    </template>

    <!--  撑起容器  -->
    <div
      class="sf-page__spacer"
      :style="getPageSpacerStyle(index)"
      :page-num="index + 1"
    ></div>

    <!--  内容体  -->
    <div
      :ref="`pageBodyRef$${index + 1}`"
      class="sf-page__body"
      :style="getPageBodyStyle(index)"
      :page-num="index + 1"
    >
<!--      <span class="p-2px bg-[#333] text-[#fff] text-12px">{{-->
<!--        proxy.refs?.[`pageBodyRef$${index + 1}`]?.[0]?.getBoundingClientRect?.()-->
<!--      }}</span>-->
    </div>

    <div
      class="sf-page__breaker"
      :style="getPageBreakStyle()"
      :page-num="index + 1"
    >
      <!-- 页尾 -->
      <div
        class="sf-page__footer"
        :style="getPageFooterStyle()"
        :page-num="index + 1"
      >
        <PageFooter :page-num="index + 1" :total="pageCount"></PageFooter>
      </div>

      <!--  最后一页的时候    -->
      <template v-if="index + 1 < pageCount">
        <!-- 页间隔 -->
        <div
          class="sf-page__gap"
          :style="getPageGapStyle()"
          :page-num="index + 1"
        ></div>

        <!-- 页眉 -->
        <div
          :class="['sf-page__header', 'is-next']"
          :style="_headerStyle"
          :page-num="index + 2"
        >
          <PageHeader
            :page-options="pageOptions"
            :page-num="index + 2"
            :total="pageCount"
          ></PageHeader>
        </div>
      </template>
    </div>
  </div>
</template>

<!--style-->
<style lang="less"></style>
