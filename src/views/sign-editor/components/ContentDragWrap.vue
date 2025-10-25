<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 03/10/25 PM5:15
 -->
<!--setup-->
<script setup lang="ts">
import Drager from 'es-drager'
import { rafThrottle, def, isNoNullable } from 'sf-utils2'
import type { IParamsCompItem } from '@/views/sign-editor/types/types.js'
import { pageUtils } from '@/views/sign-editor/utils/commons.ts'
import profile from '@/profile.ts'

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
_nodeData.value.scrollOffsetX ??= 0
_nodeData.value.scrollOffsetY ??= 0
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
  updateTopLeft(_nodeData.value, top, left)
}
const rafThrottleOnDrag = rafThrottle(onDrag)

/**
 * 更新位置
 * @param target
 * @param top
 * @param left
 */
function updateTopLeft(target: IParamsCompItem, top: number, left?: number) {
  target ||= _nodeData.value
  // console.log('debug02', top, left, target)
  if (target.keywords) {
    // 是关键字
    if (isNoNullable(left) && !Number.isNaN(left))
      target.offsetLeft = target.left = left
    target.offsetTop = target.top = top
  } else {
    if (isNoNullable(left) && !Number.isNaN(left)) target.left = left
    target.top = top
  }
}

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
      const left = item._snapshotLeft + diffX
      const top = item._snapshotTop + diffY
      updateTopLeft(item, top, left)
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
  _nodeData.value.scrollOffsetY = _nodeData.value.scrollOffsetY + diffH
  __signContext__.value.paramsCompList.forEach((item) => {
    if (item.isInRect && item.key != _nodeData.value.key) {
      item.scrollOffsetY = item.scrollOffsetY + diffH
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
  const top = _nodeData.value.top + _nodeData.value.scrollOffsetY
  updateTopLeft(null, top, null)
  _nodeData.value.scrollOffsetY = 0
  removeScrollListener()

  correctPosList()

  // 添加历史记录
  __signContext__.value.manalHistory.commit()
  console.log('onDragEnd')
}

/**
 * 调整正确位置
 */
function correctPosList() {
  // 更正位置
  if (props.isCorrectPos) {
    pageUtils.correctPos(_nodeData.value, __signContext__.value.contentPageNums)
    inRectParamsList.value.forEach((item) => {
      if (item.key != _nodeData.value.key) {
        pageUtils.correctPos(item, __signContext__.value.contentPageNums)
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

/**
 * 关键字位置偏移
 */
const _keywordsPosOffsetXY = computed(() => {
  const item = _nodeData.value
  const [originKeywordRect] = item.list || []
  if (!originKeywordRect) return
  const originOffsetX = +Number(
    originKeywordRect.left + originKeywordRect.width / 2,
  ).toFixed(0)
  const originOffsetY = +Number(
    originKeywordRect.top + originKeywordRect.height / 2,
  ).toFixed(0)

  const offsetX = +Number(item.left + dragerWidth.value / 2).toFixed(0)
  const offsetY = +Number(item.top + dragerHeight.value / 2).toFixed(0)
  return {
    offsetX: offsetX - originOffsetX,
    offsetY: offsetY - originOffsetY,
  }
})

/* 监听 */

watchEffect(() => {
  _nodeData.value.width = dragerWidth.value || 0
  _nodeData.value.height = dragerHeight.value || 0
})

/* 周期 */

onBeforeMount(() => {
  // console.log('debug03', _nodeData.value)
  // if (_nodeData.value.keywords) {
  //   // 关键字
  //   if (isNullable(_nodeData.value.left))
  //     _nodeData.value.left = _nodeData.value.offsetLeft
  //   if (isNullable(_nodeData.value.top))
  //     _nodeData.value.top = _nodeData.value.offsetTop
  // }
  // _nodeData.value.left ??= 0
  // _nodeData.value.top ??= 0
})

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
    :class="['e-drager-wrap', _nodeData.keywords && 'is-keywords']"
    :style="{
      '--y': _nodeData.scrollOffsetY + 'px',
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
      :z-index="11"
      :class="[
        'is-draggable',
        _isActive ? 'inline-wrap--active' : 'line-wrap--inactive',
        _nodeData.isInRect && 'line-wrap--in-rect',
      ]"
      v-bind="attrs"
      disabled-key-event
      @dragend="onDragEnd"
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
            <t-icon name="delete" size="13px" class="text-white"></t-icon>
          </span>
        </t-tooltip>
        <slot></slot>
        <div v-if="true || profile.IS_DEV" class="line-wrap__locate">
          <!--          <div class="locate__item">X: {{ ~~_nodeData.left }}</div>-->
          <!--          <div class="locate__item">Y: {{ ~~_nodeData.top }}</div>-->

          <!-- 关键字定位 偏移量 -->
          <template v-if="_nodeData?.keywords">
            <div class="locate__item">
              <span>偏</span>X: {{ _keywordsPosOffsetXY?.offsetX }}
            </div>
            <div class="locate__item">
              <span>偏</span>Y: {{ _keywordsPosOffsetXY?.offsetY }}
            </div>
          </template>

          <!-- 绝对定位 -->
          <template v-else>
            <div class="locate__item">
              X: {{ Number(_nodeData.left + dragerWidth / 2).toFixed(0) }}
            </div>
            <div class="locate__item">
              Y: {{ Number(_nodeData.top + dragerHeight / 2).toFixed(0) }}
            </div>
          </template>
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

.es-drager.line-wrap--inactive.line-wrap--inactive {
  outline: 1px dashed @primary-color;
  background-color: rgba(@primary-color, 0.04);
}

.line-wrap--in-rect,
.inline-wrap--active {
  .line-wrap__locate {
    color: @error-color;
    background: #fff;
    outline: 1px solid @primary-color;
  }
}

.line-wrap__delete {
  @apply bg-error flex items-center justify-center p-1 rounded-full absolute right-0 top-0;
  transform: translate(50%, -50%);
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s ease-in-out;
  opacity: 1;
}

.line-wrap__locate {
  white-space: nowrap;
  position: absolute;
  top: calc(100% + 1px);
  left: 0;
  box-sizing: border-box;
  min-width: calc(100% + 2px);
  padding: 2px 6px;
  font-size: 12px;
  font-weight: bold;
  line-height: 20px;
  //color: @primary-color;
  color: @error-color;
  user-select: none;
  //background-color: #595959;
  display: flex;
  gap: 16px;
  flex-direction: row;
  .locate__item {
    flex: 1;
    text-align: center;
  }
}
</style>
