<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/08/24 4:51 PM
 -->
<!--setup-->
<script setup lang="ts">
// import PdfPreview2 from '@/views/doc-editor/PdfPreview2.vue'

const { proxy } = getCurrentInstance()
import DocEditor from './views/doc-editor/index.vue'
import PreviewEditor from './views/preview-editor/index.vue'
import PreviewResult from './views/preview-result/index.vue'

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
<!--  <DocEditor></DocEditor>-->
<!--  <PreviewEditor></PreviewEditor>-->
  <PreviewResult></PreviewResult>
</template>

<!--style-->
<style lang="less">
</style>
