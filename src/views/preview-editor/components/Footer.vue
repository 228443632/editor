<!--
 * @Description: footer 底部
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 03/10/25 PM4:19
 -->
<!--setup-->
<script setup lang="ts">
const { proxy } = getCurrentInstance()
const props = defineProps({})
const emit = defineEmits([])

/* 状态 */
const __previewContext__ = inject('__previewContext__') // 预览上下文

const showUseWidget = ref(false)

/* 方法 */

/**
 * 选择使用控件
 * @param item
 */
const onChooseUseWidgetItem = (item) => {
  __previewContext__.value.selectParamsComp(item)
  const contentEl = __previewContext__.value.contentElRef
  const target = contentEl.querySelector(`[data-id="id-${item.key}"]`)
  if (target) {
    console.log('target', target)
    const esDragerDom = target.querySelector('.es-drager')
    if (esDragerDom) {
      scrollIntoView(esDragerDom)
    } else {
      scrollIntoView(esDragerDom.children[0])
    }
  }

  function scrollIntoView(target: HTMLElement) {
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        // inline: 'center',
      })
    }
  }
}

/**
 * 显示隐藏
 */
const onVisibleChange = (visible) => {
  console.log('visible', visible)
}

/* 计算 */

/**
 * 使用控件集合
 * @private
 */
const _useWidgetList = computed(() => {
  const paramsCompList = __previewContext__.value.paramsCompList || []
  return paramsCompList.map((item) => {
    const { offsetTop, pageNum } =
      __previewContext__.value.getPageOffsetTopByTop(item.top)
    const compNameMap = {
      compSign: '签名',
      compSeal: '印章',
      compSignDate: '签署时间',
    }
    return {
      ...item,
      pageNum,
      offsetTop,
      compName: compNameMap[item.type],
    }
  })
})

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
    <div class="flex items-center gap-4">
      <t-popup
        trigger="click"
        placement="top-left"
        @visible-change="onVisibleChange"
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
          <span>签署元素：{{ _useWidgetList?.length }}个</span>
        </span>
        <template #content>
          <div class="use-widget__wrap min-w-200px">
            <div class="use-widget__title">已使用签署控件集合</div>
            <div class="umo-scrollbar max-h-250px overflow-y-auto py-1">
              <template v-if="_useWidgetList?.length">
                <div
                  v-for="(item, index) in _useWidgetList"
                  :key="item.key"
                  :class="[
                    'use-widget__item',
                    __previewContext__.activeCompParam?.key == item.key &&
                      'is-active',
                  ]"
                  @click="onChooseUseWidgetItem(item)"
                >
                  <span>{{ index + 1 }}、</span>第{{ item.pageNum }}页
                  {{ item.compName }}
                </div>
              </template>
              <div v-else class="min-h-100px flex-center text-12px">
                <t-empty />
              </div>
            </div>
          </div>
        </template>
      </t-popup>
      <span
        >当前页：<span class="font-bold">{{
          __previewContext__?.anchorInfo?.active
        }}</span></span
      >
      <span
        >总页数：<span class="font-bold">{{
          __previewContext__.contentPageNums
        }}</span></span
      >
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
  justify-content: space-between;
  align-items: center;
}

.use-widget__wrap {
  .use-widget__title {
    display: flex;
    display: none;
    align-items: center;
    height: 28px;
    font-size: 12px;
    //font-weight: bold;
    border-bottom: 1px solid var(--umo-border-color);
  }

  .use-widget__item {
    height: 28px;
    display: flex;
    align-items: center;
    padding: 8px;
    font-size: 12px;
    border-radius: 3px;
    cursor: pointer;
    &:hover {
      background: #f3f3f3;
    }
    & + .use-widget__item {
      margin-top: 2px;
    }
    &.is-active {
      background: #f2f3fe;
      color: var(--umo-primary-color);
    }
  }
}
</style>
