<!--
 * @Description: 右侧参数库
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 22/04/25 PM2:27
 -->
<!--setup-->
<script setup lang="ts">
const { proxy } = getCurrentInstance()
import type { Node } from 'prosemirror-model'

const props = defineProps({})
const emit = defineEmits({})

/* 状态 */
const page = inject('page')
const editor = inject('editor')
const __compNodeList__ = inject('__compNodeList__') as Ref<[]>

const paramsConfig = ref([
  {
    label: '文本',
    children: [
      {
        label: '普通文本',
        value: 'compText',
        icon: 'params-comp-text',
        click() {
          const compTexts = __compNodeList__.value.filter(
            (item: { node: Node }) => {
              return item.node.type.name == 'compText'
            },
          )
          editor.value
            .chain()
            .focus()
            .setCompText({
              placeholder: `普通文本${compTexts.length + 1}`,
            })
            .run()
        },
      },
    ],
  },
  {
    label: '其他',
    children: [
      { label: '动态表格', value: 'compTable', icon: 'params-comp-table' },
    ],
  },
])

/* 方法 */
/**
 * 隐藏
 */
function onClose() {
  page.value.showRightSlot = false
}

/**
 * 获取html
 */
function onGetHtml() {
  console.log(editor.value.getHTML())
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
  <div class="umo-pr-container">
    <t-button @click="onGetHtml" :block="false" class="!w-[fit-content]"
      >获取HTML</t-button
    >
    <div class="umo-pr-title">
      参数库

      <div class="umo-dialog__close" @click="onClose">
        <icon name="close" size="20" />
      </div>
    </div>

    <div class="umo-pr-content">
      <section
        v-for="(item, index) in paramsConfig"
        :key="index"
        class="umo-pr-group"
      >
        <div class="umo-pr-group__title">{{ item.label }}</div>

        <ul class="flex gap-12px !mt-8px">
          <li
            v-for="(cItem, cIndex) in item.children"
            :key="cIndex"
            class="umo-pr-group__item"
            @click="() => cItem.click?.(cItem)"
          >
            <icon size="16" :name="cItem.icon"></icon>
            <span class="ml-4px">{{ cItem.label }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<!--style-->
<style scoped lang="less">
.umo-pr-container {
  padding-top: var(--padding-top);
  background: transparent;
  width: 100%;
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex: none;
  flex-direction: column;
  position: relative;

  .umo-pr-title {
    width: 100%;
    border-bottom: solid 1px var(--umo-border-color-light);
    display: flex;
    align-items: center;
    font-size: 14px;
    position: relative;
    padding: 0px 4px 10px 16px;
    gap: 14px;
    font-weight: bold;
    box-sizing: border-box;
  }
  .umo-dialog__close {
    position: absolute;
    right: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .umo-pr-content {
    padding: 12px 20px;
  }

  .umo-pr-group {
    & + .umo-pr-group {
      margin-top: 20px;
    }
    .umo-pr-group__title {
      color: #666;
      line-height: 22px;
      font-size: 12px;
    }

    .umo-pr-group__item {
      width: 108px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 12px;
      height: 36px;
      border: 1px solid #e1e4eb;
      border-radius: 4px;
      cursor: pointer;
      &:hover {
        color: var(--umo-primary-color);
        border-color: currentColor;
      }
    }
  }
}
</style>
