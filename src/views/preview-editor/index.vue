<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/10/25 PM3:04
 -->
<!--setup-->
<script setup lang="ts">
import Content from './components/Content.vue'
import { useElementSize } from '@vueuse/core'
import Left from '@/views/preview-editor/components/Left.vue'
import Right from './components/Right.vue'
import { cssUtil } from '@/views/doc-editor/utils/css-util.ts'
import type { IParamsCompItem } from '@/views/preview-editor/types/types.ts'
import Footer from './components/Footer.vue'
import { deepClone, noop, uuid } from 'sf-utils2'
import Header from './components/Header.vue'
import { pageUtils } from '@/views/preview-editor/utils/commons.ts' // 头部

const { proxy } = getCurrentInstance()
const props = defineProps({})
const emit = defineEmits([])

/* 状态 */
const a4 = cssUtil.getPaperSize('A4')
const rootRef = ref<HTMLDivElement>()
const { width: layoutWidth } = useElementSize(rootRef)
const layoutSize = ref({
  /** 布局宽度 */
  layoutWidth: undefined,

  /** 左侧边栏宽度 老的 286*/
  leftAsideWidth: 250,

  /** 编辑器宽度*/
  editorWidth: a4._basePx.w,

  /** 左侧距离左侧距离*/
  leftAsideLeft: undefined,

  /** 左侧边栏与左侧边栏之间的间隔 */
  leftAsideGap: 24,

  /** 右侧宽度 */
  rightAsideWidth: 280,

  /** 每页距离大小 */
  PerPageGap: pageUtils.perPageGap,
})

const activePageNum = ref(1)
const contentRef = ref<InstanceType<typeof Content>>() // 内容
const previewContext = ref({
  /** 分页方法*/
  pageUtils,

  /** 文件来源 */
  source: './2.pdf',

  /** 是否正在导出中 */
  isExporting: false,

  /** loading */
  loading: 0,

  contentElRef: computed(() => unrefElement(contentRef)),

  /**
   * 内嵌的pdf包裹容器
   */
  embedPdfWrapRef: computed(() => contentRef?.value?.embedPdfWrapRef),

  /**
   * 参数
   */
  paramsCompList: [] as IParamsCompItem[],

  _paramsCompList: computed(() => {
    const paramsCompList = previewContext.value.paramsCompList || []
    return pageUtils.expandCompParams(paramsCompList)
  }),

  /**
   * 移除参数组件
   * @param nodeData
   */
  removeParamsComp: (nodeData: IParamsCompItem) => {
    nodeData ||= previewContext.value.activeCompParam
    if (!nodeData) return
    const idx = previewContext.value.paramsCompList.findIndex(
      (item) => item.key === nodeData.key,
    )
    if (idx >= 0) previewContext.value.paramsCompList.splice(idx, 1)
  },

  /**
   * 应用多页参数组件
   * @param nodeData
   */
  applyMultiPageParamsComp: (nodeData: IParamsCompItem) => {
    const top = nodeData.top
    console.log(
      '分页',
      previewContext.value.getPageNumByTop(top),
      previewContext.value.getPageOffsetTopByTop(top),
    )
    const { offsetTop, pageNum: currentPageNum } =
      previewContext.value.getPageOffsetTopByTop(top)
    previewContext.value.removeParamsComp(nodeData)

    const contentPageNums = previewContext.value.contentPageNums
    return Array.from({ length: contentPageNums }).map((_, idx) => {
      const pageNum = idx + 1
      const nodeDataClone = deepClone(nodeData)
      nodeDataClone.key = uuid()
      nodeDataClone.top =
        offsetTop + previewContext.value.getAbsoluteTopByPageNum(pageNum)
      previewContext.value.paramsCompList.push(nodeDataClone)
      return {
        pageNum,
        nodeData: nodeDataClone,
        isActive: currentPageNum === pageNum,
      }
    })
  },

  /**
   * 根据页码获取 绝对top
   * @param pageNum
   */
  getAbsoluteTopByPageNum: pageUtils.getAbsoluteTopByPageNum,
  /**
   * 根据top获取当前所处的页页的偏移量 offsetTop
   * @param top
   */
  getPageOffsetTopByTop: pageUtils.getPageOffsetTopByTop,

  /**
   * 根据top 获取页码
   * @param top
   */
  getPageNumByTop: pageUtils.getPageNumByTop,

  /**
   * 当前激活的参数组件
   */
  activeCompParam: undefined,

  /**
   * 选中参数组件
   * @param nodeData
   */
  selectParamsComp: (nodeData: IParamsCompItem) => {
    // const isExist = previewContext.value.paramsCompList.some(
    //   (item) => item.key === nodeData.key,
    // )
    // if (!isExist) return
    previewContext.value.activeCompParam = nodeData
    previewContext.value.paramsCompList.forEach((item) => {
      item.isInRect = false
    })
  },

  /** 是否在拖拽中 */
  isDragging: false,

  /** 左侧是否加载结束 */
  leftInitial: false,

  /** 内容是否加载结束 */
  contentInitial: false,

  /** 内容分页数 */
  contentPageNums: 0,

  /** 右侧是否加载结束 */
  rightInitial: false,

  /** 锚点*/
  anchorInfo: {},

  /** 一次性加载所有pdf页面，主要是为了导出功能*/
  loadAllPdfPagesRaf: noop,
})

/* 方法 */

/**
 * 点击预览的编辑器
 */
const onClickPreviewEditor = () => {
  previewContext.value.activeCompParam = undefined
  previewContext.value.paramsCompList.forEach((item) => {
    item.isInRect = false
  })
  console.log('点击了预览的编辑器')
}

/* 计算 */
/**
 * 根节点样式
 */
const _rootStyle = computed(() => {
  return {
    '--layout-width': `${layoutSize.value.layoutWidth}px`,
    '--editor-width': `${layoutSize.value.editorWidth}px`,
    '--left-aside-width': `${layoutSize.value.leftAsideWidth}px`,
    '--left-aside-left': `${layoutSize.value.leftAsideLeft}px`,
    '--left-aside-gap': `${layoutSize.value.leftAsideGap}px`,
    '--right-aside-width': `${layoutSize.value.rightAsideWidth}px`,
    '--padding-top': '16px',
    '--padding-bottom': '16px',
    '--padding-left': '16px',
    '--padding-right': '16px',
    '--per-page-gap': `${layoutSize.value.PerPageGap}px`,
  }
})

/* 监听 */
watch(layoutWidth, (val: number) => {
  layoutSize.value.layoutWidth = val
})

watchEffect(() => {
  previewContext.value.anchorInfo.active = activePageNum.value
})

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({
  $: proxy.$,
})

// 尺寸大小
provide('__layoutSize__', layoutSize)

// 当前激活的页码
provide('__activePageNum__', activePageNum)

// 预览上下文
provide('__previewContext__', previewContext)
</script>

<!--render-->
<template>
  <div
    v-spin="{
      loading: previewContext.loading > 0,
      size: 'small',
      showLoadingText: false,
      mask: true,
    }"
    ref="rootRef"
    :class="['preview-editor', previewContext.isExporting && 'is-exporting']"
    :style="_rootStyle"
    @mousedown="onClickPreviewEditor"
    @contextmenu.prevent.stop
  >
    <Header class="preview-editor__header"></Header>
    <div class="flex-1 h-0 flex">
      <Left></Left>
      <Content ref="contentRef"></Content>
      <Right></Right>
    </div>

    <Footer class="preview-editor__footer"></Footer>
  </div>
</template>

<!--style-->
<style scoped lang="less">
.preview-editor {
  display: flex;
  background-color: var(--umo-container-background);
  height: 100vh;
  width: 100%;
  flex-direction: column;
}

:deep {
  [tabindex]:focus {
    outline: none;
  }
  .umo-scrollbar {
    outline: none;
  }
}

.preview-editor__footer {
  height: 31px;
  flex: none;
  width: 100%;
  background: white;
  border-top: 1px solid var(--umo-border-color);
}
</style>
