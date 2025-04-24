<!--
  * @Description codemirror 6 编辑器
  * @Author 莫发达
  * @create 2024-09-20 15:50 周五
-->
<script setup lang="ts">
import type { Extension } from '@codemirror/state'
import { EditorState } from '@codemirror/state'
import type { ViewUpdate } from '@codemirror/view'
import {
  EditorView,
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  highlightActiveLine,
  // eslint-disable-next-line vue/no-dupe-keys
  placeholder,
  keymap,
} from '@codemirror/view'
import { defaultKeymap, historyKeymap, history } from '@codemirror/commands'
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language' // 折叠
import { lintGutter, lintKeymap } from '@codemirror/lint'
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete' // 自动完成

const props = defineProps<{
  /**
   * 绑定值
   */
  modelValue: string
  /**
   * 占位符
   */
  placeholder?: string
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 扩展
   */
  extensions?: Extension[]
}>()
const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const divContainer = ref<HTMLDivElement>()

/**
 * JSON 编辑器
 */
let _editorView: EditorView | null = null

onMounted(() => {
  const editorState = EditorState.create({
    // 显示文本
    doc: props.modelValue ?? '',
    extensions: [
      // 基础
      lineNumbers(), // 显示行
      highlightActiveLine(), // 高亮当前行
      highlightActiveLineGutter(), // 高亮行
      highlightSpecialChars(), // 高亮特殊字符
      placeholder(props.placeholder ?? '请输入'), // 占位符
      // 历史记录
      history(), // 历史记录
      // 自动补全
      autocompletion(),
      closeBrackets(),
      // 语言配置
      bracketMatching(), // 匹配括号
      foldGutter(), // 折叠
      indentOnInput(), // 缩进
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }), // 语法高亮
      lintGutter(), // 代码检查, 考虑移除掉，会有红点占位置
      keymap.of([
        ...defaultKeymap,
        ...foldKeymap,
        ...historyKeymap,
        ...lintKeymap,
        ...closeBracketsKeymap,
        ...completionKeymap,
      ]),
      // 修改内容时的监听, 当内容变更时触发
      EditorView.updateListener.of(onInputValue),
      EditorView.lineWrapping,
      EditorView.editable.of(!props.disabled), // 是否可编辑
      ...(props.extensions ?? []),
    ],
  })

  _editorView = new EditorView({
    // 状态
    state: editorState,
    // 绑定元素
    parent: divContainer.value,
  })
})
onUnmounted(() => {
  _editorView?.destroy()
})

/**
 * 编辑器内容变化
 * @param update
 */
function onInputValue(update: ViewUpdate) {
  // 如果没有改变则忽略
  if (!update.docChanged) return

  // 保存数据，触发更新
  const value = update.state.doc.toString()
  emits('update:modelValue', value)
  _currentValue = value
}

let _currentValue = ''
watch(
  () => props.modelValue,
  (value) => {
    // 如果值相同则忽略
    if (value === _currentValue) return

    const currentValue = _editorView?.state.doc.toString()
    if (value !== currentValue && !_editorView) return

    console.log('value', value, currentValue)

    // 数据不一致时才渲染, 防止重复渲染
    const { from, to } = _editorView.state.selection.main

    const sections = { anchor: from, head: to }

    // 保持光标位置，光标越界处理
    if (sections.anchor > value.length) sections.anchor = value.length
    if (sections.head > value.length) sections.head = value.length

    _editorView.dispatch({
      changes: {
        from: 0,
        to: _editorView.state.doc.length,
        insert: value,
      },
      selection: sections,
      scrollIntoView: true,
    })
  },
)

defineExpose({
  /**
   * 获取编辑器实例
   */
  getEditorView() {
    return _editorView
  },
  appendText(text: string) {
    _editorView?.dispatch({
      changes: { from: _editorView.state.doc.length, insert: text },
      selection: { anchor: _editorView.state.doc.length + text.length },
      scrollIntoView: true,
    })
  },
})
</script>

<template>
  <div ref="divContainer" class="editor" />
</template>

<style scoped lang="less">
.editor {
  max-height: 100%;
  overflow: hidden;
  font-size: 14px;

  :deep(.cm-editor) {
    height: 100%;
  }
}
</style>
