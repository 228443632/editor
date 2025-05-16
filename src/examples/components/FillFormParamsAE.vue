<!--
 * @Description: 表单参数填充
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 24/04/25 PM10:37
 -->
<!--setup-->
<script setup lang="ts">
// import {useVModel} from '@vueuse/core'
import JSEditor from './codemirror-editor/JSEditor.vue' // CodeMirror编辑器
import type { TableProps, TableRowData } from 'tdesign-vue-next'
import Print from './Print.vue'
import { saveAs } from 'file-saver'

const { proxy } = getCurrentInstance()
const props = defineProps({})
const emit = defineEmits([])

/* 状态 */
const printRef = ref<InstanceType<typeof Print>>()
const visible = reactive({
  dialog: false,
})
const formData = ref({})
const tableInfo = ref<TableProps>({
  columns: [
    { colKey: 'placeholder', title: '名称', minWidth: 100, fixed: 'left' },
    { colKey: 'fieldName', title: '后台映射字段名', minWidth: 200 },
    { colKey: 'defaultValue', title: '默认值', minWidth: 100 },
    { colKey: 'typeName', title: '元素类型', minWidth: 80 },
    { colKey: 'desc', title: '填写说明', minWidth: 250 },
  ],
  size: 'small',
  data: [] as TableRowData,
})

/* 方法 */

function onConfirm() {
  onClose()
}

function onClose() {
  visible.dialog = false
}

function onPreview() {
  let fillFieldData = {}
  try {
    fillFieldData = eval(`(${formData.value.configValue})`)
  } catch (e) {
    useMessage('error', { content: '解析表单填充数据失败，请检查自己填写内容' })
    return
  }
  console.log(`s`, fillFieldData)
  printRef.value.printPage(fillFieldData)
}

/**
 * 导出html
 */
function onDownHtml() {
  let fillFieldData = {}
  try {
    fillFieldData = eval(`(${formData.value.configValue})`)
  } catch (e) {
    useMessage('error', { content: '解析表单填充数据失败，请检查自己填写内容' })
    return
  }
  const html = printRef.value.getIframeCode(fillFieldData)
  const blob = new Blob([html], {
    type: 'text/html;charset=utf-8',
  })
  const filename = '低码合同测试'
  saveAs(blob, `${filename}.html`)
}
/* 计算 */

/* 监听 */

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({
  $: proxy.$,
  visible,
  formData,
  onConfirm,
  tableInfo,
})
</script>

<!--render-->
<template>
  <modal
    :visible="visible.dialog"
    icon="params-comp-text"
    :header="`参数修改`"
    width="960px"
    v-bind="$attrs"
    @close="visible.dialog = false"
  >
    <t-form
      ref="formRef"
      :data="formData"
      :colon="true"
      label-align="top"
      class
    >
      <t-form-item
        label="字段集合"
        name="placeholder"
        required-mark
        :rules="[{ required: true, message: '必填', type: 'error' }]"
      >
        <t-table row-key="id" v-bind="tableInfo" :max-height="350" bordered>
        </t-table>
      </t-form-item>
      <t-form-item
        label="表单填充数据"
        name="placeholder"
        required-mark
        :rules="[{ required: true, message: '必填', type: 'error' }]"
      >
        <JSEditor
          v-model="formData.configValue"
          class="h-60 border-1 border-solid border-[var(--td-component-border)] w-full overflow-hidden pr-3"
        ></JSEditor>
      </t-form-item>
    </t-form>

    <template #footer>
      <div class="flex items-center justify-end">
        <t-button theme="default" @click="onClose">取消</t-button>
        <t-button theme="primary" @click="onPreview">预览PDF</t-button>
        <t-button theme="primary" @click="onDownHtml">导出html</t-button>
      </div>
    </template>
    <Print ref="printRef"></Print>
  </modal>
</template>

<!--style-->
<style scoped lang="less"></style>
