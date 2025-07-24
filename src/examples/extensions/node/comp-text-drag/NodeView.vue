<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 22/04/25 PM3:37
 -->
<!--setup-->
<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'
import { deepClone, to, debounce } from 'sf-utils2'
import { getNumString } from 'sf-utils2/lib/_helperNumber'
import { useZIndexManage } from '@/examples/hooks/use-z-index-manage'
import { onClickOutside } from '@vueuse/core'
import NodeEdit from './components/NodeEdit.vue'

import { simpleUUID } from '@/utils/short-id'
import Drager from 'es-drager'
import { generateFieldName } from '@/examples/utils/common-util'
import type { Editor } from '@tiptap/core'
import { rafThrottle } from '@/examples/utils/dom'

const { proxy } = getCurrentInstance()

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
const nodeEditRef = ref<InstanceType<typeof NodeEdit>>()
const formData = ref({})
const visible = reactive({
  dialog: false,
})
const selected = ref(false)
const scrollViewRef = ref<HTMLHtmlElement>(
  document.querySelector('div.umo-zoomable-container.umo-scrollbar'),
)

onClickOutside(rootRef, (e: PointerEvent) => {
  const target = e.target as HTMLHtmlElement
  const containerDom = nodeEditRef.value.tPopupRef.getOverlay()
  if (containerDom && containerDom.contains(target)) {
    selected.value = true
    return
  }
  selected.value = false
})

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

  // TODO
  selected.value = true

  formData.value = deepClone({ ...props.node?.attrs })
  // setBubbleMenuShow(false)
  visible.dialog = false
}

/**
 * 确认
 */
async function onConfirm() {
  const [valid, err] = await to(nodeEditRef.value.formRef.validate())
  if (err || !valid)
    return useMessage('error', { content: '请检查表单是否填写完整' })
  const cloneFormData = deepClone(formData.value)
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
  const target = event.target as HTMLElement
  if (onScroll._lastScrollTop === target.scrollTop) return
  const diffH = target.scrollTop - onScroll._lastScrollTop
  const translateY = _dragAttrs.value.translateY + diffH
  updateAttributes({
    dragAttrs: {
      ..._dragAttrs.value,
      translateY,
    },
  })
  onScroll._lastScrollTop = target.scrollTop
}
onScroll._lastScrollTop = 0

const rafThrottleOnScroll = rafThrottle(onScroll)
const debounceOnScroll = debounce(onScroll, 100)

function addScrollListener() {
  if (!scrollViewRef.value) return
  removeScrollListener()
  scrollViewRef.value.addEventListener('scroll', rafThrottleOnScroll)
  scrollViewRef.value.addEventListener('scroll', debounceOnScroll)
}
function removeScrollListener() {
  if (!scrollViewRef.value) return
  scrollViewRef.value.removeEventListener('scroll', rafThrottleOnScroll)
  scrollViewRef.value.removeEventListener('scroll', debounceOnScroll)
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
  removeScrollListener()
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

const _text = computed(() => generateFieldName(props.node?.attrs?.fieldName))

/**
 * 根节点样式
 */
const _rootStyle = computed(() => {
  const cssText = _attributes.value.cssText || {}
  return {
    ...cssText,
    zIndex: props.node.attrs.zIndex,
  }
})

/**
 * 拖拽属性
 */
const _dragAttrs = computed(() => {
  const tempAttrs = _attributes.value.dragAttrs || {}
  return {
    ...tempAttrs,
    translateY: +getNumString(tempAttrs.translateY),
  }
})

/* 监听 */

/* 周期 */
onMounted(() => {
  if (!props.node.attrs.zIndex) {
    updateAttributes({ zIndex: zIndex.value })
  }
  if (!props.node.attrs?.['data-id']) {
    props.updateAttributes({ 'data-id': simpleUUID() })
  }
})

onBeforeUnmount(() => {
  removeScrollListener()
})

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
    :class="['umo-floating-node']"
  >
    <span
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
        @click="onSelectNode"
      >
        <NodeEdit
          ref="nodeEditRef"
          v-model:visible="visible.dialog"
          v-model:form-data="formData"
          :extra-props="{
            getTop,
            updateAttributes,
          }"
          @visible-change="onVisibleChange"
        >
          <span class="!overflow-hidden inline-block w-full h-full">
            <text class="hidden">{{ _text }}</text>
            <span class="print-hidden text-placeholder">{{
              props.node.attrs?.placeholder
            }}</span>
          </span>
        </NodeEdit>
      </Drager>
    </span>
  </node-view-wrapper>
</template>

<!--style-->
<style lang="less">
div[compname='compTextDrag'] {
  //display: contents !important;
  display: contents;
  height: 0;
  width: 0;
  cursor: pointer;
  font-size: 16px;

  .text-placeholder {
    color: #9ba3b0;
  }

  //& > * {
  //  transform: translate(0, 0) !important;
  //}

  .drager-wrap {
    transform: translate3d(0, var(--y), 0);
    display: inline-flex;
    margin-left: var(--umo-page-margin-left);
    position: absolute;
    left: 0;
    top: 0;
  }

  .es-drager {
    cursor: move;
    position: absolute;
    z-index: 1000;
    background: #fff;
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
