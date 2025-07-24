<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 22/07/25 PM6:39
 -->
<!--setup-->
<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { uuid } from 'sf-utils2'
import { type Form, type Popup } from 'tdesign-vue-next'

const props = defineProps({
  /**
   * 是否可见
   */
  visible: {
    type: Boolean,
    default: false,
  },

  /**
   * 表单数据
   */
  formData: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },

  extraProps: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
})
const emit = defineEmits<{
  (e: 'visible-change', popupVisible: boolean): void
}>()

/* 状态 */
const _visible = useVModel(props, 'visible', emit)
const _formData = useVModel(props, 'formData', emit)
const uid = `popup-x002${uuid().slice(0, 8)}`
const tPopupRef = ref<InstanceType<typeof Popup>>()
const formRef = ref<InstanceType<typeof Form>>()

/* 方法 */
function onVisibleChange(popupVisible: boolean) {
  emit('visible-change', popupVisible)
}

/**
 * 获取最高层级
 */
function onGetTopZIndex() {
  const zIndex = props.extraProps.getTop()
  _formData.value.zIndex = zIndex
  props.extraProps.updateAttributes({
    zIndex,
  })
}

/* 计算 */

/* 监听 */

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({
  tPopupRef,
  formRef,
})
</script>

<!--render-->
<template>
  <t-popup
    ref="tPopupRef"
    v-model:visible="_visible"
    :destroy-on-close="false"
    trigger="context-menu"
    placement="bottom-left"
    :overlay-class-name="[uid]"
    :popper-options="{
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 5],
          },
        },
      ],
    }"
    @visible-change="onVisibleChange"
  >
    <slot></slot>
    <template #content>
      <div
        class="umo-scrollbar max-h-320px overscroll-contain box-shadow: var(--td-shadow-2) w-640px px-16px py-8px"
      >
        <t-form
          ref="formRef"
          :data="formData"
          :colon="true"
          label-align="top"
          :style="{
            '--td-comp-margin-xxl': '16px',
          }"
        >
          <t-row :gutter="[16, 16]">
            <t-col :span="6">
              <t-form-item
                label="名称"
                name="placeholder"
                required-mark
                :rules="[{ required: true, message: '必填', type: 'error' }]"
              >
                <t-input
                  v-model="_formData.placeholder"
                  placeholder="请输入内容"
                  maxlength="50"
                  clearable
                ></t-input>
              </t-form-item>
            </t-col>
            <t-col :span="6">
              <t-form-item
                label="后台映射字段名"
                name="fieldName"
                required-mark
                :rules="[{ required: true, message: '必填', type: 'error' }]"
              >
                <t-input
                  v-model="_formData.fieldName"
                  placeholder="请输入字母数字或下划线"
                  maxlength="300"
                  clearable
                ></t-input>
              </t-form-item>
            </t-col>

            <t-col :span="6">
              <t-form-item
                label="层级"
                name="zIndex"
                required-mark
                :rules="[{ required: true, message: '必填', type: 'error' }]"
              >
                <div class="w-full flex items-center gap-16px">
                  <t-input-number
                    v-model="_formData.zIndex"
                    :step="1"
                    :min="1000"
                    :allow-input-over-limit="false"
                    class="!flex-1 w-0"
                  />
                  <t-button
                    theme="default"
                    variant="outline"
                    @click="onGetTopZIndex"
                    >最顶层</t-button
                  >
                </div>
              </t-form-item>
            </t-col>

            <t-col :span="6">
              <t-form-item label="默认值" name="name">
                <t-input
                  v-model="_formData.defaultValue"
                  placeholder="请输入默认值"
                  maxlength="300"
                  clearable
                ></t-input>
              </t-form-item>
            </t-col>

            <t-col :span="6">
              <t-form-item label="填写说明" name="desc">
                <t-textarea
                  v-model="_formData.desc"
                  placeholder="请输入填写说明(最多可输入100字)"
                  maxlength="100"
                  clearable
                ></t-textarea>
              </t-form-item>
            </t-col>
          </t-row>
        </t-form>
      </div>
    </template>
  </t-popup>
</template>

<!--style-->
<style scoped lang="less"></style>
