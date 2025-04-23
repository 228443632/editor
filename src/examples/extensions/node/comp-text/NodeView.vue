<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 22/04/25 PM3:37
 -->
<!--setup-->
<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'
import { simpleUUID } from '@/utils/short-id'

const { proxy } = getCurrentInstance()

const props = defineProps({
  ...nodeViewProps,
})
const emit = defineEmits({})
const __globalBizState__ = inject('__globalBizState__') as Ref<{}>

/* 状态 */

/* 方法 */

function onSelectNode() {
  props.editor.commands.setNodeSelection(props.getPos())
  __globalBizState__.value.nodeActive = props.node
}

/* 计算 */

/* 监听 */

/* 周期 */
onMounted(() => {
  // console.log('props', props, props.getPos(), props.updateAttributes)
  window.requestAnimationFrame(() => {
    props.updateAttributes({
      nodeId: simpleUUID()
    })
  })
})

/* 暴露 */
defineExpose({
  $: proxy.$,
})
</script>

<!--render-->
<template>
  <node-view-wrapper
    as="span"
    class="form-comp--text is-inline-block"
    contenteditable="false"
    :data-placeholder="props.HTMLAttributes?.placeholder"
    @click="onSelectNode"
  >
  </node-view-wrapper>
</template>

<!--style-->
<style lang="less">
.form-comp--text {
  position: relative;
  box-sizing: border-box;
  min-width: 140px;
  min-height: 24px;
  text-align: left;
  border: 1px solid transparent;
  border-bottom: 1px solid #CDD0D8;
  padding: 0 2px;
  cursor: pointer;
  border-radius: 2px;
  &.umo-node-focused {
    border-color: var(--umo-primary-color);
    border-style: dashed dashed solid;
  }
  &:hover {
    background-color: #f0f2f7;
  }
  &:after {
    font-size: 14px;
    color: #9ba3b0;
    content: attr(data-placeholder);
  }
}
</style>
