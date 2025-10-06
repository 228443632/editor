<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 04/10/25 PM9:34
 -->
<!--setup-->
<script setup lang="ts">
import { COMP_SEAL_STYLE } from '@/views/doc-editor/extensions/constant.js'
import testSealSvgRaw from '@/assets/images/test-seal.svg?raw'
import type { IParamsCompItem } from '@/views/sign-editor/types/types.ts'

const { proxy } = getCurrentInstance()
const props = defineProps({
  /**
   * 节点数据
   */
  nodeData: {
    type: Object as PropType<IParamsCompItem>,
    default: () => ({}),
  },
})
const emit = defineEmits([])

/* 状态 */

/* 方法 */

/* 计算 */

/* 监听 */

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({
  $: proxy.$,
})
</script>

<!--render-->
<template>
  <div
    ref="divRef"
    :style="{
      width: COMP_SEAL_STYLE.width + 'px',
      height: COMP_SEAL_STYLE.height + 'px',
    }"
    v-html="testSealSvgRaw"
  ></div>
</template>

<!--style-->
<style scoped lang="less"></style>
