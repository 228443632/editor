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
})

const activePageNum = ref(1)

/* 方法 */

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
  }
})

/* 监听 */
watch(layoutWidth, (val: number) => {
  layoutSize.value.layoutWidth = val
})

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({
  $: proxy.$,
})

// 当前激活的页码
provide('__activePageNum__', activePageNum)
</script>

<!--render-->
<template>
  <div ref="rootRef" class="preview-editor" :style="_rootStyle">
    <Left></Left>
    <Content></Content>
    <Right></Right>
  </div>
</template>

<!--style-->
<style scoped lang="less">
.preview-editor {
  display: flex;
  background-color: var(--umo-container-background);
  height: 100vh;
  width: 100%;
}
</style>
