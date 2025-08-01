<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 31/07/25 AM9:44
 -->
<!--setup-->
<script setup lang="ts">
import type { PaginationBreakOptions } from '../pagination-break'

const props = defineProps({
  /**
   * 分页参数选项
   */
  pageOptions: {
    type: Object as PropType<PaginationBreakOptions>,
    default: () => ({}),
  },

  /**
   * 当前页码
   */
  pageNum: {
    type: Number,
    default: 1,
  },

  /**
   * 总页数
   */
  total: {
    type: Number,
    default: 1,
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
defineExpose({})
</script>

<!--render-->
<template>
  <div class="umo-page-node-header w-full" contenteditable="false">
    <div
      class="umo-page-corner corner-tl"
      style="width: var(--umo-page-margin-left)"
    ></div>

    <div class="umo-page-node-header-content"></div>
    <div
      class="umo-page-corner corner-tr"
      style="width: var(--umo-page-margin-right)"
    ></div>
  </div>
</template>

<!--style-->
<style scoped lang="less">
</style>
