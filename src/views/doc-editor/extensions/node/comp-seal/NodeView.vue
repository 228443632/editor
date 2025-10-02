<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 22/04/25 PM3:37
 -->
<!--setup-->
<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'
import { deepClone, to } from 'sf-utils2'
import { getNumString } from 'sf-utils2/lib/_helperNumber'
import { useZIndexManage } from '@/views/doc-editor/hooks/use-z-index-manage'
import { onClickOutside } from '@vueuse/core'
import LineWrap from '../comp-text-drag/components/LineWrap.vue'
import testSealSvgRaw from '@/assets/images/test-seal.svg?raw'

import Drager from 'es-drager'
import type { Editor } from '@tiptap/core'
import { MAX_Z_INDEX, rafThrottle } from '@/views/doc-editor/utils/dom'
import { FLOAT_REAL_CONTENT_CLASS_NAME } from '@/views/doc-editor/extensions/constant.ts'

const props = defineProps(nodeViewProps)
const emit = defineEmits({})
const __globalBizState__ = inject('__globalBizState__') as Ref<
  Record<string, any>
>
const options = inject('options') as Ref<Record<string, any>>

const { updateAttributes } = props
/* 状态 */
const rootRef = ref<InstanceType<typeof NodeViewWrapper>>()
const editor = inject('editor') as Ref<Editor>
const { zIndex, getTop } = useZIndexManage()
const dragerWrapRef = ref<HTMLHtmlElement>()
const dragerRef = ref<InstanceType<typeof Drager>>()
const formData = ref({})
const visible = reactive({
  dialog: false,
})
const lineWrapRef = ref<InstanceType<typeof LineWrap>>()
const selected = ref(false)
const scrollViewRef = ref<HTMLHtmlElement>(
  document.querySelector('div.umo-zoomable-container.umo-scrollbar'),
)
const umoPageContentRef = ref<HTMLHtmlElement>(
  document.querySelector('.umo-watermark.umo-page-content'),
)

onClickOutside(rootRef, (e: PointerEvent) => {
  const target = e.target as HTMLHtmlElement
  if (umoPageContentRef.value.contains(target)) {
    selected.value = false
    return
  }
  // selected.value = true
})

const inputRef = ref<HTMLInputElement>()
const inputVisible = ref(true)

/* 方法 */

/**
 * 选中节点
 */
function onSelectNode() {
  props.editor.commands.setNodeSelection(props.getPos())
  __globalBizState__.value.nodeActive = props.node

  // 设置选中
  const { anchor } = editor.value.state.selection
  editor.value
    .chain()
    .setTextSelection({ from: anchor, to: anchor + props.node.nodeSize })
    .run()

  formData.value = deepClone({ ...props.node?.attrs })

  if (!formData.value.zIndex) {
    updateAttributes({ zIndex: zIndex.value })
    formData.value.zIndex = zIndex.value
  }

  // setBubbleMenuShow(false)
  visible.dialog = true
  selected.value = true
  nextTick(() => {
    inputRef.value && inputRef.value.focus()
  })
}

/**
 * 删除自己节点
 */
async function onDeleteSelf(event) {
  // inputVisible.value = false
  // await nextTick()
  // dragerWrapRef.value.click()

  const oldScrollTop = scrollViewRef.value.scrollTop

  const boundRect = inputRef.value.getBoundingClientRect()

  // fix 删除节点
  editor.value.chain().setNodeSelection(props.getPos()).run()

  editor.value
    .chain()
    .setNodeSelection(props.getPos())
    .deleteSelectionNode()
    .run()

  window.requestAnimationFrame(() => {
    scrollViewRef.value.scrollTop = oldScrollTop
  })

  // setTimeout(() => {
  //   const { view } = editor.value
  //   const coordinates = view.posAtCoords({
  //     top: boundRect.top,
  //     left: boundRect.left,
  //   })
  //   console.log('coordinates?.pos', coordinates?.pos)
  //   editor.value
  //     .chain()
  //     .setNodeSelection(coordinates?.pos)
  //     .focus()
  //     .run()
  //
  //   window.requestAnimationFrame(() => {
  //     window.requestAnimationFrame(() => {
  //       scrollViewRef.value.scrollTop = oldScrollTop
  //       window.requestAnimationFrame(() => {
  //         scrollViewRef.value.scrollTop = oldScrollTop
  //       })
  //     })
  //   })
  // })
  // console.log('event', event)
}

/**
 * 确认
 */
async function onConfirm() {
  const cloneFormData = deepClone(formData.value)
  delete cloneFormData.dragAttrs
  delete cloneFormData.cssText
  updateAttributes(cloneFormData)
  onClose()
}

function onClose() {
  visible.dialog = false
  // setBubbleMenuShow(true)
}

function onVisibleChange(popupVisible: boolean) {
  if (!popupVisible) {
    void onConfirm()
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
  const translateY = _dragAttrs.value.translateY + diffH
  updateAttributes({
    dragAttrs: {
      ..._dragAttrs.value,
      translateY,
    },
  })
  onScroll._oldScrollTop = target.scrollTop
}
onScroll._oldScrollTop = 0

const rafThrottleOnScroll = rafThrottle(onScroll)

/**
 * 监听键盘事件
 * @param e
 */
function onKeydown(e: KeyboardEvent) {
  // keyCode: 40 下 38 上。39 右 37 左
  switch (e.keyCode) {
    case 40: {
      // 下
      const dragAttrs = deepClone(_dragAttrs.value)
      dragAttrs.top = dragAttrs.top + 2
      updateAttributes({ dragAttrs })
      e.preventDefault()
      break
    }
    case 38: {
      // 上
      const dragAttrs = deepClone(_dragAttrs.value)
      dragAttrs.top = dragAttrs.top - 2
      updateAttributes({ dragAttrs })
      e.preventDefault()
      break
    }

    case 37: {
      // 左
      const dragAttrs = deepClone(_dragAttrs.value)
      dragAttrs.left = dragAttrs.left - 2
      updateAttributes({ dragAttrs })
      e.preventDefault()
      break
    }
    case 39: {
      // 右
      const dragAttrs = deepClone(_dragAttrs.value)
      dragAttrs.left = dragAttrs.left + 2
      updateAttributes({ dragAttrs })

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
 * 设置悬浮菜单显示
 * @param isShow
 */
function setBubbleMenuShow(isShow = true) {
  options.value.document ||= {}
  options.value.document.enableBubbleMenu = isShow
}

const onRotate = ({ angle }: { angle: number }) => {
  updateAttributes({ dragAttrs: { ..._dragAttrs.value, angle } })
}
const rafThrottleOnRotate = rafThrottle(onRotate)
const onResize = ({ width, height }: { width: number; height: number }) => {
  updateAttributes({
    dragAttrs: {
      ..._dragAttrs.value,
      width: width.toFixed(2),
      height: height.toFixed(2),
    },
  })
}
const rafThrottleOnResize = rafThrottle(onResize)

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
  selected.value = true
  addScrollListener()
}

/**
 * 拖拽结束
 */
function onDragEnd() {
  removeScrollListener()
}

/**
 * 拖拽中
 * @param left
 * @param top
 */
const onDrag = ({ left, top }: { left: number; top: number }) => {
  updateAttributes({
    dragAttrs: {
      ..._dragAttrs.value,
      top,
      left,
    },
  })
}
const rafThrottleOnDrag = rafThrottle(onDrag)

/* 计算 */

const _attributes = computed(() => props.node?.attrs)

// const _text = computed(() => generateFieldName(props.node?.attrs?.fieldName))

/**
 * 根节点样式
 */
const _rootStyle = computed(() => {
  const cssText = _attributes.value.cssText || {}
  return {
    ...cssText,
    zIndex: selected.value ? MAX_Z_INDEX : props.node.attrs.zIndex,
  }
})

/**
 * 拖拽属性
 */
const _dragAttrs = computed(() => {
  const tempAttrs = _attributes.value.dragAttrs || {}
  return {
    ...tempAttrs,
    translateY: +getNumString(tempAttrs.translateY) || 0,
  }
})

/* 监听 */

/**
 * 监听是否选中
 */
watch(selected, (newSelected: boolean) => {
  if (newSelected) {
    scrollViewRef.value.addEventListener('keydown', onKeydown, {
      capture: true,
    })
  } else {
    scrollViewRef.value.removeEventListener('keydown', onKeydown, {
      capture: true,
    })
  }
})

watchEffect(() => {
  void _dragAttrs.value.width
  void _dragAttrs.value.top
  void _dragAttrs.value.left
  void _dragAttrs.value.height
  void _dragAttrs.value.translateY
  nextTick(() => {
    lineWrapRef.value && lineWrapRef.value.update()
  })
})

/* 周期 */
onMounted(() => {
  if (!props.node.attrs.zIndex) {
    updateAttributes({ zIndex: zIndex.value })
  }
})

// 浙商资产新核心系统

onBeforeUnmount(() => {
  removeScrollListener()
  scrollViewRef.value.removeEventListener('keydown', onKeydown, {
    capture: true,
  })
})

// 创建提供
provide('NODE_PROPS', props)

/* 暴露 */
defineExpose()
</script>

<!--render-->
<template>
  <node-view-wrapper
    ref="rootRef"
    :compname="node.attrs?.compName"
    as="div"
    :iscompparams="node.attrs?.isCompParams"
    :data-id="_attributes['data-id']"
    :style="_rootStyle"
    :class="['umo-floating-node', selected && 'is-selected']"
    @click="onSelectNode"
    @keydown.delete.capture="onDeleteSelf"
  >
    <span
      ref="dragerWrapRef"
      class="drager-wrap"
      :style="{
        '--y': _dragAttrs.translateY + 'px',
        zIndex: _rootStyle.zIndex,
      }"
    >
      <Drager
        :selected="selected"
        :rotatable="true"
        :boundary="false"
        tag="span"
        :skewable="true"
        :snap-to-grid="false"
        :angle="_dragAttrs.angle"
        :width="Number(_dragAttrs.width)"
        :height="Number(_dragAttrs.height)"
        :left="Number(_dragAttrs.left)"
        :top="Number(_dragAttrs.top)"
        :min-width="14"
        :min-height="14"
        :z-index="10"
        :equal-proportion="_dragAttrs.equalProportion"
        :class="[
          'umo-select-outline umo-hover-shadow',
          node.attrs.isDraggable && 'is-draggable',
          selected && 'selected',
        ]"
        @rotate="rafThrottleOnRotate"
        @resize="rafThrottleOnResize"
        @drag-start="onDragStart"
        @drag-end="onDragEnd"
        @drag="rafThrottleOnDrag"
        ref="dragerRef"
        @click.stop="onSelectNode"
      >
        <LineWrap
          ref="lineWrapRef"
          :width="Number(_dragAttrs.width)"
          :height="Number(_dragAttrs.height)"
          :auto-resize="false"
          :show-line="selected"
        >
          <span
            :class="[
              '!overflow-hidden inline-block w-full h-full text-0 float-real-content',
              FLOAT_REAL_CONTENT_CLASS_NAME,
            ]"
            :style="{
              textDecoration: _rootStyle.textDecoration,
              backgroundColor: _rootStyle.backgroundColor,
            }"
          >
            <span class="opacity-100 w-0px h-0px inline-block overflow-hidden">
              <input v-if="inputVisible" ref="inputRef" />
            </span>

            <span v-html="testSealSvgRaw"></span>
          </span>
        </LineWrap>
      </Drager>
    </span>
  </node-view-wrapper>
</template>

<!--style-->
<style lang="less">
// 分页
.sf-with-pagination {
  [compname='compSeal'] {
    .es-drager {
      margin-top: calc(-1 * var(--umo-page-margin-top));
    }
  }
}

[compname='compSeal'] {
  height: 0;
  width: 100%;
  position: absolute;
  text-indent: 0;

  //font-size: 16px;
  //outline: none !important;

  //&.is-selected {
  //  outline: 2px solid var(--umo-primary-color);
  //}

  .text-placeholder {
    color: #9ba3b0;
  }

  //& > * {
  //  transform: translate(0, 0) !important;
  //}

  .drager-wrap {
    transform: translate3d(0, var(--y), 0);
    display: inline-flex;
    //margin-left: var(--umo-page-margin-left);
    position: absolute;
    left: 0;
    top: 0;
  }

  .es-drager-dot-handle {
    display: none;
  }

  .es-drager {
    cursor: move;
    position: absolute;
    z-index: 1000;
    background: transparent;
    &:hover {
      outline: 2px solid var(--umo-primary-color);
      box-shadow: var(--umo-shadow);
    }
  }
  ::selection {
    background-color: var(--umo-text-selection-background);
  }
}

/** 隐藏 */
:root[mode='print'] {
}
</style>

<style lang="less"></style>
