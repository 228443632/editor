<script setup lang="ts">
import Codemirror from './index.vue' // codemirror 6 编辑器
import { useVModel } from '@vueuse/core' // json 语言
import { javascript } from '@codemirror/lang-javascript' // 引入 JavaScript 语言支持
// import { esLint } from '@codemirror/lang-javascript/es-lint'; // ESLint 集成

const props = defineProps<{ modelValue?: string }>()
const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const _modelValue = useVModel(props, 'modelValue', emits)
</script>

<template>
  <Codemirror
    v-model="_modelValue"
    class="flex-1"
    :extensions="[javascript()]"
  />
</template>

<style scoped lang="less"></style>
