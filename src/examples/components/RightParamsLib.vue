<!--
 * @Description: 右侧参数库
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 22/04/25 PM2:27
 -->
<!--setup-->
<script setup lang="ts">
import { parseJsonNoError } from 'sf-utils2'

const { proxy } = getCurrentInstance()
import type { Node } from 'prosemirror-model'
import { useEventListener } from '@vueuse/core'
import type { IDragNodeParamsNode } from '@/examples/extensions/extension/extension-drag-params'

const props = defineProps({})
const emit = defineEmits({})

/* 状态 */
const page = inject('page')
const editor = inject('editor')
const layoutDom = inject('layoutDom')
const __compNodeList__ = inject('__compNodeList__') as Ref<[]>
const isDragging = ref(false)

const paramsConfig = ref([
  {
    label: '文本',
    children: [
      {
        label: '普通文本',
        value: 'compText',
        icon: 'params-comp-text',
        draggable: 'true',
        get compTexts() {
          return __compNodeList__.value.filter((item: { node: Node }) => {
            return item.node.type.name == 'compText'
          })
        },
        click() {
          const compTexts = this.compTexts
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

const dragMethod = {
  /**
   * 拖动的参数节点，是dom节点
   */
  dragNodeDom: undefined,

  /**
   * 拖拽开始
   * @param cItem
   * @param e
   */
  dragStart(cItem, e: DragEvent) {
    isDragging.value = true

    const nodeData = {
      ...cItem,
      type: cItem.value,
      isCompParams: true,
      attrs: {
        placeholder: `普通文本${cItem.compTexts.length + 1}`,
      },
    } as IDragNodeParamsNode

    // isCompParams 是自定义的参数节点
    e.dataTransfer?.setData('text/plain', JSON.stringify(nodeData))
    e.dataTransfer.effectAllowed = 'move'

    // 设置透明度
    const targetNode = e.target as HTMLElement
    targetNode.classList.add('is-dragging')
    dragMethod.dragNodeDom = targetNode
    e.dataTransfer.setDragImage(
      targetNode,
      -targetNode.offsetWidth,
      -targetNode.offsetHeight - 24,
    )

    // 设置光标颜色
    const viewDom = editor.value.view.dom
    viewDom.classList.add('caret--is-dragging')
  },

  dragenter() {
    const dropzone = layoutDom.value.pageContent as HTMLHtmlElement
    if (isDragging.value) {
      dropzone.classList.add('umo-page-content--dragging')
    }
  },

  dragend(e: DragEvent) {
    const dropzone = layoutDom.value.pageContent as HTMLHtmlElement
    isDragging.value = false

    // 移除
    dropzone.classList.remove('umo-page-content--dragging')

    // 移除设置光标颜色
    const viewDom = editor.value.view.dom
    viewDom.classList.remove('caret--is-dragging')

    // 释放引用 oc
    dragMethod.dragNodeDom.classList.remove('is-dragging')
    dragMethod.dragNodeDom = null
  },

  dragover(e: DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move' // 设置为移动操作
  },
}

/* 计算 */

/* 监听 */

/* 周期 */
onMounted(() => {
  const target = ref<HTMLHtmlElement>(editor.value.view.dom)

  useEventListener(target, 'dragover', dragMethod.dragover)
  useEventListener(target, 'dragenter', dragMethod.dragenter)
})

/* 暴露 */
defineExpose({
  $: proxy.$,
})
</script>

<!--render-->
<template>
  <div class="umo-pr-container">
    <div class="px-16px">
      <t-button
        @click="onGetHtml"
        :block="false"
        size="small"
        class="!w-[fit-content]"
        >获取HTML</t-button
      >
    </div>
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
            v-bind="cItem"
            @click="() => cItem.click?.(cItem)"
            @dragstart="(event) => dragMethod.dragStart(cItem, event)"
            @dragend="dragMethod.dragend"
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
      @primary-color: #2d49d1;
      &.is-dragging {
        cursor: grabbing;
        border-style: dashed;
        box-sizing: 0px 6px 16px -8px rgba(0, 0, 0, 0.08);
        background-color: rgba(@primary-color, 0.12);
      }
      &[draggable] {
        cursor: grab;
      }
      &:hover {
        color: var(--umo-primary-color);
        border-color: currentColor;
      }
    }
  }
}
</style>
<style lang="less">
.umo-page-content--dragging {
  outline: 2px dashed var(--umo-primary-color);
}
</style>
