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
const _pageGap = props.pageOptions.pageGap
const _pageHeaderHeight = props.pageOptions.pageHeaderHeight
const _pageHeight = props.pageOptions.pageHeight - _pageHeaderHeight * 2
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

function getPageStyle(pageIndex: number) {
  return {
    position: 'relative',
    float: 'left',
    clear: 'both',
    marginTop:
      pageIndex == 0
        ? `calc(${_pageHeaderHeight}px + ${_pageHeight}px)`
        : `${_pageHeight}px`,
  }
}

function getPageFooterStyle() {
  // const footerRight = pageOptions.footerRight.replace(
  //   '{page}',
  //   `<span class="sf-page-number"></span>`,
  // )
  // const footerLeft = pageOptions.footerLeft.replace(
  //   '{page}',
  //   `<span class="sf-page-number"></span>`,
  // )
  return {
    height: `${_pageHeaderHeight}px`,
    footerRight: null,
  }
}

function getPageGapStyle() {
  // pageSpace.style.setProperty('width', 'calc(100% + 2px)', 'important')
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

/* 计算 */

const _headerStyle = computed(() => {
  return {
    position: 'relative',
    height: `${_pageHeaderHeight}px`,
  }
})

/* 监听 */

/* 周期 */
onMounted(() => {})

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
      <div class="sf-page__header" :style="_headerStyle">
        <PageHeader
          :page-options="pageOptions"
          :page-num="index + 1"
          :total="pageCount"
        ></PageHeader>
      </div>
    </template>

    <div class="sf-page__spacer" :style="getPageStyle(index)"></div>
    <div class="sf-page__breaker" :style="getPageBreakStyle()">
      <!-- 页尾 -->
      <div class="sf-page__footer" :style="getPageFooterStyle()">
        <PageFooter :page-num="index + 1" :total="pageCount"></PageFooter>
      </div>

      <!--  最后一页的时候    -->
      <template v-if="index + 1 < pageCount">
        <!-- 页间隔 -->
        <div class="sf-page__gap" :style="getPageGapStyle()"></div>

        <!-- 页眉 -->
        <div :class="['sf-page__header', 'is-next']" :style="_headerStyle">
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
