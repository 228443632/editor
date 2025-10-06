<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/10/25 PM3:04
 -->
<!--setup-->
<script setup lang="ts">
import Content from './components/Content.vue'
import { useElementSize } from '@vueuse/core'
import Left from '@/views/sign-editor/components/Left.vue'
import Right from './components/Right.vue'
import { cssUtil } from '@/views/doc-editor/utils/css-util.ts'
import type { IParamsCompItem } from '@/views/sign-editor/types/types.ts'
import Footer from './components/Footer.vue'
import { deepClone, noop, uuid } from 'sf-utils2'
import Header from './components/Header.vue'
import { pageUtils } from '@/views/sign-editor/utils/commons.ts'
import { isInIframe } from '@/views/doc-editor/utils/common-util.ts' // 头部

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
  leftAsideGap: 16,

  /** 右侧宽度 */
  rightAsideWidth: 280,

  /** 每页距离大小 */
  perPageGap: pageUtils.perPageGap,
})

const activePageNum = ref(1)
const contentRef = ref<InstanceType<typeof Content>>() // 内容
const signContext = ref({
  /** 缩小/放大比例*/
  scaleFactor: 0,

  /** 分页方法*/
  pageUtils,

  /** 文件来源 */
  source: undefined,

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
    const paramsCompList = signContext.value.paramsCompList || []
    return pageUtils.expandCompParams(paramsCompList)
  }),

  /**
   * 移除参数组件
   * @param nodeData
   */
  removeParamsComp: (nodeData: IParamsCompItem) => {
    nodeData ||= signContext.value.activeCompParam
    if (!nodeData) return
    const idx = signContext.value.paramsCompList.findIndex(
      (item) => item.key === nodeData.key,
    )
    if (idx >= 0) signContext.value.paramsCompList.splice(idx, 1)
  },

  /**
   * 应用多页参数组件
   * @param nodeData
   */
  applyMultiPageParamsComp: (nodeData: IParamsCompItem) => {
    const top = nodeData.top
    console.log(
      '分页',
      signContext.value.getPageNumByTop(top),
      signContext.value.getPageOffsetTopByTop(top),
    )
    const { offsetTop, pageNum: currentPageNum } =
      signContext.value.getPageOffsetTopByTop(top)
    signContext.value.removeParamsComp(nodeData)

    const contentPageNums = signContext.value.contentPageNums
    return Array.from({ length: contentPageNums }).map((_, idx) => {
      const pageNum = idx + 1
      const nodeDataClone = deepClone(nodeData)
      nodeDataClone.key = uuid()
      nodeDataClone.top =
        offsetTop + signContext.value.getAbsoluteTopByPageNum(pageNum)
      signContext.value.paramsCompList.push(nodeDataClone)
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
    // const isExist = signContext.value.paramsCompList.some(
    //   (item) => item.key === nodeData.key,
    // )
    // if (!isExist) return
    signContext.value.activeCompParam = nodeData
    signContext.value.paramsCompList.forEach((item) => {
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
  signContext.value.activeCompParam = undefined
  signContext.value.paramsCompList.forEach((item) => {
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
    '--per-page-gap': signContext.value.isExporting
      ? '0px'
      : `${layoutSize.value.perPageGap}px`,
  }
})

/* 监听 */
watch(layoutWidth, (val: number) => {
  layoutSize.value.layoutWidth = val
})

watchEffect(() => {
  signContext.value.anchorInfo.active = activePageNum.value
})

/* 周期 */
onMounted(() => {
  // 初始化成功
  window.dispatchEvent(new CustomEvent('editor-ready'))

  if (!isInIframe()) {
    signContext.value.source = './3.pdf'
  }
})

/* 暴露 */
defineExpose({
  $: proxy.$,
})

// 尺寸大小
provide('__layoutSize__', layoutSize)

// 当前激活的页码
provide('__activePageNum__', activePageNum)

// 预览上下文
provide('__signContext__', signContext)

window['pageSignEditor'] = {
  signContext,
  layoutSize,
  activePageNum,
}
</script>

<!--render-->
<template>
  <div
    v-if="signContext.source"
    ref="rootRef"
    v-spin="{
      loading: signContext.loading > 0,
      size: 'small',
      showLoadingText: false,
      mask: true,
    }"
    :class="['sign-editor', signContext.isExporting && 'is-exporting']"
    :style="_rootStyle"
    @mousedown="onClickPreviewEditor"
    @contextmenu.prevent.stop
  >
    <Header class="sign-editor__header"></Header>
    <div class="flex-1 h-0 flex">
      <Left></Left>
      <Content ref="contentRef"></Content>
      <Right></Right>
    </div>

    <Footer class="sign-editor__footer"></Footer>
  </div>
</template>

<!--style-->
<style scoped lang="less">
.sign-editor {
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

.sign-editor__footer {
  height: 31px;
  flex: none;
  width: 100%;
  background: white;
  border-top: 1px solid var(--umo-border-color);
}
</style>
