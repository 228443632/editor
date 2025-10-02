<script setup lang="ts">
import { linter } from '@codemirror/lint' // 检验
import { json, jsonParseLinter } from '@codemirror/lang-json' // json 语言
import Codemirror from './index.vue' // codemirror 6 编辑器
import { useVModel } from '@vueuse/core' // json 语言

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
    :extensions="[linter(jsonParseLinter()), json()]"
  />
</template>

<style scoped lang="less"></style>
