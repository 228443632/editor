<!--
 * @Description: footer 底部
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 03/10/25 PM4:19
 -->
<!--setup-->
<script setup lang="ts">
import FooterUseWidgetList from './FooterUseWidgetList.vue'

const { proxy } = getCurrentInstance()
const props = defineProps({})
const emit = defineEmits([])

/* 状态 */
const __signContext__ = inject('__signContext__') // 预览上下文
const __activePageNum__ = inject('__activePageNum__')

const showUseWidget = ref(false)

const currentPageNum = ref(__signContext__.value.anchorInfo?.active)

/* 方法 */

/**
 * 页码
 */
const onChangePageNum = () => {
  if (currentPageNum.value <= 1) {
    currentPageNum.value = 1
  } else if (currentPageNum.value >= __signContext__.value.contentPageNums) {
    currentPageNum.value = __signContext__.value.contentPageNums
  }
  __activePageNum__.value = currentPageNum.value
}

/**
 * 上一页
 */
const onPrev = () => {
  __activePageNum__.value = __signContext__.value.anchorInfo?.active - 1
}

/**
 * 下一页
 */
const onNext = () => {
  __activePageNum__.value = __signContext__.value.anchorInfo?.active + 1
}

/**
 * 显示隐藏
 */
const onVisibleChange = (visible) => {
  // console.log('visible', visible)
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
  <div class="comp__footer">
    <div class="flex items-center w-full justify-center gap-4">
      <t-popup
        trigger="hover"
        placement="top-left"
        @visible-change="onVisibleChange"
        hide-empty-popup
      >
        <span
          class="inline-flex gap-1 items-center cursor-pointer hover:text-[var(--umo-primary-color)]"
        >
          <t-icon
            name="root-list"
            size="14px"
            title="已使用签署控件集合"
            class="cursor-pointer hover:text-[var(--umo-primary-color)]"
          ></t-icon>
          <span>签署元素：{{ __signContext__.paramsCompList?.length }}个</span>
          <t-icon name="arrow-right" class="arrow-animation"></t-icon>
        </span>
        <template #content>
          <div class="use-widget__wrap p-4 min-w-200px max-w-750px">
            <FooterUseWidgetList></FooterUseWidgetList>
          </div>
        </template>
      </t-popup>
      <div class="flex items-center gap-3 comp__footer__rt">
        <span class="flex items-center"
          >当前页：<text class="font-bold text-4 text-primary">{{
            __signContext__?.anchorInfo?.active
          }}</text>
          <text class="px-1">/</text>
          <text class="font-bold">{{ __signContext__.contentPageNums }}</text>
        </span>
        <t-button
          type="button"
          size="small"
          variant="text"
          :disabled="__signContext__?.anchorInfo?.active <= 1"
          class="!-ml-2px"
          @click="onPrev"
        >
          <span class="inline-flex items-center gap-1 cursor-pointer">
            <t-icon name="arrow-left"> </t-icon>上一页
          </span>
        </t-button>

        <t-button
          type="button"
          size="small"
          variant="text"
          :disabled="
            __signContext__?.anchorInfo?.active >=
            __signContext__.contentPageNums
          "
          class="!-ml-4px"
          @click="onNext"
        >
          <span class="inline-flex items-center gap-1 cursor-pointer">
            下一页 <t-icon name="arrow-right"> </t-icon>
          </span>
        </t-button>

        <span class="hover:text-primary inline-flex items-center gap-1">
          <span class="flex-none">跳转至</span>
          <TInput
            v-model="currentPageNum"
            size="small"
            class="!w-62px"
            @blur="onChangePageNum"
            @enter="onChangePageNum"
          ></TInput>
          <span>页</span>
        </span>
      </div>
    </div>
  </div>
</template>

<!--style-->
<style scoped lang="less">
.comp__footer {
  padding: 0 16px;
  font-size: 12px;
  color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
}

.use-widget__wrap {
}

.comp__footer__rt {
  & > * {
    padding: 0 4px;
  }
}

.arrow-animation {
  animation: arrowSlide 0.9s infinite alternate ease-in-out;
}

@keyframes arrowSlide {
  0% {
    transform: translateX(0);
  }
  40% {
    transform: translateX(6px);
  }
  100% {
    transform: translateX(0px);
  }
}
</style>
