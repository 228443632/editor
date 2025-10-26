<!--
 * @Description: 内容区 模版名称字段 关键字定位
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 25/10/25 AM10:36
 -->
<!--setup-->
<script setup lang="ts">
import type {
  IParamsCompItem,
  TParamsCompKeywordItem,
} from '@/views/sign-editor/types/types.ts'
import { pageUtils } from '@/views/sign-editor/utils/commons.ts'

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

const canvasRef = ref<HTMLCanvasElement>()

const a4 = pageUtils.a4

/* 方法 */
/**
 * 获取每一项样式。
 * @param item
 * @param index
 * @param list
 */
const getItemStyle = (
  item: TParamsCompKeywordItem,
  index: number,
  list = [],
) => {
  const scaleFactor = +__signContext__.value.scaleFactor

  const left = item.left * scaleFactor
  const top = item.top * scaleFactor - 1
  const width = item.width * scaleFactor
  const height = item.height * scaleFactor + 2

  const distance = 2

  if (index == 0) {
    // 第一个
    return {
      left: `${left - distance}px`,
      top: `${top}px`,
      width: `${width + distance}px`,
      height: `${height}px`,
    }
  }
  if (index == list.length - 1) {
    // 最后一个
    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width + distance}px`,
      height: `${height}px`,
    }
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
  }
}

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
onMounted(() => {
  // const ctx = canvasRef.value.getContext('2d')
  // ctx.strokeStyle = 'red';
  // ctx.fillStyle = 'green';
  // ctx.beginPath()
  // ctx.rect(10, 10, 100, 100)
  // ctx.stroke()
  // console.log('ctx', ctx, _highlightTpNamesPosList.value)
})

/* 暴露 */
defineExpose({})

// pointer-events-none
</script>

<!--render-->
<template>
  <div
    v-for="cItem in _highlightTpNamesPosList"
    :key="cItem.key"
    class="keyword-box absolute left-0 top-0"
  >
    <div
      v-for="(subCItem, subCIndex) in cItem.list"
      :key="subCItem.key"
      :class="[
        'tp-name__item',
        keywordsType == 'tpName' && 'is-tp-name',
        keywordsType == 'compKeywords' && 'is-comp-keywords',
        keywordsType == 'compKeywords' &&
          _activeParamsNameObj[cItem.key] &&
          'is-active',
        subCIndex == 0 && 'is-first',
        subCIndex == cItem.list?.length - 1 && 'is-last',
      ]"
      :style="getItemStyle(subCItem, subCIndex, cItem.list)"
    ></div>
  </div>

  <!-- canvas  -->
  <canvas
    class="absolute left-0 top-0 pointer-events-none"
    :width="a4._basePx.w"
    :height="a4._basePx.h"
    ref="canvasRef"
  ></canvas>
</template>

<!--style-->
<style scoped lang="less">
@import '@/style/vars';
.keyword-box {
  //& > div:first-child {
  //  outline: 1px solid @warning-color;
  //}
}

//@warning-color: @error-color;
.tp-name__item {
  position: absolute;
  z-index: 1;
  border: 2px dashed transparent;
  pointer-events: none;
  &.is-tp-name {
    background: rgba(@primary-color, 0.04);
  }

  &.is-comp-keywords {
    background: rgba(@warning-color, 0.2);
    border: 1px dashed @warning-color;
    border-left: none;
    border-right: none;
    &.is-first {
      border-left: 1px dashed @warning-color;
    }

    &.is-last {
      border-right: 1px dashed @warning-color;
    }
  }

  &.is-active {
    background: rgba(@warning-color, 0.3);
    border: 2px solid @warning-color;
    border-left: none;
    border-right: none;
    z-index: 20;
    &.is-first {
      border-left: 2px solid @warning-color;
    }

    &.is-last {
      border-right: 2px solid @warning-color;
    }
  }
}
</style>
