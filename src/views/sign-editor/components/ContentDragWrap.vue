<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 03/10/25 PM5:15
 -->
<!--setup-->
<script setup lang="ts">
import Drager from 'es-drager'
import { rafThrottle, def } from 'sf-utils2'
import type { IParamsCompItem } from '@/views/sign-editor/types/types.js'

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
const emit = defineEmits(['delete'])

/* 状态 */
const _nodeData = useVModel(props, 'nodeData', emit, { passive: true })
const __signContext__ = inject('__signContext__') // 预览上下文
const attrs = useAttrs()
const scrollViewRef = computed(() => __signContext__.value.contentElRef)
const dragerRef = ref<InstanceType<typeof Drager>>()
const translateY = ref(0)

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
  const inRectNums = __signContext__.value.paramsCompList.filter(
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
  __signContext__.value.selectParamsComp(_nodeData.value)

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

/**
 * 监听滚动
 * @param event
 */
function onScroll(event: Event) {
  const target = scrollViewRef.value as HTMLElement
  if (onScroll._oldScrollTop === target.scrollTop) return
  const diffH = target.scrollTop - onScroll._oldScrollTop
  // _nodeData.value.top = _nodeData.value.top + diffH
  translateY.value = translateY.value + diffH
  onScroll._oldScrollTop = target.scrollTop
}
onScroll._oldScrollTop = scrollViewRef.value.scrollTop

const rafThrottleOnScroll = rafThrottle(onScroll)

function addScrollListener() {
  if (!scrollViewRef.value) return
  removeScrollListener()
  onScroll._oldScrollTop = scrollViewRef.value.scrollTop
  scrollViewRef.value.addEventListener('scroll', rafThrottleOnScroll)
}
function removeScrollListener() {
  if (!scrollViewRef.value) return
  scrollViewRef.value.removeEventListener('scroll', rafThrottleOnScroll)
}

/**
 * 拖拽开始
 */
function onDragStart() {
  addScrollListener()
}

/**
 * 拖拽结束
 */
function onDragEnd() {
  _nodeData.value.top = _nodeData.value.top + translateY.value
  translateY.value = 0
  removeScrollListener()
}

/* 计算 */
/**
 * 是否当前组件激活
 */
const _isActive = computed(() => {
  return __signContext__.value.activeCompParam?.key == _nodeData.value.key
})

/* 监听 */

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({
  $: proxy.$,

  dragerRef,

  translateY
})
</script>

<!--render-->
<template>
  <span
    class="e-drager-wrap"
    :style="{
      '--y': translateY + 'px',
    }"
  >
    <Drager
      ref="dragerRef"
      :rotatable="true"
      :boundary="false"
      tag="div"
      :skewable="true"
      :snap-to-grid="false"
      :left="Number(_nodeData.left)"
      :top="Number(_nodeData.top)"
      width="fit-content"
      height="fit-content"
      :min-width="14"
      :min-height="14"
      :disabled="_nodeData.isInRect"
      @drag-start="onDragStart"
      @drag-end="onDragEnd"
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
        <span class="line-wrap__delete" @click="emit('delete')">
          <t-icon name="delete" size="12px" class="text-white"></t-icon>
        </span>
        <slot></slot>
        <div class="line-wrap__locate">
          <div class="locate__item">X: {{ ~~_nodeData.left }}</div>
          <div class="locate__item">Y: {{ ~~_nodeData.top }}</div>
        </div>
      </template>
    </Drager>
  </span>
</template>

<!--style-->
<style scoped lang="less">
@import '@/style/vars';

.e-drager-wrap {
  transform: translate3d(0, var(--y), 0);
  display: flex;
  //margin-left: var(--umo-page-margin-left);
  position: absolute;
  left: 0;
  top: 0;
  width: fit-content;
  height: fit-content;
}

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
  transform: translate3d(0, var(--y), 0);
}
.es-drager.selected.border {
  //outline-style: dashed;
  //outline-width: 1px;
  outline: none;
}

.es-drager.es-drager.inline-wrap--active {
  outline: 2px solid var(--umo-primary-color);
  box-shadow: 0 0 8px rgba(@primary-color, 0.4);
  background: white;
}

.line-wrap--inactive {
  outline: 1px dashed @primary-color;
}
.line-wrap--in-rect {
  outline: solid 2px var(--umo-primary-color);
}

.line-wrap__delete {
  @apply bg-error flex items-center justify-center p-1 rounded-full absolute right-0 top-0;
  transform: translate(50%, -50%);
  cursor: pointer;
  z-index: 10;
}

.line-wrap__locate {
  position: absolute;
  top: calc(100% + 1px);
  left: -1px;
  box-sizing: border-box;
  width: calc(100% + 2px);
  padding: 4px 6px;
  font-size: 14px;
  line-height: 20px;
  color: #fff;
  background-color: #595959;
  opacity: 0.9;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  .locate__item {
    flex: 1;
    text-align: center;
  }
}
</style>
