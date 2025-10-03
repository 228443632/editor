<!--
 * @Description: 印章
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/10/25 PM7:53
 -->
<!--setup-->
<script setup lang="ts">
import { COMP_SEAL_STYLE } from '@/views/doc-editor/extensions/constant.ts'
import Drager from 'es-drager'
import { rafThrottle } from 'sf-utils2'
import type { IParamsCompItem } from '@/views/preview-editor/types/types.ts'
import testSealSvgRaw from '@/assets/images/test-seal.svg?raw'
import ContentLineWrap from './ContentLineWrap.vue'

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
const divRef = ref<HTMLElement>()
const __previewContext__ = inject('__previewContext__') // 预览上下文

const scrollViewRef = computed(() => __previewContext__.value.contentElRef)
const contentLineWrapRef = ref<InstanceType<typeof ContentLineWrap>>()

useEventListener(scrollViewRef, 'keydown', onKeydown)

/* 方法 */

/**
 * 选择节点
 */
const onSelectNode = () => {
  const inRectNums = __previewContext__.value.paramsCompList.filter(
    (item) => item.isInRect,
  )
  if (inRectNums > 1) {
    // 多个
    return
  }
  __previewContext__.value.selectParamsComp(_nodeData.value)
}

/**
 * 监听键盘事件
 * @param e
 */
function onKeydown(e: KeyboardEvent) {
  // keyCode: 40 下 38 上。39 右 37 左
  switch (e.keyCode) {
    case 40: {
      // 下
      e.preventDefault()
      _nodeData.value.top = _nodeData.value.top + 1
      break
    }
    case 38: {
      // 上
      _nodeData.value.top = _nodeData.value.top - 1
      e.preventDefault()
      break
    }

    case 37: {
      // 左
      _nodeData.value.left = _nodeData.value.left - 1
      e.preventDefault()
      break
    }
    case 39: {
      // 右
      _nodeData.value.left = _nodeData.value.left + 1
      e.preventDefault()
      break
    }
    default: {
      break
    }
  }
  // function onChoose() {
  //   window.requestAnimationFrame(() => {
  //     // editor.value.commands.setNodeSelection(props.getPos())
  //     dragerWrapRef.value.click()
  //     editor.value.commands.focus()
  //   })
  // }
}

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

/* 计算 */

/**
 * 是否当前组件激活
 */
const _isActive = computed(() => {
  return __previewContext__.value.activeCompParam?.key == _nodeData.value.key
})

/* 监听 */

watchEffect(() => {
  void _nodeData.value.top
  void _nodeData.value.left
  nextTick(() => {
    contentLineWrapRef.value && contentLineWrapRef.value.update()
  })
})

let topTimeout
watch([() => _nodeData.value.top, () => _nodeData.value.left], () => {
  topTimeout && clearTimeout(topTimeout)
  _nodeData.value.isEsDragging = true
  topTimeout = setTimeout(() => {
    _nodeData.value.isEsDragging = false
  }, 20)
})

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({
  $: proxy.$,
})
</script>

<!--render-->
<template>
  <div
    v-if="_isActive"
    class="absolute transform e-drager-top__handle shadow-md"
    :style="{
      top: _nodeData.top + 'px',
      left: _nodeData.left + 'px',
    }"
    @mousedown.stop="onSelectNode"
  >
    <span class="cursor-pointer !hover:text-[var(--umo-primary-color)] flex-1"
      >应用到多文件多页</span
    >
    <t-icon
      name="delete"
      size="14px"
      class="cursor-pointer flex-none !hover:text-[var(--umo-primary-color)]"
      @click="__previewContext__.removeParamsComp(_nodeData)"
    ></t-icon>
  </div>
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
    :z-index="10"
    :class="[
      'is-draggable',
      _isActive ? 'inline-wrap--active' : 'line-wrap--inactive',
      _nodeData.isInRect && 'line-wrap--in-rect',
    ]"
    @drag="rafThrottleOnDrag"
    @mousedown.stop="onSelectNode"
  >
    <ContentLineWrap ref="contentLineWrapRef" :show-line="_isActive">
      <div
        ref="divRef"
        :style="{
          width: COMP_SEAL_STYLE.width + 'px',
          height: COMP_SEAL_STYLE.height + 'px',
        }"
        v-html="testSealSvgRaw"
      ></div>
    </ContentLineWrap>
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

.es-drager.selected.border {
  //outline-style: dashed;
  //outline-width: 1px;
  outline: none;
}

.e-drager-top__handle {
  white-space: nowrap;
  transform: translate(0, calc(-100% - 8px));
  background: #e5e5e5;
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 8px;
  border-radius: 4px;
  color: #666;
  font-size: 12px;
  gap: 12px;
  z-index: 10;
  & > span:first-child {
    position: relative;
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: -7px;
      width: 1px;
      height: 10px;
      background: #bbb;
    }
  }
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
