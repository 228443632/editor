<!--
 * @Description: 内容区域放大/缩小
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 29/10/25 PM2:08
 -->
<!--setup-->
<script setup lang="ts">
import redoSvgRaw from '@/assets/images/sign-editor/redo.svg?raw' // 恢复
import undoSvgRaw from '@/assets/images/sign-editor/undo.svg?raw'
import { getShortcut } from '@/utils/shortcut.ts' // 撤回

const props = defineProps({})
const emit = defineEmits([])

/* 状态 */
const __signContext__ = inject('__signContext__') // 预览上下文

/* 方法 */

/**
 * 撤回
 */
const onUndo = () => {
  console.log('onUndo')
  __signContext__.value.manalHistory.undo()
}

/**
 * 恢复
 */
const onRedo = () => {
  __signContext__.value.manalHistory.redo()
}

/* 计算 */

/* 监听 */

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({})
</script>

<!--render-->
<template>
  <div class="fixed bottom-40px z-10 flex ml-16px">
    <!--    <div class="content-zoom__container">-->
    <!--      &lt;!&ndash;  缩小  &ndash;&gt;-->
    <!--      <t-tooltip theme="light" placement="top" destroy-on-close content="缩小">-->
    <!--        <t-button type="button" variant="text" size="small">-->
    <!--          <t-icon name="zoom-out" size="16px"></t-icon>-->
    <!--        </t-button>-->
    <!--      </t-tooltip>-->

    <!--      &lt;!&ndash;  放大  &ndash;&gt;-->
    <!--      <t-tooltip theme="light" placement="top" destroy-on-close content="放大">-->
    <!--        <t-button type="button" variant="text" size="small">-->
    <!--          <t-icon name="zoom-in" size="16px"></t-icon>-->
    <!--        </t-button>-->
    <!--      </t-tooltip>-->
    <!--    </div>-->
    <div class="content-zoom__container is-history" @click.stop @mousedown.stop>
      <!--  撤回 -->
      <t-tooltip
        theme="light"
        placement="top"
        destroy-on-close
        :content="`撤回 (${getShortcut('Ctrl+Z')})`"
      >
        <t-button
          type="button"
          :disabled="!__signContext__.manalHistory?.canUndo"
          variant="text"
          size="small"
          @click="onUndo"
          v-html="undoSvgRaw"
        >
        </t-button>
      </t-tooltip>

      <!--  恢复 -->
      <t-tooltip
        theme="light"
        placement="top"
        destroy-on-close
        :content="`恢复 (${getShortcut('Ctrl+Y')})`"
      >
        <t-button
          type="button"
          :disabled="!__signContext__.manalHistory?.canRedo"
          variant="text"
          size="small"
          @click="onRedo"
          v-html="redoSvgRaw"
        >
        </t-button>
      </t-tooltip>
    </div>
  </div>
</template>

<!--style-->
<style scoped lang="less">
@border-color: #d9d9d9;
.content-zoom__container {
  border: 1px solid @border-color;
  box-shadow: 0 4px 8px @border-color;
  background: #fff;
  border-radius: 6px;
  align-items: center;
  gap: 4px;
  padding: 8px;
  display: flex;
  width: fit-content;
}
.inline-flex-center {
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.is-history {
  :deep {
    svg {
      width: 16px;
      height: 16px;
    }
  }
}
</style>
