<!--
 * @Description: 内容区关键字
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 25/10/25 AM10:36
 -->
<!--setup-->
<script setup>
import ContentCompSign from '@/views/sign-editor/components/ContentCompSign.vue'
import ContentCompSignDate from '@/views/sign-editor/components/ContentCompSignDate.vue'
import ContentCompSeal from '@/views/sign-editor/components/ContentCompSeal.vue'

const props = defineProps({
  /**
   * 当前页码
   */
  pageNum: {
    type: Number,
    default: 1,
    required: true,
  },
})
const emit = defineEmits([])

/* 状态 */
const __signContext__ = inject('__signContext__') // 预览上下文
const __activePageNum__ = inject('__activePageNum__')
const __layoutSize__ = inject('__layoutSize__')

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
  <template
    v-for="(item, index) in __signContext__._paramsCompList"
    :key="item.key"
  >
    <template v-if="item.keywords && item.pageNum == pageNum">
      <div
        :data-id="'id-' + item.key"
        :class="[
          'content-kwds-comp__item',
          (item.isInRect ||
            item.key == __signContext__?.activeCompParam?.key) &&
            'content-kwds-comp__item-active',
        ]"
        :style="{
          '--page-num': item.pageNum,
        }"
      >
        <!-- 印章 -->
        <template v-if="item.type == 'compSeal'">
          <ContentCompSeal
            v-model:node-data="__signContext__.paramsCompList[index]"
          ></ContentCompSeal>
        </template>

        <!-- 签名 -->
        <template v-else-if="item.type == 'compSign'">
          <ContentCompSign
            v-model:node-data="__signContext__.paramsCompList[index]"
          ></ContentCompSign>
        </template>

        <!-- 签署日期 -->
        <template v-else-if="item.type == 'compSignDate'">
          <ContentCompSignDate
            v-model:node-data="__signContext__.paramsCompList[index]"
          ></ContentCompSignDate>
        </template>
      </div>
    </template>
  </template>
</template>

<!--style-->
<style scoped lang="less">
@import '@/style/vars';
//.content-kwds-comp__item {
//@primary-color: @warning-color;
//&.is-keywords {
//  outline: 1px dashed @primary-color;
//  background-color: rgba(@primary-color, 0.04);
//}
//}
</style>
