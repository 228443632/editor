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
  style.width = `${props.node.attrs.intentNum}em`
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
    :name="node.attrs?.name"
    as="span"
    class="inline-flex"
    :style="_rootStyle"
  >
  </node-view-wrapper>
</template>

<!--style-->
<style lang="less">
//span[compname='compInvisibleBlock'] {
//  display: inline-block;
//  //font-size: 0;
//}
</style>
