<!--
 * @Description: footer 底部
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 03/10/25 PM4:19
 -->
<!--setup-->
<script setup>
const { proxy } = getCurrentInstance()
const props = defineProps({})
const emit = defineEmits([])

/* 状态 */
const __previewContext__ = inject('__previewContext__') // 预览上下文

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
  <div class="comp__footer">
    <div class="flex items-center gap-4">
      <span
        >当前页：<span class="font-bold">{{
          __previewContext__?.anchorInfo?.active
        }}</span></span
      >
      <span
        >总页数：<span class="font-bold">{{
          __previewContext__.contentPageNums
        }}</span></span
      >
    </div>
  </div>
</template>

<!--style-->
<style scoped lang="less">
.comp__footer {
  padding: 0 16px;
  font-size: 12px;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
