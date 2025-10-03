<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 03/10/25 PM5:15
 -->
<!--setup-->
<script setup lang="ts">
import Drager from 'es-drager'
import { rafThrottle, def } from 'sf-utils2'
import type { IParamsCompItem } from '@/views/preview-editor/types/types.js'

const { proxy } = getCurrentInstance()
const props = defineProps({
  /**
   * 节点数据
   */
  nodeData: {
    type: Object as PropType<IParamsCompItem>,
    default: () => ({}),
  },
})
const emit = defineEmits([])

/* 状态 */
const _nodeData = useVModel(props, 'nodeData', emit, { passive: true })
const __previewContext__ = inject('__previewContext__') // 预览上下文
const attrs = useAttrs()
const scrollViewRef = computed(() => __previewContext__.value.contentElRef)

/* 方法 */

/**
 * 拖拽中
 * @param left
 * @param top
 */
const onDrag = ({ left, top }: { left: number; top: number }) => {
  _nodeData.value.left = left
  _nodeData.value.top = top
}
const rafThrottleOnDrag = rafThrottle(onDrag)

/**
 * 选择节点
 */
const onSelectNode = (startE: MouseEvent) => {
  const inRectNums = __previewContext__.value.paramsCompList.filter(
    (item) => item.isInRect,
  )

  if (inRectNums?.length > 1) {
    // 多个
    inRectNums.forEach((item) => {
      def(item, '_snapshotLeft', item.left)
      def(item, '_snapshotTop', item.top)
    })
    scrollViewRef.value.addEventListener('mousemove', mousemove)
    scrollViewRef.value.addEventListener('mouseup', mouseup)
    return
  }
  __previewContext__.value.selectParamsComp(_nodeData.value)

  function mousemove(e: MouseEvent) {
    const diffX = e.clientX - startE.clientX
    const diffY = e.clientY - startE.clientY
    updateInRectTopLeft(diffX, diffY)
  }

  function mouseup(e: MouseEvent) {
    scrollViewRef.value.removeEventListener('mousemove', mousemove)
    scrollViewRef.value.removeEventListener('mouseup', mouseup)

    const diffX = e.clientX - startE.clientX
    const diffY = e.clientY - startE.clientY
    updateInRectTopLeft(diffX, diffY)
  }

  function updateInRectTopLeft(diffX: number, diffY: number) {
    inRectNums.forEach((item) => {
      item.left = item._snapshotLeft + diffX
      item.top = item._snapshotTop + diffY
    })
  }
}

/* 计算 */
/**
 * 是否当前组件激活
 */
const _isActive = computed(() => {
  return __previewContext__.value.activeCompParam?.key == _nodeData.value.key
})

/* 监听 */

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({
  $: proxy.$,
})
</script>

<!--render-->
<template>
  <Drager
    ref="dragerRef"
    :rotatable="true"
    :boundary="false"
    tag="div"
    :skewable="true"
    :snap-to-grid="false"
    :left="Number(_nodeData.left)"
    :top="Number(_nodeData.top)"
    :min-width="14"
    :min-height="14"
    :disabled="_nodeData.isInRect"
    :z-index="10"
    :class="[
      'is-draggable',
      _isActive ? 'inline-wrap--active' : 'line-wrap--inactive',
      _nodeData.isInRect && 'line-wrap--in-rect',
    ]"
    v-bind="attrs"
    @drag="rafThrottleOnDrag"
    @mousedown.stop="onSelectNode"
  >
    <template #default>
      <slot></slot>
    </template>
  </Drager>
</template>

<!--style-->
<style scoped lang="less">
:deep {
  .es-drager-dot-handle {
    display: none;
  }
  .es-drager-rotate {
    display: none;
  }
}

.es-drager {
  scroll-margin-top: 38px;
}
.es-drager.selected.border {
  //outline-style: dashed;
  //outline-width: 1px;
  outline: none;
}

.es-drager.es-drager.inline-wrap--active {
  outline: 2px solid var(--umo-primary-color);
}

.line-wrap--inactive {
  outline: 1px dashed #999;
}
.line-wrap--in-rect {
  outline: solid 2px var(--umo-primary-color);
}
</style>
