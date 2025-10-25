<!--
 * @Description: 弹层预览
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 24/10/25 PM3:22
 -->
<!--setup-->
<script setup lang="ts">
import type { Dialog, DialogProps } from 'tdesign-vue-next'
import { mergeAttrs } from '@/views/doc-editor/utils/common-util.ts'
// import type { ExtractPropTypes } from 'vue'

const { proxy } = getCurrentInstance()
const props = withDefaults(
  defineProps<
    DialogProps & {
      bodyComponent: Component
      bodyComponentAttrs?: Record<string, any>
    }
  >(),
  {
    closeBtn: undefined,
    cancelBtn: undefined,
    closeOnOverlayClick: undefined,
    attach: undefined,
    footer: undefined,
    showOverlay: undefined,
    bodyComponent: undefined,
    bodyComponentAttrs: undefined,
    draggable: undefined,
  },
)
const emit = defineEmits<{
  (e: 'close'): void
  (
    e: 'ok',
    close: () => void,
    componentRef: Ref<Component>,
    button: { setLoading: (loading: boolean) => void },
  )
}>()

defineOptions({
  inheritAttrs: false,
})

/* 状态 */
const tDialogRef = ref<InstanceType<typeof Dialog>>()
const attrs = useAttrs()
const slots = useSlots() as Record<
  'body' | 'header' | 'footer' | 'default',
  any
>
const _visible = useVModel(props, 'visible', emit, { defaultValue: false })

// const TProps = ExtractPropTypes<DialogProps>

/* 方法 */
const okLoading = ref(false)

const button = ref({
  setLoading: (loading: boolean) => {
    okLoading.value = loading
  },
})

const componentRef = ref<Component>()

/**
 * 关闭
 */
// eslint-disable-next-line vue/no-dupe-keys
const onClose = () => {
  _visible.value = false
  emit('close')
}

/**
 * 确定
 */
// eslint-disable-next-line vue/no-dupe-keys
const onConfirm = () => {
  emit('ok', provider.close, componentRef, button)
}

const provider = {
  /**
   * 关闭
   */
  close() {
    _visible.value = false
  },

  open() {
    _visible.value = true
  },
}

/* 计算 */

/**
 * 插槽
 */
const _slots = computed(() => {
  if (!slots.body) return { ...slots, body: undefined }
  return slots
})

/**
 * 属性
 */
const attrs2 = computed(() => {
  const attrs2 = mergeAttrs({}, attrs, props) as Record<string, any>

  attrs2.bodyComponent ??= undefined
  attrs2.bodyComponentAttrs ??= undefined

  attrs2.closeBtn ??= true
  attrs2.cancelBtn ??= '取消'
  attrs2.closeOnOverlayClick ??= false
  attrs2.attach ??= 'body'
  attrs2.footer ??= true
  attrs2.showOverlay ??= true
  attrs2.draggable ??= true

  // camelCasePlainObject
  return attrs2
})

/* 监听 */

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({
  $: proxy.$,

  /**
   * 原来的 tDialogRef
   */
  tDialogRef,

  /**
   * button
   */
  button,

  /**
   * 组件ref
   */
  componentRef,

  /**
   * 关闭
   */
  close: provider.close,

  /**
   * 开启
   */
  open: provider.open,
})
</script>

<!--render-->
<template>
  <!-- 新增内容 -->
  <t-dialog
    v-if="visible"
    v-bind="attrs2"
    ref="tDialogRef"
    :confirm-loading="okLoading"
    :visible="_visible"
    @close="onClose"
    @confirm="onConfirm"
  >
    <template v-for="(_, key) in _slots" #[key]="scoped" :key="key">
      <slot v-if="key == 'body'" name="default">
        <component
          :is="bodyComponent"
          v-if="bodyComponent"
          v-bind="bodyComponentAttrs"
          ref="componentRef"
          @ok="onConfirm"
        />
      </slot>
      <slot v-else v-bind="scoped || {}" :name="key" />
    </template>
  </t-dialog>
</template>

<!--style-->
<style scoped lang="less"></style>
