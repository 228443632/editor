<!--
 * @Description: 参数库
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 22/04/25 PM2:05
 -->
<!--setup-->
<script setup lang="ts">
const { proxy } = getCurrentInstance()

const props = defineProps({})
const emit = defineEmits({})

/* 状态 */
const editor = inject('editor')
const page = inject('page')

/* 方法 */

/**
 * 点击
 */
function onClick() {
  page.value.showRightSlot = true
}

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
  <!-- editor?.isEmpty -->
  <menus-button text="参数库" ico="params-lib" huge @menu-click="onClick">
  </menus-button>
</template>

<!--style-->
<style scoped lang="less"></style>
