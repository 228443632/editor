<!--
 * @Description: 左侧
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/10/25 PM3:16
 -->
<!--setup-->
<script setup lang="ts">
import testSignImgRaw from '@/assets/images/test-sign.svg?raw'
import testSealImgRaw from '@/assets/images/test-seal.svg?raw'
import type { IDragNodeParamsNode } from '@/views/doc-editor/extensions/extension/extension-drag-params.ts'
// import type { TObjectValueType } from 'sf-utils2/types/generic-helper.ts'
import {
  COMP_PARAMS_NAME_MAP,
  COMP_SEAL_STYLE,
  COMP_SIGN_DATE_STYLE,
  COMP_SIGN_STYLE,
} from '@/views/doc-editor/extensions/constant.ts'
import { useEventListener } from '@vueuse/core'
import { arrayToObj, uuid } from 'sf-utils2'
import { pageUtils } from '@/views/sign-editor/utils/commons.ts'
// import { isInIframe } from '@/views/doc-editor/utils/common-util.ts'
import LeftAddKeywordPosAE from './LeftAddKeywordPosAE.vue' // 左侧关键字定位
import TDialogV2 from './t-dialog-v2/index.vue'
import profile from '@/profile.ts'

const { proxy } = getCurrentInstance()
const props = defineProps({})
const emit = defineEmits([])

/* 状态 */
const __signContext__ = inject('__signContext__') // 预览上下文
const isDragging = ref(false)

const visible = reactive({
  addKeyword: false, // 添加关键字字段
})
const leftAddDialogRef = ref<InstanceType<typeof TDialogV2>>()

const dragMethod = {
  /**
   * 拖动的参数节点，是dom节点
   */
  dragNodeDom: undefined,

  /**
   * 拖拽开始
   * @param cItem
   * @param e
   */
  dragStart(cItem: IDragNodeParamsNode, e: DragEvent) {
    const valid = validateComp(cItem.type)
    if (!valid) {
      e.preventDefault()
      return
    }

    isDragging.value = true

    const nodeData = {
      ...cItem,
      value: cItem.type,
    } as IDragNodeParamsNode

    // isCompParams 是自定义的参数节点
    e.dataTransfer?.setData('text/plain', JSON.stringify(nodeData))

    e.dataTransfer.effectAllowed = 'move'

    const targetNode = e.target as HTMLElement
    dragMethod.dragNodeDom = targetNode

    dragMethod.dragNodeDom.__nodeData = nodeData
    dragMethod.dragNodeDom.classList.add('is-dragging')

    if (cItem.type == COMP_PARAMS_NAME_MAP.compSeal) {
      // 印章
      const dragImage = document.createElement('div')
      document.body.append(dragImage)
      dragImage.style.cssText = `position: fixed; left: 0px; top: 0; z-index: -1; width: ${COMP_SEAL_STYLE.width}px; height: ${COMP_SEAL_STYLE.height}px; border: 1px dashed #999;`
      dragImage.innerHTML = testSealImgRaw
      e.dataTransfer.setDragImage(dragImage, 0, 0)
      dragMethod.dragNodeDom.__nodeData.width = COMP_SEAL_STYLE.width
      dragMethod.dragNodeDom.__nodeData.height = COMP_SEAL_STYLE.height
      setTimeout(() => dragImage.remove())
    } else if (cItem.type == COMP_PARAMS_NAME_MAP.compSign) {
      // 签名
      const dragImage = document.createElement('div')
      document.body.prepend(dragImage)
      dragImage.style.cssText = `position: fixed; left: 0px; top: 0; z-index: -1; width: ${COMP_SIGN_STYLE.width}px; height: ${COMP_SIGN_STYLE.height}px; border: 1px dashed #999;`
      dragImage.innerHTML = testSignImgRaw
      e.dataTransfer.setDragImage(dragImage, 0, 0)
      dragMethod.dragNodeDom.__nodeData.width = COMP_SIGN_STYLE.width
      dragMethod.dragNodeDom.__nodeData.height = COMP_SIGN_STYLE.height
      setTimeout(() => dragImage.remove())
    } else if (cItem.type == COMP_PARAMS_NAME_MAP.compSignDate) {
      // 签署日期
      const dragImage = document.createElement('div')
      document.body.prepend(dragImage)
      dragImage.style.cssText = `position: fixed; left: 0px; top: 0; z-index: -1; width: ${COMP_SIGN_DATE_STYLE.width}px; height: ${COMP_SIGN_DATE_STYLE.height}px; border: 1px dashed #999;`
      // dragImage.innerHTML = dayjs().format('YYYY年MM月DD日')
      dragImage.innerHTML = 'XXXX年XX月XX日'
      dragImage.classList.add('flex-center', 'text-14px')
      e.dataTransfer.setDragImage(dragImage, 0, 0)
      dragMethod.dragNodeDom.__nodeData.width = COMP_SIGN_DATE_STYLE.width
      dragMethod.dragNodeDom.__nodeData.height = COMP_SIGN_DATE_STYLE.height
      setTimeout(() => dragImage.remove())
    } else {
      // 设置透明度
      e.dataTransfer.setDragImage(targetNode, 0, 0)
    }

    // 设置光标颜色
    const viewDom = __signContext__.value.contentElRef
    // console.log('viewDom', viewDom)
    viewDom.classList.add('caret--is-dragging')
  },

  /**
   * 拖拽中
   * @param e
   */
  dragover(e: DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move' // 设置为移动操作
  },

  /**
   * 拖拽成功
   * @param e
   */
  drop(e: DragEvent) {
    e.preventDefault()

    // 移除设置光标颜色
    const { top, left } = getPos(e.clientX, e.clientY)

    if (dragMethod.dragNodeDom.__nodeData?.type) {
      const tmpNodeData = {
        ...(dragMethod.dragNodeDom.__nodeData || {}),
        key: uuid(),
        top,
        left,
      }
      pageUtils.correctPos(tmpNodeData, __signContext__.value.contentPageNums)
      __signContext__.value.paramsCompList.push(tmpNodeData)
      __signContext__.value.selectParamsComp(
        __signContext__.value.paramsCompList.at(-1),
      )
      // 添加历史记录
      __signContext__.value.manalHistory.commit()
    }
  },

  /**
   * 拖拽结束
   * @param e
   */
  dragend(e: DragEvent) {
    e.preventDefault()

    isDragging.value = false

    // 释放引用 oc
    dragMethod.dragNodeDom.classList.remove('is-dragging')
    dragMethod.dragNodeDom = null

    const viewDom = __signContext__.value.contentElRef
    viewDom.classList.remove('caret--is-dragging')

    viewDom.focus()
  },
}

const _embedPdfWrapRef = computed(() => __signContext__.value.embedPdfWrapRef)

useEventListener(_embedPdfWrapRef, 'drop', dragMethod.drop)
useEventListener(_embedPdfWrapRef, 'dragover', dragMethod.dragover)

/* 方法 */
/**
 * 展示-添加关键字定位
 */
const onShowCreateKwdPos = () => {
  // visible.addKeyword = true
  leftAddDialogRef.value.open()
}

/**
 * 添加关键字定位
 */
const onCreateKwdPos = async () => {
  const componentRef = leftAddDialogRef.value.componentRef
  const valid = await componentRef.submit()
  if (valid === true) {
    leftAddDialogRef.value.close()
  }
}

/**
 * 校验组件
 */
const validateComp = (type: IDragNodeParamsNode['type']) => {
  if (type == COMP_PARAMS_NAME_MAP.compSeal) {
    // 印章
    // const compSignList = __signContext__.value._compSealList
  } else if (type == COMP_PARAMS_NAME_MAP.compSignDate) {
    // 签署日期
    const compSignDateList = __signContext__.value._compSignDateList
    if (compSignDateList?.length >= COMP_SIGN_DATE_STYLE.limit) {
      useMessage('error', {
        content: `只能添加 ${COMP_SIGN_DATE_STYLE.limit} 个签署日期`,
      })
      return false
    }
  } else if (type == COMP_PARAMS_NAME_MAP.compSign) {
    // 签名
    const compSignList = __signContext__.value._compSignList
    if (compSignList?.length >= COMP_SIGN_STYLE.limit) {
      useMessage('error', {
        content: `只能添加 ${COMP_SIGN_STYLE.limit} 个签名`,
      })
      return false
    }
  }
  return true
}

/**
 * 确定位置
 * @param x
 * @param y
 */
const getPos = (x: number, y: number) => {
  const pdfWraDom = __signContext__.value.embedPdfWrapRef
  if (pdfWraDom) {
    const pdfWraDomRect = pdfWraDom.getBoundingClientRect()
    const { left, top } = pdfWraDomRect
    return {
      left: x - left,
      top: y - top,
    }
  }
  return undefined
}

/* 计算 */

/**
 * 组件类型映射
 */
const _compTypeListMap = computed(() => {
  if (profile.IS_DEV) {
    // 不是嵌入iframe中，展示全部
    return COMP_PARAMS_NAME_MAP
  }
  return arrayToObj(__signContext__.value.compTypeList) as Record<
    string,
    string
  >
})

/**
 * 是否展示绝对定位菜单
 */
const _isShowAbsMenu = computed(() => {
  return (
    _compTypeListMap.value[COMP_PARAMS_NAME_MAP.compSeal] ||
    _compTypeListMap.value[COMP_PARAMS_NAME_MAP.compSignDate] ||
    _compTypeListMap.value[COMP_PARAMS_NAME_MAP.compSign]
  )
})

/**
 * 是否展示关键字菜单
 */
const _isShowKwdsMenu = computed(() => {
  return _compTypeListMap.value[COMP_PARAMS_NAME_MAP.keywords]
})

/* 监听 */

watchEffect(isDragging, (newVal) => {
  __signContext__.value.isDragging = newVal
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
  <div class="sign-editor__left">
    <div class="left__title">文件签署</div>

    <!-- 内容区 -->
    <div class="left__content umo-scrollbar">
      <!-- 关键字定位 -->
      <section v-if="_isShowKwdsMenu" class="mb-6">
        <div class="group-tab-slide left__sub-title mb-6">关键字定位</div>
        <div>
          <t-button block variant="outline" @click="onShowCreateKwdPos"
            >添加关键字定位</t-button
          >
        </div>
      </section>

      <!-- 坐标定位 -->
      <section v-if="_isShowAbsMenu" class="mb-6">
        <div class="group-tab-slide left__sub-title">坐标定位</div>
        <!-- 印章 -->
        <div
          v-if="_compTypeListMap[COMP_PARAMS_NAME_MAP.compSeal]"
          class="left__content-item"
          :draggable="__signContext__.contentInitial"
          @dragstart="dragMethod.dragStart({ type: 'compSeal' }, $event)"
          @dragend="dragMethod.dragend"
        >
          <div class="w-140px w-140px rounded-full" v-html="testSealImgRaw" />
        </div>

        <!-- 签名 -->
        <div
          v-if="_compTypeListMap[COMP_PARAMS_NAME_MAP.compSign]"
          class="left__content-item"
          :draggable="__signContext__.contentInitial"
          @dragstart="dragMethod.dragStart({ type: 'compSign' }, $event)"
          @dragend="dragMethod.dragend"
        >
          <t-tooltip
            v-if="
              __signContext__._compSignList?.length >= COMP_SIGN_STYLE.limit
            "
            theme="light"
            placement="top"
            :show-arrow="false"
            destroy-on-close
            :content="`签署控件最多只有 ${COMP_SIGN_STYLE.limit} 个`"
          >
            <t-icon
              name="error-circle"
              class="text-warning absolute left-2 z-1 cursor-help"
            ></t-icon>
          </t-tooltip>

          <!--        <info-circle-icon :fill-color='"transparent"' :stroke-color='"currentColor"' :stroke-width="2"/>-->
          <div class="w-88px h-23px rounded-full" v-html="testSignImgRaw" />
        </div>

        <!-- 签署日期 -->
        <div
          v-if="_compTypeListMap[COMP_PARAMS_NAME_MAP.compSignDate]"
          class="left__content-item"
          :draggable="__signContext__.contentInitial"
          @dragstart="dragMethod.dragStart({ type: 'compSignDate' }, $event)"
          @dragend="dragMethod.dragend"
        >
          <t-tooltip
            v-if="
              __signContext__._compSignDateList?.length >=
              COMP_SIGN_DATE_STYLE.limit
            "
            theme="light"
            placement="top"
            :content="`签署日期控件最多只有 ${COMP_SIGN_DATE_STYLE.limit} 个`"
            :show-arrow="false"
            destroy-on-close
          >
            <t-icon
              name="error-circle"
              class="text-warning absolute left-2 z-1 cursor-help"
            ></t-icon>
          </t-tooltip>

          <div class="h-23px flex-center">签署日期</div>
        </div>
      </section>
    </div>

    <!-- 新增内容 -->
    <TDialogV2
      ref="leftAddDialogRef"
      v-model:visible="visible.addKeyword"
      header="添加关键字定位"
      :body-component="LeftAddKeywordPosAE"
      :body-component-attrs="{
        validateComp,
      }"
      @ok="onCreateKwdPos"
    >
    </TDialogV2>
  </div>
</template>

<!--style-->
<style scoped lang="less">
@import '@/style/vars.less';
.sign-editor__left {
  background: #fff;
  border-right: solid 1px var(--umo-border-color);
  width: var(--left-aside-width);
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex: none;
  flex-direction: column;
  position: relative;
}

.left__content-item {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  user-select: none;
  padding: 8px 20px;
  position: relative;
  border: 1px dashed #ddd;
  border-radius: 4px;
  background: #fff;
  & + .left__content-item {
    margin-top: 12px;
  }
  &.is-dragging {
    border-color: var(--umo-primary-color);
    //outline: 1px solid var(--umo-primary-color);
  }
}

.left__title {
  width: 100%;
  border-bottom: solid 1px var(--umo-border-color-light);
  display: flex;
  align-items: center;
  font-size: 14px;
  position: relative;
  padding: var(--padding-top) 4px 10px 16px;
  gap: 14px;
  flex: none;
  font-weight: bold;
  box-sizing: border-box;
}

.left__content {
  flex: 1;
  height: 0;
  overflow-y: auto;
  padding: 16px;
}

.sign-date {
}

.left__sub-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
}

.group-tab-slide {
  --slide-h: 6px;
  --slide-radius: 2px;
  position: relative;
  width: fit-content;
  &:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: calc(0px - (var(--slide-h) / 2));
    width: 100%;
    height: var(--slide-h);
    border-radius: var(--slide-radius);
    z-index: 10;
    background-image: linear-gradient(
      to right,
      rgba(@primary-color, 1),
      rgba(@primary-color, 0.1)
    );
  }
}
</style>
