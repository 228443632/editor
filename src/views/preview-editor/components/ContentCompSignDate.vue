<!--
 * @Description: 签署日期控件
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/10/25 PM7:53
 -->
<!--setup-->
<script setup lang="ts">
import { COMP_SIGN_DATE_STYLE } from '@/views/doc-editor/extensions/constant.ts'
import type { IParamsCompItem } from '@/views/preview-editor/types/types.ts'
import testSignSvgRaw from '@/assets/images/test-sign.svg?raw'
import ContentLineWrap from './ContentLineWrap.vue'
import ContentDragWrap from './ContentDragWrap.vue'
import { noop } from 'sf-utils2'

const { proxy } = getCurrentInstance()
const props = defineProps({
  /**
   * 节点数据
   */
  nodeData: {
    type: Object as PropType<IParamsCompItem>,
    default: () => ({}),
  },
})
const emit = defineEmits([])

/* 状态 */
const _nodeData = useVModel(props, 'nodeData', emit, { passive: true })
const divRef = ref<HTMLElement>()
const __previewContext__ = inject('__previewContext__') // 预览上下文
const contentLineWrapRef = ref<InstanceType<typeof ContentLineWrap>>()

/* 方法 */

/**
 * 应用到多页
 */
const onApplyMultiPage = () => {
  const nodeDataList = __previewContext__.value.applyMultiPageParamsComp(
    _nodeData.value,
  )
  const currentItem = nodeDataList.find((item) => item.isActive)

  if (currentItem?.nodeData) {
    setTimeout(() => {
      // 设置当前选中
      __previewContext__.value.selectParamsComp(currentItem.nodeData)
    })
  }
  useMessage('success', {
    content: '应用成功',
  })
}

/* 计算 */

/**
 * 是否当前组件激活
 */
const _isActive = computed(() => {
  return __previewContext__.value.activeCompParam?.key == _nodeData.value.key
})

/* 监听 */

watchEffect(() => {
  void _nodeData.value.top
  void _nodeData.value.left
  nextTick(() => {
    contentLineWrapRef.value && contentLineWrapRef.value.update()
  })
})

let topTimeout
watch([() => _nodeData.value.top, () => _nodeData.value.left], () => {
  topTimeout && clearTimeout(topTimeout)
  _nodeData.value.isEsDragging = true
  topTimeout = setTimeout(() => {
    _nodeData.value.isEsDragging = false
  }, 20)
})

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({
  $: proxy.$,
})
</script>

<!--render-->
<template>
  <div
    v-if="_isActive"
    class="absolute transform e-drager-top__handle shadow-md select-none"
    :style="{
      top: _nodeData.top + 'px',
      left: _nodeData.left + 'px',
    }"
    @mousedown.stop="noop"
  >
    <span
      class="cursor-pointer !hover:text-[var(--umo-primary-color)] flex-1"
      @click="onApplyMultiPage"
      >应用到多文件多页</span
    >
    <t-icon
      name="delete"
      size="14px"
      class="cursor-pointer flex-none !hover:text-[var(--umo-primary-color)]"
      @click="__previewContext__.removeParamsComp(_nodeData)"
    ></t-icon>
  </div>

  <ContentDragWrap v-model:node-data="_nodeData">
    <ContentLineWrap
      ref="contentLineWrapRef"
      v-model:node-data="_nodeData"
      :show-line="_isActive"
    >
      <div
        ref="divRef"
        :style="{
          width: COMP_SIGN_DATE_STYLE.width + 'px',
          height: COMP_SIGN_DATE_STYLE.height + 'px',
        }"
        v-html="testSignSvgRaw"
      ></div>
    </ContentLineWrap>
  </ContentDragWrap>
</template>

<!--style-->
<style scoped lang="less">
.e-drager-top__handle {
  white-space: nowrap;
  transform: translate(0, calc(-100% - 8px));
  background: #e5e5e5;
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 8px;
  border-radius: 2px;
  color: #666;
  font-size: 12px;
  gap: 12px;
  z-index: 10;
  & > span:first-child {
    position: relative;
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: -7px;
      width: 1px;
      height: 10px;
      background: #bbb;
    }
  }
}
</style>
