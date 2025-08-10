<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 22/04/25 PM3:37
 -->
<!--setup-->
<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)
const emit = defineEmits({})
const __globalBizState__ = inject('__globalBizState__') as Ref<
  Record<string, any>
>
const options = inject('options') as Ref<Record<string, any>>

const { updateAttributes } = props
/* 状态 */
const rootRef = ref<InstanceType<typeof NodeViewWrapper>>()
const formData = ref({})

/* 方法 */

/* 计算 */

/* 监听 */

/* 暴露 */
defineExpose()
</script>

<!--render-->
<template>
  <node-view-wrapper
    ref="rootRef"
    :compname="node.attrs?.compName"
    as="div"
    :data-id="props.node?.attrs['data-id']"
    :style="_rootStyle"
    :class="['umo-floating-node']"
  >
  </node-view-wrapper>
</template>

<!--style-->
<style lang="less">
div[compname='compDivider'] {
  height: 1px;
  width: 100%;
  position: relative;
  background: red;
}

/** 隐藏 */
:root[mode='print'] {
}
</style>

<style lang="less"></style>
