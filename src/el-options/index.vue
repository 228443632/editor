<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 18/09/25 PM7:24
 -->
<!--default-->
<script>
export default { name: 'Demo' }
</script>
<!--setup-->
<script setup>
import { onMounted, getCurrentInstance } from 'vue'

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
  <div class="page">
    <!-- 内容区 -->
  </div>
</template>

<!--style-->
<style scoped lang="less">
.page {
}
</style>
