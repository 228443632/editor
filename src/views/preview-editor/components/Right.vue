<!--
 * @Description: 右侧
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/10/25 PM3:16
 -->
<!--setup-->
<script setup lang="ts">
import RightThumbContent from './RightThumbContent.vue'

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
  <div class="preview-editor__right">
    <!-- 内容区 -->
    <div class="right__title">缩略页3列表</div>

    <div
      :class="[
        'right__content umo-scrollbar',
        !__previewContext__.rightInitial &&
          '!overflow-y-hidden cursor-not-allowed',
      ]"
    >
      <RightThumbContent></RightThumbContent>

      <!--  未初始化  -->
      <div
        v-if="!__previewContext__.rightInitial"
        class="absolute left-0 top-0 h-full w-full z-10 cursor-not-allowed"
      ></div>
    </div>
  </div>
</template>

<!--style-->
<style scoped lang="less">
.preview-editor__right {
  width: clamp(
    var(--right-aside-width),
    calc(
      var(--layout-width) - var(--left-aside-width) - var(--padding-left) * 2 -
        var(--editor-width) - 8px
    ),
    250px
  );
  //background-color: #fff;
  flex: none;
  height: 100%;
  border-left: solid 1px var(--umo-border-color);
  transition: width 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

.right__title {
  width: 100%;
  border-bottom: solid 1px var(--umo-border-color-light);
  display: flex;
  align-items: center;
  font-size: 14px;
  position: relative;
  padding: var(--padding-top) 4px 10px 16px;
  gap: 14px;
  flex: none;
  font-weight: bold;
  box-sizing: border-box;
}

.right__content {
  flex: 1;
  height: 0;
  overflow-y: auto;
  padding: 12px 20px;
  position: relative;
}
</style>
