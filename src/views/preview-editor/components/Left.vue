<!--
 * @Description: 左侧
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/10/25 PM3:16
 -->
<!--setup-->
<script setup lang="ts">
import testSealSvgRaw from '@/assets/images/test-seal.svg?raw'
import testSealImgRaw from '@/assets/images/test-seal.svg'
import testSealImg from '@/assets/images/test-seal.svg'
import testSignImg from '@/assets/images/test-sign.svg'

const { proxy } = getCurrentInstance()
const props = defineProps({})
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
  <div class="preview-editor__left">
    <div class="left__title">文件签署</div>

    <!-- 内容区 -->
    <div class="left__content umo-scrollbar">
      <!-- 印章 -->
      <div class="left__content-item">
        <!--        <div class="w-180px h-180px" v-html="testSealSvg"></div>-->
        <img :src="testSealImg" class="w-180px w-180px rounded-full" />
      </div>

      <!-- 签名 -->
      <div class="left__content-item">
        <img :src="testSignImg" class="w-88px h-23px rounded-full" />
      </div>

      <!-- 签署日期 -->
      <div class="left__content-item">
        <div class="h-23px flex-center">签署日期</div>
      </div>
    </div>
  </div>
</template>

<!--style-->
<style scoped lang="less">
.preview-editor__left {
  background: transparent;
  border-right: solid 1px var(--umo-border-color);
  width: var(--left-aside-width);
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex: none;
  flex-direction: column;
  position: relative;
}

.left__content-item {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  padding: 8px 0;
  border: 1px solid #e1e4eb;
  border-radius: 4px;
  background: #fff;
  & + .left__content-item {
    margin-top: 12px;
  }
}

.left__title {
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

.left__content {
  flex: 1;
  height: 0;
  overflow-y: auto;
  padding: 16px;
}
</style>
