<template>
  <div class="umo-page-container">
    <!-- 左侧目录   -->
    <transition name="slide-right" appear>
      <container-toc
        v-if="pageOptions.showToc"
        @close="pageOptions.showToc = false"
      >
        <template v-for="(_, key) in $slots" #[key]="scoped" :key="key">
          <slot v-bind="scoped || {}" :name="key" />
        </template>
      </container-toc>
    </transition>

    <!--  中间内容  -->
    <div
      ref="zoomableContainerRef"
      class="umo-zoomable-container umo-scrollbar"
    >
      <div
        class="umo-zoomable-content"
        :style="{
          width: pageZoomWidth,
          height: pageZoomHeight,
        }"
      >
        <t-watermark
          ref="pageContentRef"
          class="umo-page-content"
          :alpha="pageOptions.watermark.alpha"
          v-bind="watermarkOptions"
          :watermark-content="pageOptions.watermark"
          :style="{
            '--umo-page-background': pageOptions.background,
            '--umo-page-margin-top': (pageOptions.margin?.top ?? '0') + 'cm',
            '--umo-page-margin-bottom':
              (pageOptions.margin?.bottom ?? '0') + 'cm',
            '--umo-page-margin-left': (pageOptions.margin?.left ?? '0') + 'cm',
            '--umo-page-margin-right':
              (pageOptions.margin?.right ?? '0') + 'cm',
            '--umo-page-width': pageSize.width + 'cm',
            '--umo-page-height': pageSize.height + 'cm',
            '--umo-page-body-height':
              sub(pageSize.height, (pageOptions.margin?.top || 0) * 2) + 'cm',
            width: pageSize.width + 'cm',
            transform: `scale(${pageOptions.zoomLevel ? pageOptions.zoomLevel / 100 : 1})`,
            '--umo-content-bound-rect-top':
              (pageContentBoundRect?.top || 110) + 'px',
          }"
        >
          <div
            v-if="!options.isPagination"
            :class="['umo-page-node-header']"
            contenteditable="false"
          >
            <div
              class="umo-page-corner corner-tl"
              style="width: var(--umo-page-margin-left)"
            ></div>

            <div class="umo-page-node-header-content"></div>
            <div
              class="umo-page-corner corner-tr"
              style="width: var(--umo-page-margin-right)"
            ></div>
          </div>
          <div ref="umoPageNodeContentRef" class="umo-page-node-content">
            <editor>
              <!--  菜单冒泡   -->
              <template #bubble_menu="props">
                <slot name="bubble_menu" v-bind="props" />
              </template>
            </editor>
          </div>
          <div
            v-if="!options.isPagination"
            :class="['umo-page-node-footer']"
            contenteditable="false"
          >
            <div
              class="umo-page-corner corner-bl"
              style="width: var(--umo-page-margin-left)"
            ></div>
            <div class="umo-page-node-footer-content"></div>
            <div
              class="umo-page-corner corner-br"
              style="width: var(--umo-page-margin-right)"
            ></div>
          </div>

          <!--  辅助线   -->
          <section
            class="umo-page-content__auxline absolute pointer-events-none"
          ></section>
        </t-watermark>
      </div>
    </div>

    <!--  右侧   -->
    <transition name="slide-left" appear>
      <div
        v-show="pageOptions.showRightSlot"
        :class="[`umo-page-right-slot`, pageOptions.showRightSlot && `is-show`]"
      >
        <slot name="page-right"></slot>
      </div>
    </transition>

    <!-- 图片预览 -->
    <t-image-viewer
      v-model:visible="imageViewer.visible"
      v-model:index="currentImageIndex"
      :images="previewImages"
      @close="imageViewer.visible = false"
    />
    <!-- 回到顶部 -->
    <t-back-top
      :container="`${container} .umo-zoomable-container`"
      :visible-height="800"
      size="small"
      :offset="['25px', '30px']"
    />
    <!-- 搜索 -->
    <container-search-replace />
    <!-- 打印 -->
    <container-print />
  </div>
</template>

<script setup lang="ts">
import { useElementSize, unrefElement } from '@vueuse/core'

import type { UmoEditorOptions, WatermarkOption } from '@/types'

import type Editor from '../editor/index.vue'
import { type Watermark } from 'tdesign-vue-next'
import { sub } from 'sf-utils2'

const container = inject('container')
const imageViewer = inject('imageViewer')
const pageOptions = inject('page')
const layoutSize = inject('layoutSize')
const layoutDom = inject('layoutDom')
const options = inject<Ref<UmoEditorOptions>>('options')

const umoPageNodeContentRef = ref<InstanceType<typeof Editor>>()
const zoomableContainerRef = ref<HTMLHtmlElement>() // 缩放容器
const pageContentRef = ref<InstanceType<typeof Watermark>>() // editor 容器包裹的div
const { width: editorContainerWidth } = useElementSize(zoomableContainerRef)
const { width: editorWidth } = useElementSize(umoPageNodeContentRef)

// 页面大小
const pageSize = $computed(() => {
  const { width, height } = pageOptions.value.size ?? { width: 0, height: 0 }
  return {
    width: pageOptions.value.orientation === 'portrait' ? width : height,
    height: pageOptions.value.orientation === 'portrait' ? height : width,
  }
})
// 页面缩放后的大小
const pageZoomWidth = $computed(() => {
  return `calc(${pageSize.width}cm * ${pageOptions.value.zoomLevel ? pageOptions.value.zoomLevel / 100 : 1})`
})

// 页面内容变化后更新页面高度
let pageZoomHeight = $ref('')
const setPageZoomHeight = () => {
  const el = document.querySelector(`${container} .umo-page-content`)
  if (!el) {
    console.warn('The element <.umo-page-content> does not exist.')
    return
  }
  pageZoomHeight = `${(el.clientHeight * (pageOptions.value.zoomLevel ?? 1)) / 100}px`
}
watch(
  () => [
    pageOptions.value.zoomLevel,
    pageOptions.value.size,
    pageOptions.value.orientation,
  ],
  async () => {
    await nextTick()
    setTimeout(() => {
      setPageZoomHeight()
    }, 100)
  },
  { immediate: true, deep: true },
)

watch(pageContentRef, () => {
  layoutDom.value.pageContent = unrefElement(pageContentRef)
})

watch([editorContainerWidth, editorWidth], () => {
  layoutSize.value.editorWidth = editorWidth.value
  layoutSize.value.editorLeft =
    (editorContainerWidth.value - editorWidth.value) / 2

  layoutSize.value.leftAsideLeft =
    layoutSize.value.editorLeft -
    layoutSize.value.leftAsideGap -
    layoutSize.value.leftAsideWidth
})

const pageContentBoundRect = useElementBounding(pageContentRef)

// FIXME:
const editorInstance = inject('editor')
watch(
  () => editorInstance.value?.getHTML(),
  () => {
    setPageZoomHeight()
  },
)

// 水印
const watermarkOptions = $ref<{
  x: number
  y?: number
  width?: number
  height: number
  type?: string
}>({
  x: 0,
  height: 0,
})
watch(
  () => pageOptions.value.watermark,
  ({ type }: Partial<WatermarkOption> = { type: '' }) => {
    if (type === 'compact') {
      watermarkOptions.width = 320
      watermarkOptions.y = 240
    } else {
      watermarkOptions.width = 480
      watermarkOptions.y = 360
    }
  },
  { deep: true, immediate: true },
)

// 图片预览
let previewImages = $ref<string[]>([])
let currentImageIndex = $ref<number>(0)

watch(
  () => imageViewer.value.visible,
  async (visible: boolean) => {
    if (!visible) {
      previewImages = []
      currentImageIndex = 0
      return
    }
    await nextTick()
    const images = document.querySelectorAll(
      `${container} .umo-page-node-content img[src]:not(.umo-icon)`,
    )
    Array.from(images).forEach((image, index) => {
      const src = image.getAttribute('src')
      const nodeId = image.getAttribute('data-id')
      previewImages.push(src)
      if (nodeId === imageViewer.value.current) {
        currentImageIndex = index
      }
    })
  },
)
</script>

<style lang="less">
.umo-page-container {
  height: 100%;
  display: flex;
  position: relative;
  --padding-top: 16px;
  --padding-left: 16px;
}

.umo-zoomable-container {
  flex: 1;
  padding: var(--padding-top) var(--padding-left);
  scroll-behavior: smooth;
  .umo-zoomable-content {
    margin: 0 auto;
    //box-shadow:
    //  rgba(0, 0, 0, 0.06) 0px 0px 10px 0px,
    //  rgba(0, 0, 0, 0.04) 0px 0px 0px 1px;
    box-shadow: 0 0 4px 2px rgba(154, 161, 177, 0.15);
    position: relative;
    //left: var(--editor-left);
    .umo-page-content {
      transform-origin: 0 0;
      display: flex;
      position: relative;
      box-sizing: border-box;
      background-color: var(--umo-page-background);
      width: var(--umo-page-width);
      min-height: var(--umo-page-height);
      overflow: visible !important;
      flex-direction: column;
      [contenteditable] {
        outline: none;
      }
    }
  }
}

.umo-page-node-header {
  height: var(--umo-page-margin-top);
  overflow: hidden;
}

.umo-page-node-footer {
  height: var(--umo-page-margin-bottom);
  overflow: hidden;
}

.umo-page-node-header,
.umo-page-node-footer {
  display: flex;
  justify-content: space-between;
}

.umo-page-corner {
  box-sizing: border-box;
  position: relative;
  z-index: 10;

  @media print {
    opacity: 0;
  }

  &::after {
    position: absolute;
    content: '';
    display: block;
    height: var(--umo-corner-width);
    width: var(--umo-corner-width);
    border: solid 1px #ccc;
  }

  &.corner-tl::after {
    border-top: none;
    border-left: none;
    bottom: 0;
    right: 0;
  }

  &.corner-tr::after {
    border-top: none;
    border-right: none;
    bottom: 0;
    left: 0;
  }

  &.corner-bl::after {
    border-bottom: none;
    border-left: none;
    top: 0;
    right: 0;
  }

  &.corner-br::after {
    border-bottom: none;
    border-right: none;
    top: 0;
    left: 0;
  }
}

.umo-page-node-header-content,
.umo-page-node-footer-content {
  flex: 1;
}

.umo-page-node-content {
  position: relative;
  box-sizing: border-box;
  flex-shrink: 1;
}

:deep(.umo-back-top) {
  position: absolute;
  &:hover {
    opacity: 0.9;
    background-color: var(--umo-color-white) !important;
    .umo-back-top__icon {
      color: var(--umo-primary-color);
    }
  }
}

.umo-page-right-slot {
  flex: none;
  //display: grid;
  //grid-template-columns: 0fr;
  width: 0;
  height: 100%;
  border-left: solid 1px var(--umo-border-color);
  transition: width 0.3s ease-out;
  background: #fff;

  &.is-show {
    //grid-template-columns: 1fr;
    width: clamp(
      var(--right-aside-width),
      calc(
        var(--layout-width) - var(--left-aside-width) - var(--padding-left) * 2 -
          var(--editor-width) - 8px
      ),
      400px
    );
  }
}

.common-transition-active {
  transition:
    transform 0.25s cubic-bezier(0.645, 0.045, 0.355, 1),
    opacity 0.25s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.slide-top-leave-active,
.slide-top-enter-active {
  .common-transition-active;
}
.slide-top-enter-from {
  position: relative;
  opacity: 0;
  transform: translateY(60px);
}

.slide-right-leave-active,
.slide-right-enter-active {
  .common-transition-active;
}
.slide-right-enter-from {
  position: relative;
  opacity: 0;
  transform: translateX(-60px);
}

.slide-left-leave-active,
.slide-left-enter-active {
  .common-transition-active;
}
.slide-left-enter-from {
  position: relative;
  opacity: 0;
  transform: translateX(60px);
}
</style>

<style lang="less">
body.preview {
  div.umo-zoomable-content.umo-zoomable-content {
    box-shadow: none;
    pointer-events: none;
  }
}
</style>
