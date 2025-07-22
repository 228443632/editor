<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 22/04/25 PM3:37
 -->
<!--setup-->
<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'
import { debounce, deepClone, to } from 'sf-utils2'
import { useZIndexManage } from '@/examples/hooks/use-z-index-manage'
import { onClickOutside } from '@vueuse/core'
import NodeEdit from './components/NodeEdit.vue'

import { simpleUUID } from '@/utils/short-id'
import Drager from 'es-drager'
import { generateFieldName } from '@/examples/utils/common-util'
import type { Editor } from '@tiptap/core'

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
const { zIndex, getTop } = useZIndexManage(editor)
const nodeEditRef = ref<InstanceType<typeof NodeEdit>>()
const formData = ref({})
const visible = reactive({
  dialog: false,
})
const selected = ref(false)

onClickOutside(rootRef, (e: PointerEvent) => {
  window.requestAnimationFrame(() => {
    const target = e.target as HTMLHtmlElement
    const containerDom = nodeEditRef.value.tPopupRef.getOverlay()
    console.log('containerDom', containerDom?.contains?.(target), containerDom, target, e)
    if (containerDom && containerDom.contains(target)) {
      selected.value = true
      return
    }
    selected.value = false
  })
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

  formData.value = deepClone({ ...props.node?.attrs })
  // setBubbleMenuShow(false)
  visible.dialog = true
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
  setBubbleMenuShow(true)
}

function onVisibleChange(popupVisible: boolean) {
  if (!popupVisible) {
    void onConfirm()
  }
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
const debounceOnRotate = debounce(onRotate, 20)
const onResize = ({ width, height }: { width: number; height: number }) => {
  updateAttributes({
    dragAttrs: {
      ..._dragAttrs.value,
      width: width.toFixed(2),
      height: height.toFixed(2),
    },
  })
}
const debounceOnResize = debounce(onResize, 20)

const onDrag = ({ left, top }: { left: number; top: number }) => {
  updateAttributes({
    dragAttrs: {
      ..._dragAttrs.value,
      top,
      left,
    },
  })
}
const debounceOnDrag = debounce(onDrag, 20)

/**
 * 获取最高层级
 */
function onGetTopZIndex() {
  updateAttributes({
    zIndex: getTop(),
  })
}

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

const _dragAttrs = computed(() => {
  return _attributes.value.dragAttrs || {}
})

/* 监听 */

/* 周期 */
onMounted(() => {
  if (!props.node.attrs.zIndex) {
    updateAttributes({
      zIndex: zIndex.value,
    })
  }
  if (!props.node.attrs?.['data-id']) {
    props.updateAttributes({
      'data-id': simpleUUID(),
    })
  }
})

/* 暴露 */
defineExpose({
  $: proxy.$,
})
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
        selected && 'selected'
      ]"
      @rotate="debounceOnRotate"
      @resize="debounceOnResize"
      @drag="debounceOnDrag"
      @focus="selected = true"
      @click="onSelectNode"
    >
      <NodeEdit
        ref="nodeEditRef"
        v-model:visible="visible.dialog"
        v-model:form-data="formData"
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
  </node-view-wrapper>
</template>

<!--style-->
<style lang="less">
div[compname='compTextDrag'] {
  display: contents !important;
  height: 0;
  width: 0;
  cursor: pointer;

  // float-node
  transform: translate(0, 0) !important;

  .text-placeholder {
    color: #9ba3b0;
  }

  & > * {
    transform: translate(0, 0) !important;
  }

  .es-drager {
    cursor: move;
    position: absolute;
    margin-left: var(--umo-page-margin-left);
    z-index: 1000;
    background: #fff;
    &:hover {
      //outline: 2px solid var(--umo-primary-color);
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
