<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 12/10/25 PM8:23
 -->
<!--setup-->
<script setup>
// import 'tdesign-vue-next/es/input/style/index.css'
const { proxy } = getCurrentInstance()
const props = defineProps({})
const emit = defineEmits([])

/* 状态 */
const currentPageNum = ref()

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
  <div class="page">
    <!-- 内容区 -->
    <TInput v-model="currentPageNum" size="small" class="!w-62px"></TInput>
  </div>
</template>

<!--style-->
<style scoped lang="less">
</style>
