<!--
 * @Description: 外观
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 24/07/25 PM5:06
 -->
<!--setup-->
<script setup lang="ts">
import type { Editor } from '@tiptap/core'
import FontFamily from './FontFamily.vue'
import Bold from './Bold.vue'
import FontSize from './FontSize.vue'
import Italic from './Italic.vue'
import Strike from './Strike.vue'
import Underline from './Underline.vue'
import Color from './Color.vue'
import BackgroundColor from './BackgroundColor.vue'

const props = defineProps({})
const emit = defineEmits({})

/* 状态 */
const editor = inject('editor') as Ref<Editor>
const __nodeProps = inject('NODE_PROPS') as Record<string, any>
const { updateAttributes } = __nodeProps

/* 方法 */

/* 计算 */

/* 监听 */

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({})
</script>

<!--render-->
<template>
  <div class="sf-appearance-edit flex gap-x-2px flex-wrap gap-y-8px">
    <FontFamily></FontFamily>
    <FontSize></FontSize>
    <Bold></Bold>
    <Italic></Italic>
    <Underline></Underline>
    <Strike></Strike>
    <Color></Color>
    <BackgroundColor></BackgroundColor>
  </div>
</template>

<!--style-->
<style lang="less">
.sf-appearance-edit {
}
</style>
