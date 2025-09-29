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
import { type Editor } from '@tiptap/core'
import { arrayToObj, blobSaveAs, deepClone, parseJsonNoError } from 'sf-utils2'
import FillFormParamsAE from './FillFormParamsAE.vue'
import { tiptapUtil } from '@/examples/utils/tiptap-util'
import {
  COMP_PARAMS_NAME_MAP,
  COMP_SEAL_STYLE,
  COMP_SIGN_STYLE,
  FLOAT_NODE_TYPE_MAP,
} from '@/examples/extensions/constant' // 表单数据填充
import testSealImg from '@/assets/images/test-seal.svg'
import testSealImgRaw from '@/assets/images/test-seal.svg?raw'
import testSignImg from '@/assets/images/test-sign.svg'
import testSignImgRaw from '@/assets/images/test-sign.svg?raw'

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
        draggable: true,
        getCompTexts() {
          return __compNodeList__.value.filter((item: { node: Node }) => {
            return item.node.type.name == 'compText'
          })
        },
        getAttrs() {
          const compTexts = this.getCompTexts()
          const cssText = tiptapUtil.getStyleBySelection(editor.value)
          console.log('cssText', cssText)
          return {
            'data-id': commonUtil.simpleUUID(),
            cssText,
            // placeholder: `普通文本${compTexts.length + 1}`,
            placeholder: `普通文本`,
          }
        },
        click() {
          const attrs = this.getAttrs()
          editor.value
            .chain()
            .focus()
            .deleteSelection()
            .setCompText(attrs)
            .run()

          // const targetDom = document.querySelector(
          //   `span[data-id="${attrs['data-id']}"]`,
          // ) as HTMLHtmlElement
          // targetDom?.click?.()
        },
      },

      {
        label: '姓名',
        value: 'compText',
        draggable: true,
        getCompTexts() {
          return __compNodeList__.value.filter((item: { node: Node }) => {
            return item.node.type.name == 'compText'
          })
        },
        getAttrs() {
          const compTexts = this.getCompTexts()
          const cssText = tiptapUtil.getStyleBySelection(editor.value)
          return {
            'data-id': commonUtil.simpleUUID(),
            fieldName: 'name',
            placeholder: `姓名${compTexts.length + 1}`,
            cssText,
            // placeholder: `姓名`,
          }
        },
        click() {
          const attrs = this.getAttrs()
          editor.value
            .chain()
            .focus()
            .deleteSelection()
            .setCompText(attrs)
            .run()

          const targetDom = document.querySelector(
            `span[data-id="${attrs['data-id']}"]`,
          ) as HTMLHtmlElement
          targetDom?.click?.()
        },
      },

      {
        label: '手机号',
        value: 'compText',
        draggable: true,
        getCompTexts() {
          return __compNodeList__.value.filter((item: { node: Node }) => {
            return item.node.type.name == 'compText'
          })
        },
        getAttrs() {
          const compTexts = this.getCompTexts()
          const cssText = tiptapUtil.getStyleBySelection(editor.value)
          return {
            'data-id': commonUtil.simpleUUID(),
            fieldName: 'mobile',
            // placeholder: `手机号${compTexts.length + 1}`,
            placeholder: `手机号`,
            cssText,
          }
        },
        click() {
          const attrs = this.getAttrs()
          editor.value
            .chain()
            .focus()
            .deleteSelection()
            .setCompText(attrs)
            .run()

          const targetDom = document.querySelector(
            `span[data-id="${attrs['data-id']}"]`,
          ) as HTMLHtmlElement
          targetDom?.click?.()
        },
      },

      {
        label: '身份证',
        value: 'compText',
        draggable: true,
        getCompTexts() {
          return __compNodeList__.value.filter((item: { node: Node }) => {
            return item.node.type.name == 'compText'
          })
        },
        getAttrs() {
          const compTexts = this.getCompTexts()
          const cssText = tiptapUtil.getStyleBySelection(editor.value)
          return {
            'data-id': commonUtil.simpleUUID(),
            fieldName: 'idcard',
            // placeholder: `身份证${compTexts.length + 1}`,
            placeholder: `身份证`,
            cssText,
          }
        },
        click() {
          const attrs = this.getAttrs()
          editor.value
            .chain()
            .focus()
            .deleteSelection()
            .setCompText(attrs)
            .run()

          const targetDom = document.querySelector(
            `span[data-id="${attrs['data-id']}"]`,
          ) as HTMLHtmlElement
          targetDom?.click?.()
        },
      },

      {
        label: '文本悬浮',
        value: 'compTextDrag',
        draggable: true,
        getCompTexts() {
          return __compNodeList__.value.filter((item: { node: Node }) => {
            return item.node.type.name == COMP_PARAMS_NAME_MAP.compTextDrag
          })
        },
        getAttrs() {
          return {
            'data-id': commonUtil.simpleUUID(),
            fieldName: 'idcard',
            // placeholder: `文本悬浮${compTexts.length + 1}`,
            placeholder: `文本悬浮`,
          }
        },
        click() {
          const state = editor.value.state
          const attrs = this.getAttrs()
          editor.value
            .chain()
            .focus()
            .deleteSelection()
            .insertCompTextDrag({
              type: COMP_PARAMS_NAME_MAP.compTextDrag,
              attrs,
            })
            .run()

          const targetDom = document.querySelector(
            `[data-id="${attrs['data-id']}"]`,
          ) as HTMLHtmlElement
          targetDom?.click?.()
        },
      },

      {
        label: '文本悬浮2',
        value: 'compTextareaDrag',
        draggable: true,
        getCompTexts() {
          return __compNodeList__.value.filter((item: { node: Node }) => {
            return item.node.type.name == COMP_PARAMS_NAME_MAP.compTextareaDrag
          })
        },
        getAttrs() {
          return {
            'data-id': commonUtil.simpleUUID(),
            fieldName: 'idcard',
            // placeholder: `文本悬浮${compTexts.length + 1}`,
            placeholder: `文本悬浮2`,
          }
        },
        click() {
          const attrs = this.getAttrs()
          editor.value
            .chain()
            .focus()
            .deleteSelection()
            .insertCompTextareaDrag({
              attrs,
            })
            .run()

          const targetDom = document.querySelector(
            `[data-id="${attrs['data-id']}"]`,
          ) as HTMLHtmlElement
          targetDom?.click?.()
        },
      },
    ],
  },
  {
    label: '其他',
    children: [
      {
        type: 'seal',
        value: 'compSeal',
        getAttrs() {
          return {
            'data-id': commonUtil.simpleUUID(),
            fieldName: 'idcard',
            placeholder: '印章'
          }
        },
      },
      {
        type: 'sign',
        value: 'compSign',
        getAttrs() {
          return {
            'data-id': commonUtil.simpleUUID(),
            fieldName: 'idcard',
            placeholder: '签名'
          }
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
        click() {
          const mockJson = {
            name: '张三',
            mobile: '19166662333', //
            idcard: '341210199909091010', //
          }

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
                return `  ${key}: '${mockJson[key] || ''}'${dot} // ${comment}`
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
      attrs: {
        ...cItem.getAttrs(),
      },
    } as IDragNodeParamsNode

    // isCompParams 是自定义的参数节点
    e.dataTransfer?.setData('text/plain', JSON.stringify(nodeData))
    e.dataTransfer.effectAllowed = 'move'

    const targetNode = e.target as HTMLElement
    dragMethod.dragNodeDom = targetNode

    console.log('cItem.type', cItem)

    if (cItem.value == COMP_PARAMS_NAME_MAP.compSeal) {
      // 印章
      const dragImage = document.createElement('div')
      document.body.prepend(dragImage)
      dragImage.style.cssText =
        'position: fixed; left: -9999px; top: -9999px; z-index: -100'
      dragImage.innerHTML = testSealImgRaw
      dragImage.style.width = COMP_SEAL_STYLE.width + 'px'
      dragImage.style.height = COMP_SEAL_STYLE.height + 'px'
      dragImage.style.border = '2px dashed var(--umo-primary-color)'
      e.dataTransfer.setDragImage(
        dragImage,
        -dragImage.offsetWidth,
        -dragImage.offsetHeight,
      )
      setTimeout(() => dragImage.remove())
    } else if (cItem.value == COMP_PARAMS_NAME_MAP.compSign) {
      // 签名
      const dragImage = document.createElement('div')
      document.body.prepend(dragImage)
      dragImage.style.cssText =
        'position: fixed; left: -9999px; top: -9999px; z-index: -100'
      dragImage.innerHTML = testSignImgRaw
      dragImage.style.width = COMP_SIGN_STYLE.width + 'px'
      dragImage.style.height = COMP_SIGN_STYLE.height + 'px'
      dragImage.style.border = '2px dashed var(--umo-primary-color)'
      e.dataTransfer.setDragImage(
        dragImage,
        -dragImage.offsetWidth,
        -dragImage.offsetHeight,
      )
      setTimeout(() => dragImage.remove())
    } else {
      // 设置透明度
      targetNode.classList.add('is-dragging')
      e.dataTransfer.setDragImage(
        targetNode,
        -targetNode.offsetWidth,
        -targetNode.offsetHeight - 24,
      )
    }

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
    const nodeData = (parseJsonNoError(e.dataTransfer?.getData('text/plain')) ||
      {}) as IDragNodeParamsNode

    const dataId = nodeData?.attrs?.['data-id']
    const targetDom = document.querySelector(
      `[data-id="${dataId}"]`,
    ) as HTMLHtmlElement
    targetDom && targetDom?.click?.()
  },
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

    <div class="umo-pr-content umo-scrollbar">
      <section
        v-for="(item, index) in paramsConfig"
        :key="index"
        class="umo-pr-group"
      >
        <div class="umo-pr-group__title">{{ item.label }}</div>

        <ul class="grid 2xl:grid-cols-3 container grid-cols-2 gap-12px !mt-8px">
          <li
            v-for="(cItem, cIndex) in item.children"
            :key="cIndex"
            :class="[
              'umo-pr-group__item',
              cItem.class,
              cItem.type && `is-${cItem.type}`,
            ]"
            v-bind="cItem"
            @click="() => cItem.click?.(cItem)"
            @dragstart="(event) => dragMethod.dragStart(cItem, event)"
            @dragend="dragMethod.dragend"
          >
            <template v-if="cItem.type == 'seal'">
              <img :src="testSealImg" class="w-64px h-64px rounded-full" />
            </template>

            <template v-else-if="cItem.type == 'sign'">
              <img :src="testSignImg" class="w-88px h-23px rounded-full" />
            </template>

            <template v-else>
              <!--              <icon size="16" :name="cItem.icon"></icon>-->
              <span class="ml-4px">{{ cItem.label }}</span>
            </template>
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
    flex: none;
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
    flex: 1;
    height: 0;
    overflow-y: auto;
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
      // width: 108px;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 12px;
      min-height: 36px;
      padding: 8px 0;
      border: 1px solid #e1e4eb;
      border-radius: 4px;
      cursor: pointer;
      @primary-color: #2d49d1;
      &.is-dragging {
        border: 2px dashed red;
        cursor: grabbing;
        box-shadow: 0px 6px 16px -8px rgba(0, 0, 0, 0.08);
        background-color: rgba(var(--umo-primary-color), 0.12);
      }
      &.is-seal {
        .is-dragging {
          border-radius: 50%;
          overflow: hidden;
        }
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
