<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/08/24 4:51 PM
 -->
<!--setup-->
<script setup lang="ts">
const { proxy } = getCurrentInstance()
import EditorExample from './examples/index.vue'

const props = defineProps({})
const emit = defineEmits({})

/* 状态 */

/* 方法 */

/* 计算 */

/* 监听 */

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({
  $: proxy.$
})
</script>

<!--render-->
<template>
  <EditorExample></EditorExample>
</template>

<!--style-->
<style scoped lang="less">
</style>
