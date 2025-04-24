<!--
  * @Description SQL 编辑器
  * @Author mofada
  * @create 2024-11-26 15:49 周二
-->
<script setup lang="ts">
import { sql, MySQL } from '@codemirror/lang-sql'
import { useVModel } from '@vueuse/core' // sql 语言
import Codemirror from './index.vue' // codemirror 6 编辑器

const props = defineProps<{ modelValue?: string }>()
const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const _modelValue = useVModel(props, 'modelValue', emits)

const editorRef = ref<InstanceType<typeof Codemirror>>()

defineExpose({
  /**
   * 获取编辑器实例
   */
  getEditorView() {
    return editorRef.value?.getEditorView()
  },
  appendText(text: string) {
    return editorRef.value?.appendText(text)
  },
})
</script>

<template>
  <Codemirror
    ref="editorRef"
    v-model="_modelValue"
    class="flex-1"
    :extensions="[sql({ dialect: MySQL })]"
  />
</template>

<style scoped lang="less"></style>
