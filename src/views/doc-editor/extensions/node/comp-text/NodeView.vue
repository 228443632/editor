<!--
 * @Description: ding
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 22/04/25 PM3:37
 -->
<!--setup-->
<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'
import { deepClone, to } from 'sf-utils2'
import NodeEdit from './components/NodeEdit.vue'
// import profile from '@/profile.ts'

import type { Editor } from '@tiptap/core'
import { generateFieldName } from '@/views/doc-editor/utils/common-util'
// import { imgMap } from '@/views/doc-editor/extensions/node/comp-text/utils.ts'

// 订单-应支付乙方的委托服务报酬
import OrderPartyBServicePayable from './components/order/PartyBServicePayable.vue'
// 订单- 新增委托处置债权(标的债权)
import OrderSubjectClaim from './components/order/SubjectClaim.vue'
import { $enums } from '@/utils/enums.ts'

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
// const { width: rootWidth, height: rootHeight } = useElementBounding(rootRef)
const previewImgSrc = ref() // 当前预览的图片地址
const previewImgVisible = ref(false) // 图片预览是否可见

/* 方法 */

function onSelectNode() {
  props.editor.commands.setNodeSelection(props.getPos())
  __globalBizState__.value.nodeActive = props.node

  // 设置选中
  const { anchor } = editor.value.state.selection
  editor.value
    .chain()
    .focus()
    .setTextSelection({ from: anchor, to: anchor + props.node.nodeSize })
    .run()

  formData.value = deepClone({ ...props.node.attrs })
  // setBubbleMenuShow(false)
  visible.dialog = true
}

/**
 * 确认
 */
async function onConfirm() {
  console.log('nodeEditRef.value', nodeEditRef.value)
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
 * 设置悬浮菜单显示
 * @param isShow
 */
function setBubbleMenuShow(isShow = true) {
  options.value.document ||= {}
  options.value.document.enableBubbleMenu = isShow
}

/**
 * 图片预览
 */
function onPreviewImg(src: string) {
  previewImgSrc.value = src
  previewImgVisible.value = true
}

/* 计算 */

const _attributes = computed(() => props.node?.attrs)

const _text = computed(() => generateFieldName(props.node?.attrs?.fieldName))

/**
 * 根节点样式
 */
// const _rootStyle = computed(() => {
//   return _attributes.value.cssText || {}
// })

/**
 * 服务端渲染组件名
 */
const _serverRenderComp = computed(() => {
  return props.node?.attrs?.serverRenderComp
})

/**
 * 根节点标签
 */
const _wrapperTag = computed(() => {
  return _serverRenderComp.value ? 'div' : 'span'
})

/**
 * 占位名称
 */
const _placeholder = computed(() => {
  return props.node?.attrs?.placeholderAlias || props.node?.attrs?.placeholder
})

/* 监听 */

/* 周期 */
onMounted(() => {
  nextTick(() => {
    if (!props.node?.attrs?.compNameLabel) {
      updateAttributes({
        compNameLabel: props.node?.attrs?.placeholder,
      })
    }
  })
})

/* 暴露 */
defineExpose({
  $: proxy.$,
})

provide('NODE_PROPS', props)
</script>

<!--render-->
<template>
  <node-view-wrapper
    ref="rootRef"
    :as="_wrapperTag"
    :class="[
      `is-inline-block umo-node-view2`,
      `umo-node-border--${node?.attrs?.borderType}`,
      _serverRenderComp && '!flex items-center flex-col umo-node--paragraph',
    ]"
    :data-id="_attributes['data-id']"
    :data-placeholder="`【${_placeholder}】`"
    compname="comp-text"
    :bordertype="node?.attrs?.borderType"
    @click="onSelectNode"
  >
    <text class="hidden">{{ _text }}</text>

    <!--  纯内容预览 分案订单-图片  -->
    <template v-if="_serverRenderComp">
      <view
        v-if="
          _serverRenderComp ==
          $enums.serverRenderComponent.ORDER_PARTY_B_SERVICE_PAYABLE.key
        "
        class="no-print"
      >
        <OrderPartyBServicePayable></OrderPartyBServicePayable>
      </view>

      <view
        v-else-if="
          _serverRenderComp ==
          $enums.serverRenderComponent.ORDER_SUBJECT_CLAIM.key
        "
        class="no-print"
      >
        <OrderSubjectClaim></OrderSubjectClaim>
      </view>
    </template>

    <t-image-viewer
      v-model:visible="previewImgVisible"
      :images="[previewImgSrc]"
      :z-index="10000"
    ></t-image-viewer>

    <!--    v-if="['dev', 'localDev', 'localSit'].includes(profile.APP_MODE)"-->
    <NodeEdit
      v-if="false"
      ref="nodeEditRef"
      v-model:visible="visible.dialog"
      v-model:form-data="formData"
      @confirm="onConfirm"
    ></NodeEdit>
  </node-view-wrapper>
</template>

<!--style-->
<style lang="less">
@import '@/style/vars';
.umo-node-view2[compname='comp-text'] {
  position: relative;
  box-sizing: border-box;
  min-width: 84px;
  min-height: 1em;
  text-align: left;
  text-indent: 0;

  margin: 0 0.5px;
  //padding: 1px 0;
  border: 2px solid @error-color;
  background: #f7ff30;
  //

  cursor: pointer;
  scroll-margin-top: 8px;
  &.umo-node-focused.umo-node-focused.umo-node-focused,
  &.ProseMirror-selectednode {
    @error-color: @primary-color;
    outline: none !important;
    border-color: @error-color !important;
    background: rgba(@error-color, 0.2);
    &:after {
      color: @error-color;
    }
  }
  &:after {
    color: #000;
    content: attr(data-placeholder);
  }

  ::selection {
    background-color: var(--umo-text-selection-background);
  }
}

/** 隐藏 */
:root[mode='print'] {
  .umo-node-view2[compname='comp-text'] {
    --umo-node-text-border-color: currentColor;
    //
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    &:after {
      content: '';
      background: transparent;
      outline: none;
    }
    &[bordertype='none'] {
      border-bottom: none;
    }
  }
}

//:root[mode='preview'] {
//  .umo-node-view2[compname='comp-text'] {
//    &.umo-node-focused.umo-node-focused.umo-node-focused,
//    &.ProseMirror-selectednode {
//      outline: none !important;
//    }
//  }
//}

/*render node*/
span[data-id][compname] {
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
