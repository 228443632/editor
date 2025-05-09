<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 22/04/25 PM3:37
 -->
<!--setup-->
<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'
import { deepClone, to } from 'sf-utils2'
import { type Form } from 'tdesign-vue-next'
import { commonUtil } from '@/examples/utils/common-util'

import { simpleUUID } from '@/utils/short-id'

const { proxy } = getCurrentInstance()

const props = defineProps({
  ...nodeViewProps,
})
const emit = defineEmits({})
const __globalBizState__ = inject('__globalBizState__') as Ref<{}>
const options = inject('options') as Ref<{}>

const { updateAttributes } = props
/* 状态 */

const formRef = ref<InstanceType<typeof Form>>()
const formData = ref({})
const visible = reactive({
  dialog: false,
})
const dict = {
  borderType: [
    {
      key: 'underline',
      label: '下划线',
      style: 'border-bottom: 1px solid currentColor',
    },
    {
      key: 'solid',
      label: '边框',
      style: 'border: 1px solid currentColor',
    },
    // {
    //   key: 'dash',
    //   label: '边框虚线',
    //   style: 'border: 1px dashed var(--umo-node-text-border-color)',
    // },
    { key: 'none', label: '无边框' },
  ],
}

/* 方法 */

function onSelectNode() {
  props.editor.commands.setNodeSelection(props.getPos())
  __globalBizState__.value.nodeActive = props.node

  console.log('props.node', Object.create(props.node?.attrs))

  formData.value = deepClone({ ...props.node?.attrs })

  // setBubbleMenuShow(false)
  visible.dialog = true
}

async function onConfirm() {
  console.log('formRef.value', formRef.value)
  const [valid, err] = await to(formRef.value.validate())
  if (err || !valid)
    return useMessage('error', { content: '请检查表单是否填写完整' })
  updateAttributes({
    ...formData.value,
  })
  onClose()
}

function onClose() {
  visible.dialog = false
  setBubbleMenuShow(true)
}

function onVisibleChange(popupVisible) {
  console.log('popupVisible', popupVisible)
  if (!popupVisible) {
    onConfirm()
  }
}

/**
 * 设置悬浮菜单显示
 * @param isShow
 */
function setBubbleMenuShow(isShow = true) {
  options.value.document ||= {}
  options.value.document.enableBubbleMenu = isShow
}

/* 计算 */

const _attributes = computed(() => props.node?.attrs)

/* 监听 */

/* 周期 */
onMounted(() => {
  // console.log('props', props, props.getPos(), props.updateAttributes)
  window.requestAnimationFrame(() => {
    if (!props.node.attrs?.['data-id']) {
      props.updateAttributes({
        'data-id': simpleUUID(),
      })
    }
  })
})

/* 暴露 */
defineExpose({
  $: proxy.$,
})
</script>

<!--render-->
<template>
  <node-view-wrapper
    v-bind="props.node?.attrs"
    as="span"
    :class="[
      `form-comp--text is-inline-block`,
      `form-comp-border--${props.node?.attrs?.borderType}`,
    ]"
    :data-id="_attributes['data-id']"
    contenteditable="false"
    :data-placeholder="props?.node?.attrs?.placeholder"
    @click="onSelectNode"
  >
    <t-popup
      v-model:visible="visible.dialog"
      :destroy-on-close="false"
      trigger="click"
      :on-visible-change="onVisibleChange"
      width="fit-content"
    >
      <span></span>
      <template #content>
        <div
          class="umo-scrollbar max-h-320px overscroll-contain box-shadow: var(--td-shadow-2) w-310px px-16px py-8px"
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
            <t-form-item
              label="名称"
              name="placeholder"
              required-mark
              :rules="[{ required: true, message: '必填', type: 'error' }]"
            >
              <t-input
                v-model="formData.placeholder"
                placeholder="请输入内容"
                maxlength="50"
                clearable
              ></t-input>
            </t-form-item>

            <t-form-item
              label="后台映射字段名"
              name="fieldName"
              required-mark
              :rules="[{ required: true, message: '必填', type: 'error' }]"
            >
              <t-input
                v-model="formData.fieldName"
                placeholder="请输入字母数字或下划线"
                maxlength="300"
                clearable
              ></t-input>
            </t-form-item>

            <t-form-item label="外观" name="borderType">
              <t-radio-group v-model="formData.borderType">
                <t-radio
                  v-for="(item, index) in dict.borderType"
                  :value="item.key"
                  :key="index"
                  class="ml-4px"
                >
                  <span :style="item.style" class="-ml-2px px-2px">
                    {{ item.label }}
                  </span>
                </t-radio>
              </t-radio-group>
            </t-form-item>

            <t-form-item label="默认值" name="name">
              <t-input
                v-model="formData.defaultValue"
                placeholder="请输入默认值"
                maxlength="300"
                clearable
              ></t-input>
            </t-form-item>

            <t-form-item label="填写说明" name="desc">
              <t-textarea
                v-model="formData.desc"
                placeholder="请输入填写说明(最多可输入100字)"
                maxlength="100"
                clearable
              ></t-textarea>
            </t-form-item>
          </t-form>
        </div>
      </template>
    </t-popup>
    <!--    <modal-->
    <!--      :visible="visible.dialog"-->
    <!--      icon="params-comp-text"-->
    <!--      :header="`参数修改`"-->
    <!--      width="480px"-->
    <!--      @confirm="onConfirm"-->
    <!--      @close="onClose"-->
    <!--    >-->
    <!--    </modal>-->
  </node-view-wrapper>
</template>

<!--style-->
<style lang="less">
@border-color: var(--umo-node-text-border-color);
.form-comp--text {
  position: relative;
  box-sizing: border-box;
  min-width: 140px;
  min-height: 24px;
  text-align: left;
  border: 1px solid transparent;
  border-bottom: 1px solid @border-color;
  padding: 0 2px;
  cursor: pointer;
  border-radius: 2px;
  &.umo-node-focused {
    border-color: var(--umo-primary-color);
    border-style: dashed dashed solid;
  }
  &:hover {
    background-color: #f0f2f7;
  }
  &:after {
    font-size: 14px;
    color: #9ba3b0;
    content: attr(data-placeholder);
  }
}

.form-comp-border--underline {
  border-bottom: 1px solid @border-color;
}
.form-comp-border--solid {
  border: 1px solid @border-color;
}
.form-comp-border--dashed {
  border: 1px dashed @border-color;
}
.form-comp-border--none {
  border: 1px dashed transparent;
}

/*render node*/
span[data-id][iscompparams] {
  &[bordertype='underline'] {
    border-bottom: 1px solid #333;
  }

  &[bordertype='solid'] {
    border: 1px solid #333;
  }

  &[bordertype='dashed'] {
    border: 1px dashed #333;
  }
}
</style>
