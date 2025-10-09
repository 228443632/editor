<!--
 * @Description: 签署
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/10/25 PM7:53
 -->
<!--setup-->
<script setup lang="ts">
import { COMP_SIGN_STYLE } from '@/views/doc-editor/extensions/constant.ts'
import type { IParamsCompItem } from '@/views/sign-editor/types/types.ts'
import testSignSvgRaw from '@/assets/images/test-sign.svg?raw'
import ContentLineWrap from './ContentLineWrap.vue'
import ContentDragWrap from './ContentDragWrap.vue'

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
const __signContext__ = inject('__signContext__') // 预览上下文
const contentLineWrapRef = ref<InstanceType<typeof ContentLineWrap>>()

/* 方法 */

/**
 * 应用到多页
 */
const onApplyMultiPage = () => {
  const nodeDataList = __signContext__.value.applyMultiPageParamsComp(
    _nodeData.value,
  )
  const currentItem = nodeDataList.find((item) => item.isActive)

  if (currentItem?.nodeData) {
    setTimeout(() => {
      // 设置当前选中
      __signContext__.value.selectParamsComp(currentItem.nodeData)
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
  return __signContext__.value.activeCompParam?.key == _nodeData.value.key
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
  <ContentDragWrap
    v-model:node-data="_nodeData"
    @delete="__signContext__.removeParamsComp(_nodeData)"
  >
    <ContentLineWrap
      ref="contentLineWrapRef"
      v-model:node-data="_nodeData"
      :show-line="_isActive"
    >
      <div
        ref="divRef"
        :style="{
          width: COMP_SIGN_STYLE.width * __signContext__.scaleFactor + 'px',
          height: COMP_SIGN_STYLE.height * __signContext__.scaleFactor + 'px',
        }"
        v-html="testSignSvgRaw"
      ></div>
    </ContentLineWrap>
  </ContentDragWrap>
</template>

<!--style-->
<style scoped lang="less">
@import './content-comp-style';
</style>
