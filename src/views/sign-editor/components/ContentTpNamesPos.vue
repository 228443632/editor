<!--
 * @Description: 内容区 模版名称字段 关键字定位
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 25/10/25 AM10:36
 -->
<!--setup-->
<script setup lang="ts">
import type { IParamsCompItem } from '@/views/sign-editor/types/types.ts'

const props = defineProps({
  /**
   * 高亮关键字 列表
   */
  highlightTpNamesPosList: {
    type: Array as PropType<IParamsCompItem[]>,
    default: () => [],
  },

  /**
   * 当前页码
   */
  pageNum: {
    type: Number,
    default: 1,
  },

  /**
   * 关键字类型
   */
  keywordsType: {
    type: String as PropType<'tpName' | 'compKeywords'>,
    default: 'tpName',
  },
})
const emit = defineEmits([])

/* 状态 */
const __signContext__ = inject('__signContext__') // 预览上下文
const __activePageNum__ = inject('__activePageNum__')
const __layoutSize__ = inject('__layoutSize__')

/* 方法 */

/* 计算 */

/**
 * 高亮关键字 列表
 */
const _highlightTpNamesPosList = computed(() => {
  return props.highlightTpNamesPosList.filter((cItem) => {
    return cItem.pageNum == props.pageNum
  })
})

/**
 * 当前激活的参数
 */
const _activeParamsNameObj = computed(() => {
  const activeObj = {
    [__signContext__.value.activeCompParam?.key]: true,
  }
  __signContext__.value.paramsCompList.forEach((item) => {
    if (item.isInRect) {
      activeObj[item.key] = true
    }
  })
  return activeObj
})

/* 监听 */

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({})
</script>

<!--render-->
<template>
  <div
    v-for="cItem in _highlightTpNamesPosList"
    :key="cItem.key"
    class="keyword-box absolute left-0 top-0"
  >
    <div
      v-for="subCItem in cItem.list"
      :key="subCItem.key"
      :class="[
        'absolute z-1 outline-2px outline-solid pointer-events-none',
        keywordsType == 'tpName' && 'bg-primary/4 outline-primary',

        // 是否组件关键字 且 高亮
        keywordsType == 'compKeywords' &&
          'bg-warning/20 !outline-1px outline-warning outline-dashed',
        keywordsType == 'compKeywords' &&
          _activeParamsNameObj[cItem.key] &&
          '!bg-warning/40   !outline-2px z-20',
      ]"
      :style="{
        left: subCItem.left * +__signContext__.scaleFactor + 'px',
        top: subCItem.top * +__signContext__.scaleFactor + 'px',
        width: subCItem.width * +__signContext__.scaleFactor + 'px',
        height: subCItem.height * +__signContext__.scaleFactor + 'px',
      }"
    ></div>
  </div>
</template>

<!--style-->
<style scoped lang="less">
.keyword-box {
  //& > div:first-child {
  //  outline: 1px solid @warning-color;
  //}
}
</style>
