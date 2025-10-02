<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 22/04/25 PM3:37
 -->
<!--setup-->
<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

import type { Editor } from '@tiptap/core'
import type { CSSProperties } from 'vue'

const props = defineProps({
  ...nodeViewProps,
})
const emit = defineEmits({})
const editor = inject('editor') as Ref<Editor>
const options = inject('options') as Ref<Record<string, any>>

const { updateAttributes } = props

/* 状态 */
const rootRef = ref<InstanceType<typeof NodeViewWrapper>>()

/* 方法 */

/* 计算 */

/**
 * 根节点样式
 */
const _rootStyle = computed(() => {
  const style = {} as CSSProperties
  return style
})

/* 监听 */

/* 周期 */
onMounted(() => {
  // console.log('props', props, props.getPos(), props.updateAttributes)
})

/* 暴露 */
defineExpose({})
</script>

<!--render-->
<template>
  <node-view-wrapper
    ref="rootRef"
    :compname="props.node.attrs?.compName"
    as="div"
    :style="_rootStyle"
    class="relative"
  >
    <div class="spacer"></div>
    <div class="breaker">
      <div class="breaker-footer"></div>
    </div>
  </node-view-wrapper>
</template>

<!--style-->
<style lang="less">
[compname='compFloat'] {
  border-top: 2px solid red;
  .spacer {
    position: relative;
    float: left;
    clear: both;
    margin-top: 40px;
  }
  .breaker {
    width: 100%;
    position: relative;
    float: left;
    clear: both;
    left: 0px;
    right: 0px;
    z-index: 2;
    .breaker-footer {
      height: 2px;
      width: 100%;
      background: blue;
    }
  }
}
</style>
