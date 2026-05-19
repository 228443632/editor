<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 07/02/26 PM9:57
 -->
<!--setup-->
<script setup>
const { proxy } = getCurrentInstance()
const props = defineProps({})
const emit = defineEmits([])


/* 状态 */

/* 方法 */

/* 计算 */

/* 监听 */

/* 周期 */
onMounted(() => {
})

/* 暴露 */
defineExpose({
  $: proxy.$
})
</script>

<!--render-->
<template>
  <t-watermark
    is-repeat
    removable
    :watermark-content="{
      text: '仅供预览，不具备法律效力',
      fontColor: 'rgba(0,0,0,0.2)',
    }"
    :width="180"
    :height="28"
    :y="180"
    :x="0"
  >
    <slot></slot>
  </t-watermark>
</template>

<!--style-->
<style scoped lang="less">
.page {
}
</style>
