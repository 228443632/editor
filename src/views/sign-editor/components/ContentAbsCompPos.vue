<!--
 * @Description: 内容区参数控件 绝对定位
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 25/10/25 AM10:36
 -->
<!--setup-->
<script setup lang="ts">
import ContentCompSign from '@/views/sign-editor/components/ContentCompSign.vue'
import ContentCompSealDate from '@/views/sign-editor/components/ContentCompSealDate.vue'
import ContentCompSignDate from '@/views/sign-editor/components/ContentCompSignDate.vue'
import ContentCompSeal from '@/views/sign-editor/components/ContentCompSeal.vue'
import { COMP_PARAMS_NAME_MAP } from '@/views/doc-editor/extensions/constant'

const props = defineProps({})
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
  <div class="contents">
    <template
      v-for="(item, index) in __signContext__._paramsCompList"
      :key="item.key"
    >
      <template v-if="!item.keywords">
        <div
          :data-id="'id-' + item.key"
          :class="[
            'content-comp__item',
            (item.isInRect ||
              item.key == __signContext__?.activeCompParam?.key) &&
              'content-comp__item-active',
          ]"
          :style="{
            '--page-num': item.pageNum,
            '--mt': -((item.pageNum - 1) * __layoutSize__.perPageGap) + 'px',
          }"
        >
          <!-- 印章 -->
          <template v-if="item.type == COMP_PARAMS_NAME_MAP.compSeal">
            <ContentCompSeal
              v-model:node-data="__signContext__.paramsCompList[index]"
            ></ContentCompSeal>
          </template>

          <!-- 签名 -->
          <template v-else-if="item.type == COMP_PARAMS_NAME_MAP.compSign">
            <ContentCompSign
              v-model:node-data="__signContext__.paramsCompList[index]"
            ></ContentCompSign>
          </template>

          <!-- 签署日期 -->
          <template v-else-if="item.type == COMP_PARAMS_NAME_MAP.compSignDate">
            <ContentCompSignDate
              v-model:node-data="__signContext__.paramsCompList[index]"
            ></ContentCompSignDate>
          </template>

          <!-- 用印时间 -->
          <template v-else-if="item.type == COMP_PARAMS_NAME_MAP.compSealDate">
            <ContentCompSealDate
              v-model:node-data="__signContext__.paramsCompList[index]"
            ></ContentCompSealDate>
          </template>
        </div>
      </template>
    </template>
  </div>
</template>

<!--style-->
<style scoped lang="less">
.content-comp__item-active {
  .e-drager-wrap {
    z-index: 100;
  }
  :deep {
    .es-drager {
      z-index: 100 !important;
    }
  }
}
</style>
