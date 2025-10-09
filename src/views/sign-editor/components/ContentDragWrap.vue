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
import { pageUtils } from '@/views/sign-editor/utils/commons.ts'

const { proxy } = getCurrentInstance()
const props = defineProps({
  /**
   * 节点数据
   */
  nodeData: {
    type: Object as PropType<IParamsCompItem>,
    default: () => ({}),
  },

  /**
   * 是否校准位置
   */
  isCorrectPos: {
    type: Boolean,
    default: true,
  },

  /**
   * 是否展示删除
   */
  isShowDelete: {
    type: Boolean,
    default: true,
  },
})
const emit = defineEmits(['delete'])

/* 状态 */
const _nodeData = useVModel(props, 'nodeData', emit, { passive: true })
_nodeData.value.translateX ??= 0
_nodeData.value.translateY ??= 0
const __signContext__ = inject('__signContext__') // 预览上下文
const attrs = useAttrs()
const scrollViewRef = computed(() => __signContext__.value.contentElRef)
const dragerRef = ref<InstanceType<typeof Drager>>()
const { width: dragerWidth, height: dragerHeight } =
  useElementBounding(dragerRef)

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
  const inRectList = __signContext__.value.paramsCompList.filter(
    (item) => item.isInRect,
  )

  onDragStart()

  scrollViewRef.value.addEventListener('mousemove', mousemove)
  document.body.addEventListener('mouseup', mouseup)

  inRectList.forEach((item) => {
    def(item, '_snapshotLeft', item.left)
    def(item, '_snapshotTop', item.top)
  })

  if (inRectList?.length > 1) {
    // 多个
  } else {
    __signContext__.value.selectParamsComp(_nodeData.value)
  }

  /**
   * 鼠标移动
   * @param e
   */
  function mousemove(e: MouseEvent) {
    const diffX = e.clientX - startE.clientX
    const diffY = e.clientY - startE.clientY
    updateInRectTopLeft(diffX, diffY)
  }

  /**
   * 拖拽结束
   * @param e
   */
  function mouseup(e: MouseEvent) {
    scrollViewRef.value.removeEventListener('mousemove', mousemove)
    document.body.removeEventListener('mouseup', mouseup)

    const diffX = e.clientX - startE.clientX
    const diffY = e.clientY - startE.clientY
    updateInRectTopLeft(diffX, diffY)
    onDragEnd()
  }

  /**
   * 批量更新 位置 left top
   * @param diffX
   * @param diffY
   */
  function updateInRectTopLeft(diffX: number, diffY: number) {
    inRectList.forEach((item) => {
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

  // update
  _nodeData.value.translateY = _nodeData.value.translateY + diffH
  __signContext__.value.paramsCompList.forEach((item) => {
    if (item.isInRect && item.key != _nodeData.value.key) {
      item.translateY = item.translateY + diffH
    }
  })
  onScroll._oldScrollTop = target.scrollTop
}
onScroll._oldScrollTop = scrollViewRef.value.scrollTop
const rafThrottleOnScroll = rafThrottle(onScroll)

/**
 * 添加滚动监听
 */
function addScrollListener() {
  if (!scrollViewRef.value) return
  removeScrollListener()
  onScroll._oldScrollTop = scrollViewRef.value.scrollTop
  scrollViewRef.value.addEventListener('scroll', rafThrottleOnScroll)
}

/**
 * 移除滚动监听
 */
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
  _nodeData.value.top = _nodeData.value.top + _nodeData.value.translateY
  _nodeData.value.translateY = 0
  removeScrollListener()

  correctPosList()
}

/**
 * 调整正确位置
 */
function correctPosList() {
  // 更正位置
  if (props.isCorrectPos) {
    pageUtils.correctPos(_nodeData.value)
    inRectParamsList.value.forEach((item) => {
      if (item.key != _nodeData.value.key) {
        pageUtils.correctPos(item)
      }
    })
  }
}

/* 计算 */
/**
 * 是否当前组件激活
 */
const _isActive = computed(() => {
  return __signContext__.value.activeCompParam?.key == _nodeData.value.key
})

/**
 * 处于rect内
 */
const inRectParamsList = computed(() =>
  __signContext__.value.paramsCompList.filter((item) => item.isInRect),
)

/* 监听 */

watchEffect(() => {
  _nodeData.value.width = dragerWidth.value || 0
  _nodeData.value.height = dragerHeight.value || 0
})

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({
  $: proxy.$,

  dragerRef,

  dragerWidth,

  dragerHeight,
})
</script>

<!--render-->
<template>
  <span
    class="e-drager-wrap"
    :style="{
      '--y': _nodeData.translateY + 'px',
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
      @dragend="onDragEnd"
      :z-index="11"
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
        <t-tooltip
          v-if="isShowDelete"
          theme="light"
          placement="top"
          :show-arrow="false"
          destroy-on-close
          content="删除"
        >
          <span class="line-wrap__delete" @click="emit('delete')">
            <t-icon name="delete" size="12px" class="text-white"></t-icon>
          </span>
        </t-tooltip>
        <slot></slot>
        <div class="line-wrap__locate">
          <div class="locate__item">X: {{ ~~_nodeData.left }}</div>
          <div class="locate__item">Y: {{ ~~_nodeData.top }}</div>

          <!--           <div class="locate__item">-->
          <!--            X: {{ ~~_nodeData.left + ~~(dragerWidth / 2) }}-->
          <!--          </div>-->
          <!--          <div class="locate__item">-->
          <!--            Y: {{ ~~_nodeData.top + ~~(dragerHeight / 2) }}-->
          <!--          </div>-->
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
  z-index: 11;
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

.es-drager.es-drager.inline-wrap--active,
.es-drager.line-wrap--in-rect {
  outline: 2px solid var(--umo-primary-color);
  box-shadow: 0 0 10px rgba(@primary-color, 0.6);
  background: white;
}

.line-wrap--inactive {
  outline: 1px dashed @primary-color;
}

.line-wrap--in-rect,
.inline-wrap--active {
  .line-wrap__locate {
    background-color: rgba(@primary-color, 1);
  }
}

.line-wrap__delete {
  @apply bg-error flex items-center justify-center p-1 rounded-full absolute right-0 top-0;
  transform: translate(50%, -50%);
  cursor: pointer;
  z-index: 100;
}

.line-wrap__locate {
  white-space: nowrap;
  position: absolute;
  top: calc(100% + 1px);
  left: -1px;
  box-sizing: border-box;
  min-width: calc(100% + 2px);
  padding: 2px 6px;
  font-size: 14px;
  line-height: 20px;
  color: #fff;
  user-select: none;
  background-color: #595959;
  opacity: 0.9;
  display: flex;
  gap: 16px;
  flex-direction: row;
  .locate__item {
    flex: 1;
    text-align: center;
  }
}
</style>
