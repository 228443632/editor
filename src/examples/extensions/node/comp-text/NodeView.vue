<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 22/04/25 PM3:37
 -->
<!--setup-->
<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'
import { deepClone, to } from 'sf-utils2'
import NodeEdit from './components/NodeEdit.vue'

import type { Editor } from '@tiptap/core'
import { generateFieldName } from '@/examples/utils/common-util'

const { proxy } = getCurrentInstance()

const props = defineProps({
  ...nodeViewProps,
})
const emit = defineEmits({})
const __globalBizState__ = inject('__globalBizState__') as Ref<
  Record<string, any>
>
const editor = inject('editor') as Ref<Editor>
const options = inject('options') as Ref<Record<string, any>>

const { updateAttributes } = props
/* 状态 */
const rootRef = ref<InstanceType<typeof NodeViewWrapper>>()
const nodeEditRef = ref<InstanceType<typeof NodeEdit>>()
const formData = ref({})
const visible = reactive({
  dialog: false,
})

/* 方法 */

function onSelectNode() {
  props.editor.commands.setNodeSelection(props.getPos())
  __globalBizState__.value.nodeActive = props.node

  // 设置选中
  const { anchor } = editor.value.state.selection
  editor.value
    .chain()
    .setTextSelection({ from: anchor, to: anchor + props.node.nodeSize })
    .run()

  formData.value = deepClone({ ...props.node.attrs })
  // setBubbleMenuShow(false)
  visible.dialog = true
}

async function onConfirm() {
  const [valid, err] = await to(nodeEditRef.value.formRef.validate())
  if (err || !valid)
    return useMessage('error', { content: '请检查表单是否填写完整' })
  const cloneFormData = deepClone(formData.value)
  console.log('cloneFormData', cloneFormData)
  updateAttributes(cloneFormData)
  onClose()
}

function onClose() {
  visible.dialog = false
  setBubbleMenuShow(true)
}

/**
 * 弹窗显隐
 * @param popupVisible
 */
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

/* 计算 */

const _attributes = computed(() => props.node?.attrs)

const _text = computed(() => generateFieldName(props.node?.attrs?.fieldName))

/**
 * 根节点样式
 */
const _rootStyle = computed(() => {
  return _attributes.value.cssText || {}
})

/* 监听 */

/* 周期 */
onMounted(() => {
  // console.log('props', props, props.getPos(), props.updateAttributes)
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
    as="span"
    :class="[
      `is-inline-block umo-node-view2`,
      `umo-node-border--${node?.attrs?.borderType}`,
    ]"
    :data-id="_attributes['data-id']"
    :data-placeholder="node?.attrs?.placeholder"
    compname="comp-text"
    :style="_rootStyle"
    @click="onSelectNode"
  >
    <text class="hidden">{{ _text }}</text>
    <NodeEdit
      ref="nodeEditRef"
      v-model:visible="visible.dialog"
      v-model:form-data="formData"
      @visible-change="onVisibleChange"
    ></NodeEdit>
    <!--    &ZeroWidthSpace;-->
  </node-view-wrapper>
</template>

<!--style-->
<style lang="less">
.umo-node-view2[compname='comp-text'] {
  position: relative;
  box-sizing: border-box;
  min-width: 140px;
  min-height: 1em;
  text-align: left;
  text-indent: 0;
  border-bottom: 1px solid var(--umo-node-text-border-color);
  //padding: 0 2px;
  //padding: 0;
  cursor: pointer;
  //border-radius: 2px;
  &.umo-node-focused.umo-node-focused.umo-node-focused {
    outline: 2px solid var(--umo-primary-color);
  }
  &:hover {
    background-color: #f0f2f7;
  }
  &:after {
    color: #9ba3b0;
    content: attr(data-placeholder);
  }

  ::selection {
    background-color: var(--umo-text-selection-background);
  }
}

/** 隐藏 */
:root[mode='print'] {
  .umo-node-view2[data-u='comp-text'] {
    --umo-node-text-border-color: currentColor;
    //--umo-node-text-border-color: red;
    //padding: 0;
    &:after {
      content: '';
    }
  }
  span[data-id][iscompparams] {
    &[bordertype='none'] {
      border-bottom: none;
    }
  }
}

/*render node*/
span[data-id][iscompparams] {
  &[bordertype='underline'] {
    border-bottom: 1px solid var(--umo-node-text-border-color);
  }

  &[bordertype='solid'] {
    border: 1px solid var(--umo-node-text-border-color);
  }

  &[bordertype='dashed'] {
    border: 1px dashed var(--umo-node-text-border-color);
  }
}
</style>

<style lang="less">
.umo-node-border--underline {
  border-bottom: 1px solid var(--umo-node-text-border-color);
}
.umo-node-border--solid {
  border: 1px solid var(--umo-node-text-border-color);
}
.umo-node-border--dashed {
  border: 1px dashed var(--umo-node-text-border-color);
}
.umo-node-border--none {
  border: none;
}
</style>
