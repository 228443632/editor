<!--
 * @Description: 右侧参数库
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 22/04/25 PM2:27
 -->
<!--setup-->
<script setup lang="ts">
import { commonUtil } from '@/examples/utils/common-util'

const { proxy } = getCurrentInstance()
import { useEventListener } from '@vueuse/core'
import type { IDragNodeParamsNode } from '@/examples/extensions/extension/extension-drag-params'
import type { Node } from 'prosemirror-model'
import { cssUtil } from '@/examples/utils/css-util'
import { NodePos } from '@tiptap/vue-3'
import { type Editor } from '@tiptap/core'
import { arrayToObj, blobSaveAs, deepClone, parseJsonNoError } from 'sf-utils2'
import FillFormParamsAE from './FillFormParamsAE.vue' // 表单数据填充

const props = defineProps({})
const emit = defineEmits({})

/* 状态 */
const page = inject('page')
const editor = inject('editor') as Ref<Editor>

const layoutDom = inject('layoutDom')
const __compNodeList__ = inject('__compNodeList__') as Ref<[]>
const isDragging = ref(false)
const fillFormParamsAERef = ref<InstanceType<typeof FillFormParamsAE>>()

const paramsConfig = ref([
  {
    label: '文本',
    children: [
      {
        label: '普通文本',
        value: 'compText',
        icon: 'params-comp-text',
        draggable: true,
        get compTexts() {
          return __compNodeList__.value.filter((item: { node: Node }) => {
            return item.node.type.name == 'compText'
          })
        },
        get attrs() {
          const compTexts = this.compTexts
          return {
            'data-id': commonUtil.simpleUUID(),
            placeholder: `普通文本${compTexts.length + 1}`,
          }
        },
        click() {
          const attrs = this.attrs
          editor.value
            .chain()
            .focus()
            .deleteSelection()
            .setCompText(attrs)
            .run()

          const targetDom = document.querySelector(`span[data-id="${attrs['data-id']}"]`) as HTMLHtmlElement
          targetDom?.click?.()
        },
      },

      {
        label: '姓名',
        value: 'compText',
        icon: 'params-comp-username',
        draggable: true,
        get compTexts() {
          return __compNodeList__.value.filter((item: { node: Node }) => {
            return item.node.type.name == 'compText'
          })
        },
        get attrs() {
          const compTexts = this.compTexts
          return {
            'data-id': commonUtil.simpleUUID(),
            fieldName: 'name',
            placeholder: `姓名${compTexts.length + 1}`,
          }
        },
        click() {
          const attrs = this.attrs
          editor.value
            .chain()
            .focus()
            .deleteSelection()
            .setCompText(attrs)
            .run()

          const targetDom = document.querySelector(`span[data-id="${attrs['data-id']}"]`) as HTMLHtmlElement
          targetDom?.click?.()
        },
      },

      {
        label: '手机号',
        value: 'compText',
        icon: 'params-comp-mobile',
        draggable: true,
        get compTexts() {
          return __compNodeList__.value.filter((item: { node: Node }) => {
            return item.node.type.name == 'compText'
          })
        },
        get attrs() {
          const compTexts = this.compTexts
          return {
            'data-id': commonUtil.simpleUUID(),
            fieldName: 'mobile',
            placeholder: `手机号${compTexts.length + 1}`,
          }
        },
        click() {
          const attrs = this.attrs
          editor.value
            .chain()
            .focus()
            .deleteSelection()
            .setCompText(attrs)
            .run()

          const targetDom = document.querySelector(`span[data-id="${attrs['data-id']}"]`) as HTMLHtmlElement
          targetDom?.click?.()
        },
      },

      {
        label: '身份证',
        value: 'compText',
        icon: 'params-comp-idcard',
        draggable: true,
        get compTexts() {
          return __compNodeList__.value.filter((item: { node: Node }) => {
            return item.node.type.name == 'compText'
          })
        },
        get attrs() {
          const compTexts = this.compTexts
          return {
            'data-id': commonUtil.simpleUUID(),
            fieldName: 'idcard',
            placeholder: `身份证${compTexts.length + 1}`,
          }
        },
        click() {
          const attrs = this.attrs
          editor.value
            .chain()
            .focus()
            .deleteSelection()
            .setCompText(attrs)
            .run()

          const targetDom = document.querySelector(`span[data-id="${attrs['data-id']}"]`) as HTMLHtmlElement
          targetDom?.click?.()
        },
      },
    ],
  },
  {
    label: '其他',
    children: [
      {
        label: '动态表格',
        value: 'compTable',
        icon: 'params-comp-table',
        click() {
          useMessage('warning', { content: '动态表格暂未开发！' })
        },
      },
    ],
  },
  {
    label: '测试',
    children: [
      {
        label: '获取HTML',
        value: '1002',
        icon: 'edit',
        async click() {
          useMessage('loading', { content: '正在导出中', closeBtn: true })
          // const body = onGetHtml()
          const body = (
            document.querySelector(
              '.umo-zoomable-container.umo-scrollbar',
            ) as HTMLElement
          ).outerHTML
          const css = await cssUtil.getCssAll()
          // const css = cssUtil.getAllCSSRules()
          const html = commonUtil.trimSpace(`
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Umo Editor</title>
    <style>
      ${css}
    </style>
    <style>
      #app {
        width: 100%;
        height: 100%;
        display: flex;
      }
    </style>
  </head>
  <body class="preview">
    <div id="app">
      ${body}
    </div>
   </body>
 </html>
        `)
          MessagePlugin.closeAll()
          console.log('html', html)
          blobSaveAs(new Blob([html], { type: 'text/html' }), '合同模版.html')
          useMessage('info', {
            // content: '获取html代码成功，请查看控制台日志！',
            content: '导出成功！',
          })
        },
      },
      {
        label: '模拟数据填充',
        value: '模拟数据填充',
        icon: 'edit',
        click() {
          fillFormParamsAERef.value.visible.dialog = true
          nextTick(() => {
            const data = deepClone(
              __compNodeList__.value.map((item) => ({
                ...item.node?.attrs,
                typeName: '普通文本',
              })),
            )
            fillFormParamsAERef.value.tableInfo.data = data
            const dataObj$FieldName = arrayToObj(data, 'fieldName', {
              valueType: 'array',
            })
            const configString = Object.keys(dataObj$FieldName)
              .map((key, index, list) => {
                const comment = (dataObj$FieldName[key] || [])
                  .map((cItem) => cItem.placeholder)
                  .join('，')
                const dot = index == list.length - 1 ? '' : ','
                return `  ${key}: ''${dot} // ${comment}`
              })
              .join('\n')
            fillFormParamsAERef.value.formData.configValue = [
              `{`,
              configString,
              '}',
            ].join('\n')
          })
        },
      },
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
  return editor.value.getHTML()
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
        ...cItem.attrs,
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

  drop(e: DragEvent) {
    const nodeData = (parseJsonNoError(
      e.dataTransfer?.getData('text/plain'),
    ) || {}) as IDragNodeParamsNode

    console.log('targetDom', nodeData)

    const dataId = nodeData?.attrs?.['data-id']
    if (nodeData.isCompParams) {
      const targetDom = document.querySelector(`span[data-id="${dataId}"]`) as HTMLHtmlElement
      targetDom?.click?.()
    }
  }
}

/* 计算 */

/* 监听 */

/* 周期 */
onMounted(() => {
  const target = ref<HTMLHtmlElement>(editor.value.view.dom)

  useEventListener(target, 'dragover', dragMethod.dragover)
  useEventListener(target, 'dragenter', dragMethod.dragenter)
  useEventListener(target, 'drop', dragMethod.drop)
})

/* 暴露 */
defineExpose({
  $: proxy.$,
})
</script>

<!--render-->
<template>
  <div class="umo-pr-container">
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

        <ul class="grid grid-cols-3 gap-12px !mt-8px">
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

    <!-- 元素表单填充 -->
    <FillFormParamsAE ref="fillFormParamsAERef"></FillFormParamsAE>
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
