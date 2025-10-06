<!--
 * @Description: 签署日期控件
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/10/25 PM7:53
 -->
<!--setup-->
<script setup lang="ts">
import { COMP_SIGN_DATE_STYLE } from '@/views/doc-editor/extensions/constant.ts'
import type { IParamsCompItem } from '@/views/sign-editor/types/types.ts'
import testSignSvgRaw from '@/assets/images/test-sign.svg?raw'

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
      width: COMP_SIGN_DATE_STYLE.width + 'px',
      height: COMP_SIGN_DATE_STYLE.height + 'px',
    }"
    v-html="testSignSvgRaw"
  ></div>
</template>

<!--style-->
<style scoped lang="less"></style>
