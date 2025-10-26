<!--
 * @Description: 印章
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/10/25 PM7:53
 -->
<!--setup-->
<script setup lang="ts">
import { COMP_SEAL_STYLE } from '@/views/doc-editor/extensions/constant.ts'
import type { IParamsCompItem } from '@/views/sign-editor/types/types.ts'
import testSealSvgRaw from '@/assets/images/test-seal.svg?raw'
import multiPageSealIcon from '@/assets/images/multi-page-seal.svg?raw'
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
const contentDragWrapRef = ref<InstanceType<typeof ContentDragWrap>>()

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

  // 添加历史记录
  __signContext__.value.manalHistory.commit()

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
  <!--  <div-->
  <!--    v-if="_isActive"-->
  <!--    class="absolute transform e-drager-top__handle shadow-md select-none"-->
  <!--    :style="{-->
  <!--      top: _nodeData.top + 'px',-->
  <!--      left: _nodeData.left + 'px',-->
  <!--      width: contentDragWrapRef?.dragerWidth + 'px',-->
  <!--      '&#45;&#45;y': (_nodeData.translateY || 0) + 'px',-->
  <!--    }"-->
  <!--    @mousedown.stop="noop"-->
  <!--  >-->
  <!--    <span-->
  <!--      class="cursor-pointer !hover:text-[var(&#45;&#45;umo-primary-color)] flex-1"-->
  <!--      @click="onApplyMultiPage"-->
  <!--      >应用到多文件多页</span-->
  <!--    >-->
  <!--  </div>-->

  <ContentDragWrap
    ref="contentDragWrapRef"
    v-model:node-data="_nodeData"
    @delete="__signContext__.removeParamsComp(_nodeData)"
  >
    <ContentLineWrap
      ref="contentLineWrapRef"
      v-model:node-data="_nodeData"
      :show-line="_isActive"
    >
      <div class="e-drager-top__tag">
        <span>印章</span>

        <!-- 关键字 -->
        <span v-if="_nodeData?.keywords" class="e-drager-top__tag-kwds">
          - {{ _nodeData?.keywords }}
        </span>
      </div>
      <t-tooltip
        v-if="_isActive"
        theme="light"
        placement="top"
        :show-arrow="false"
        destroy-on-close
        content="应用到多页"
      >
        <div
          class="w-21px h-21px flex-center text-white rounded-full bg-primary absolute top-0px right-1 icon-apply-multi"
          @click="onApplyMultiPage"
          @mousedown.stop="noop"
        >
          <div
            class="w-12px h-12px flex-center"
            v-html="multiPageSealIcon"
          ></div>
        </div>
      </t-tooltip>
      <div
        ref="divRef"
        :style="{
          width: COMP_SEAL_STYLE.width * __signContext__.compScaleFactor + 'px',
          height:
            COMP_SEAL_STYLE.height * __signContext__.compScaleFactor + 'px',
        }"
        v-html="testSealSvgRaw"
      ></div>
    </ContentLineWrap>
  </ContentDragWrap>
</template>

<!--style-->
<style scoped lang="less">
@import './content-comp-style';

.icon-apply-multi {
  transform: translate3d(-50%, -50%, 0);
  z-index: 1;
  cursor: pointer;
}
</style>
