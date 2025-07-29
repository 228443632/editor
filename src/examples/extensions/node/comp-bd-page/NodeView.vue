<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 22/04/25 PM3:37
 -->
<!--setup-->
<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

import type { Editor } from '@tiptap/core'
import type { CSSProperties } from 'vue'

const props = defineProps({
  ...nodeViewProps,
})
const emit = defineEmits({})
const editor = inject('editor') as Ref<Editor>
const options = inject('options') as Ref<Record<string, any>>

const { updateAttributes } = props

/* 状态 */
const rootRef = ref<InstanceType<typeof NodeViewWrapper>>()

/* 方法 */

/* 计算 */

/**
 * 根节点样式
 */
const _rootStyle = computed(() => {
  const style = {} as CSSProperties
  return style
})

/* 监听 */

/* 周期 */
onMounted(() => {
  // console.log('props', props, props.getPos(), props.updateAttributes)
})

/* 暴露 */
defineExpose({})
</script>

<!--render-->
<template>
  <node-view-wrapper
    ref="rootRef"
    :compname="props.node.attrs?.compName"
    as="div"
    :style="_rootStyle"
  >
    <div
      class="bd-page-spacer"
      id="page-spacer--1"
      style="
        display: none;
        margin-top: calc(var(--editor-page-height) - 168.739984375px);
      "
    >
      <div
        class="ProseMirror-widget bd-app-icon-menu bd-page-footer-widget bd-ens"
        id="footer-page--1"
        style="
          position: absolute;
          background-color: white;
          border: 1px solid rgb(226, 232, 240);
          z-index: 10;
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          right: 50%;
          bottom: 0px;
          transform: translateY(100%)
            translateX(
              calc(var(--editor-page-width) - var(--editor-page-ml) + 100%)
            );
        "
      >
        <div
          contenteditable="false"
          class="bd-app-icon-btn bd-ens editor-appeditor-deco-wrapper"
          style="border-radius: 10%; cursor: pointer"
        >
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <path
              d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,16V20H18V16H6Z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
    <div class="bd-page-separator-wrapper">
      <div
        class="bd-page-footer bd-page-footer-all"
        id="page-footer--1"
        style="display: none"
      ></div>
      <div
        id="page-separator--1"
        class="bd-page-separator"
        contenteditable="false"
        style="height: 0px; margin-top: -1px; border: unset"
      ></div>
      <div class="bd-page-header bd-page-header-all" id="page-header--1"></div>
    </div>
    <div
      class="bd-page-spacer"
      id="page-spacer-0"
      style="margin-top: calc(var(--editor-page-height) - 168.739984375px)"
    >
      <div
        class="ProseMirror-widget bd-app-icon-menu bd-page-footer-widget bd-ens"
        id="footer-page-0"
        style="
          position: absolute;
          background-color: white;
          border: 1px solid rgb(226, 232, 240);
          z-index: 10;
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          right: 50%;
          bottom: 0px;
          transform: translateY(100%)
            translateX(
              calc(var(--editor-page-width) - var(--editor-page-ml) + 100%)
            );
        "
      >
        <div
          contenteditable="false"
          class="bd-app-icon-btn bd-ens editor-appeditor-deco-wrapper"
          style="border-radius: 10%; cursor: pointer"
        >
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <path
              d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,16V20H18V16H6Z"
            ></path>
          </svg>
        </div>
      </div>
      <div
        class="ProseMirror-widget bd-app-icon-menu bd-page-top-widget"
        id="-1-header-widget"
        style="
          position: absolute;
          background-color: white;
          border: 1px solid rgb(226, 232, 240);
          z-index: 10;
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          right: 50%;
          bottom: 0px;
        "
      >
        <div
          contenteditable="false"
          class="bd-app-icon-btn bd-ens editor-appeditor-deco-wrapper"
          style="border-radius: 10%; cursor: pointer"
        >
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <path
              d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,4V8H18V4H6Z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
    <div class="bd-page-separator-wrapper">
      <div class="bd-page-footer bd-page-footer-all" id="page-footer-0">
        <div class="bd-page-footer-inner-all bd-page-footer-inner">
          <p>1</p>
        </div>
      </div>
      <div
        id="page-separator-0"
        class="bd-page-separator"
        contenteditable="false"
      ></div>
      <div class="bd-page-header bd-page-header-all" id="page-header-0"></div>
    </div>
    <div
      class="bd-page-spacer"
      id="page-spacer-1"
      style="margin-top: calc(var(--editor-page-height) - 168.739984375px)"
    >
      <div
        class="ProseMirror-widget bd-app-icon-menu bd-page-footer-widget bd-ens"
        id="footer-page-1"
        style="
          position: absolute;
          background-color: white;
          border: 1px solid rgb(226, 232, 240);
          z-index: 10;
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          right: 50%;
          bottom: 0px;
          transform: translateY(100%)
            translateX(
              calc(var(--editor-page-width) - var(--editor-page-ml) + 100%)
            );
        "
      >
        <div
          contenteditable="false"
          class="bd-app-icon-btn bd-ens editor-appeditor-deco-wrapper"
          style="border-radius: 10%; cursor: pointer"
        >
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <path
              d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,16V20H18V16H6Z"
            ></path>
          </svg>
        </div>
      </div>
      <div
        class="ProseMirror-widget bd-app-icon-menu bd-page-top-widget"
        id="0-header-widget"
        style="
          position: absolute;
          background-color: white;
          border: 1px solid rgb(226, 232, 240);
          z-index: 10;
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          right: 50%;
          bottom: 0px;
        "
      >
        <div
          contenteditable="false"
          class="bd-app-icon-btn bd-ens editor-appeditor-deco-wrapper"
          style="border-radius: 10%; cursor: pointer"
        >
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <path
              d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,4V8H18V4H6Z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
    <div class="bd-page-separator-wrapper">
      <div class="bd-page-footer bd-page-footer-all" id="page-footer-1">
        <div class="bd-page-footer-inner-all bd-page-footer-inner">
          <p>2</p>
        </div>
      </div>
      <div
        id="page-separator-1"
        class="bd-page-separator"
        contenteditable="false"
      ></div>
      <div class="bd-page-header bd-page-header-all" id="page-header-1"></div>
    </div>
    <div
      class="bd-page-spacer"
      id="page-spacer-2"
      style="margin-top: calc(var(--editor-page-height) - 168.739984375px)"
    >
      <div
        class="ProseMirror-widget bd-app-icon-menu bd-page-footer-widget bd-ens"
        id="footer-page-2"
        style="
          position: absolute;
          background-color: white;
          border: 1px solid rgb(226, 232, 240);
          z-index: 10;
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          right: 50%;
          bottom: 0px;
          transform: translateY(100%)
            translateX(
              calc(var(--editor-page-width) - var(--editor-page-ml) + 100%)
            );
        "
      >
        <div
          contenteditable="false"
          class="bd-app-icon-btn bd-ens editor-appeditor-deco-wrapper"
          style="border-radius: 10%; cursor: pointer"
        >
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <path
              d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,16V20H18V16H6Z"
            ></path>
          </svg>
        </div>
      </div>
      <div
        class="ProseMirror-widget bd-app-icon-menu bd-page-top-widget"
        id="1-header-widget"
        style="
          position: absolute;
          background-color: white;
          border: 1px solid rgb(226, 232, 240);
          z-index: 10;
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          right: 50%;
          bottom: 0px;
        "
      >
        <div
          contenteditable="false"
          class="bd-app-icon-btn bd-ens editor-appeditor-deco-wrapper"
          style="border-radius: 10%; cursor: pointer"
        >
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <path
              d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,4V8H18V4H6Z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
    <div class="bd-page-separator-wrapper">
      <div class="bd-page-footer bd-page-footer-all" id="page-footer-2">
        <div class="bd-page-footer-inner-all bd-page-footer-inner">
          <p>3</p>
        </div>
      </div>
      <div
        id="page-separator-2"
        class="bd-page-separator"
        contenteditable="false"
      ></div>
      <div class="bd-page-header bd-page-header-all" id="page-header-2"></div>
    </div>
    <div
      class="bd-page-spacer"
      id="page-spacer-3"
      style="margin-top: calc(var(--editor-page-height) - 168.739984375px)"
    >
      <div
        class="ProseMirror-widget bd-app-icon-menu bd-page-footer-widget bd-ens"
        id="footer-page-3"
        style="
          position: absolute;
          background-color: white;
          border: 1px solid rgb(226, 232, 240);
          z-index: 10;
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          right: 50%;
          bottom: 0px;
          transform: translateY(100%)
            translateX(
              calc(var(--editor-page-width) - var(--editor-page-ml) + 100%)
            );
        "
      >
        <div
          contenteditable="false"
          class="bd-app-icon-btn bd-ens editor-appeditor-deco-wrapper"
          style="border-radius: 10%; cursor: pointer"
        >
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <path
              d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,16V20H18V16H6Z"
            ></path>
          </svg>
        </div>
      </div>
      <div
        class="ProseMirror-widget bd-app-icon-menu bd-page-top-widget"
        id="2-header-widget"
        style="
          position: absolute;
          background-color: white;
          border: 1px solid rgb(226, 232, 240);
          z-index: 10;
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          right: 50%;
          bottom: 0px;
        "
      >
        <div
          contenteditable="false"
          class="bd-app-icon-btn bd-ens editor-appeditor-deco-wrapper"
          style="border-radius: 10%; cursor: pointer"
        >
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <path
              d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,4V8H18V4H6Z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
    <div class="bd-page-separator-wrapper">
      <div class="bd-page-footer bd-page-footer-all" id="page-footer-3">
        <div class="bd-page-footer-inner-all bd-page-footer-inner">
          <p>4</p>
        </div>
      </div>
      <div
        id="page-separator-3"
        class="bd-page-separator"
        contenteditable="false"
      ></div>
      <div class="bd-page-header bd-page-header-all" id="page-header-3"></div>
    </div>
    <div
      class="bd-page-spacer"
      id="page-spacer-4"
      style="margin-top: calc(var(--editor-page-height) - 168.739984375px)"
    >
      <div
        class="ProseMirror-widget bd-app-icon-menu bd-page-footer-widget bd-ens"
        id="footer-page-4"
        style="
          position: absolute;
          background-color: white;
          border: 1px solid rgb(226, 232, 240);
          z-index: 10;
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          right: 50%;
          bottom: 0px;
          transform: translateY(100%)
            translateX(
              calc(var(--editor-page-width) - var(--editor-page-ml) + 100%)
            );
        "
      >
        <div
          contenteditable="false"
          class="bd-app-icon-btn bd-ens editor-appeditor-deco-wrapper"
          style="border-radius: 10%; cursor: pointer"
        >
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <path
              d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,16V20H18V16H6Z"
            ></path>
          </svg>
        </div>
      </div>
      <div
        class="ProseMirror-widget bd-app-icon-menu bd-page-top-widget"
        id="3-header-widget"
        style="
          position: absolute;
          background-color: white;
          border: 1px solid rgb(226, 232, 240);
          z-index: 10;
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          right: 50%;
          bottom: 0px;
        "
      >
        <div
          contenteditable="false"
          class="bd-app-icon-btn bd-ens editor-appeditor-deco-wrapper"
          style="border-radius: 10%; cursor: pointer"
        >
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <path
              d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,4V8H18V4H6Z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
    <div class="bd-page-separator-wrapper">
      <div class="bd-page-footer bd-page-footer-all" id="page-footer-4">
        <div class="bd-page-footer-inner-all bd-page-footer-inner">
          <p>5</p>
        </div>
      </div>
      <div
        id="page-separator-4"
        class="bd-page-separator"
        contenteditable="false"
      ></div>
      <div class="bd-page-header bd-page-header-all" id="page-header-4"></div>
    </div>
    <div
      class="bd-page-spacer"
      id="page-spacer-5"
      style="margin-top: calc(var(--editor-page-height) - 168.739984375px)"
    >
      <div
        class="ProseMirror-widget bd-app-icon-menu bd-page-footer-widget bd-ens"
        id="footer-page-5"
        style="
          position: absolute;
          background-color: white;
          border: 1px solid rgb(226, 232, 240);
          z-index: 10;
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          right: 50%;
          bottom: 0px;
          transform: translateY(100%)
            translateX(
              calc(var(--editor-page-width) - var(--editor-page-ml) + 100%)
            );
        "
      >
        <div
          contenteditable="false"
          class="bd-app-icon-btn bd-ens editor-appeditor-deco-wrapper"
          style="border-radius: 10%; cursor: pointer"
        >
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <path
              d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,16V20H18V16H6Z"
            ></path>
          </svg>
        </div>
      </div>
      <div
        class="ProseMirror-widget bd-app-icon-menu bd-page-top-widget"
        id="4-header-widget"
        style="
          position: absolute;
          background-color: white;
          border: 1px solid rgb(226, 232, 240);
          z-index: 10;
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          right: 50%;
          bottom: 0px;
        "
      >
        <div
          contenteditable="false"
          class="bd-app-icon-btn bd-ens editor-appeditor-deco-wrapper"
          style="border-radius: 10%; cursor: pointer"
        >
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <path
              d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,4V8H18V4H6Z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
    <div class="bd-page-separator-wrapper">
      <div class="bd-page-footer bd-page-footer-all" id="page-footer-5">
        <div class="bd-page-footer-inner-all bd-page-footer-inner">
          <p>6</p>
        </div>
      </div>
      <div
        id="page-separator-5"
        class="bd-page-separator"
        contenteditable="false"
      ></div>
      <div class="bd-page-header bd-page-header-all" id="page-header-5"></div>
    </div>
    <div
      class="bd-page-spacer"
      id="page-spacer-6"
      style="margin-top: calc(var(--editor-page-height) - 168.739984375px)"
    >
      <div
        class="ProseMirror-widget bd-app-icon-menu bd-page-footer-widget bd-ens"
        id="footer-page-6"
        style="
          position: absolute;
          background-color: white;
          border: 1px solid rgb(226, 232, 240);
          z-index: 10;
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          right: 50%;
          bottom: 0px;
          transform: translateY(100%)
            translateX(
              calc(var(--editor-page-width) - var(--editor-page-ml) + 100%)
            );
        "
      >
        <div
          contenteditable="false"
          class="bd-app-icon-btn bd-ens editor-appeditor-deco-wrapper"
          style="border-radius: 10%; cursor: pointer"
        >
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <path
              d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,16V20H18V16H6Z"
            ></path>
          </svg>
        </div>
      </div>
      <div
        class="ProseMirror-widget bd-app-icon-menu bd-page-top-widget"
        id="5-header-widget"
        style="
          position: absolute;
          background-color: white;
          border: 1px solid rgb(226, 232, 240);
          z-index: 10;
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          right: 50%;
          bottom: 0px;
        "
      >
        <div
          contenteditable="false"
          class="bd-app-icon-btn bd-ens editor-appeditor-deco-wrapper"
          style="border-radius: 10%; cursor: pointer"
        >
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <path
              d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,4V8H18V4H6Z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
    <div class="bd-page-separator-wrapper bd-page-separator-last">
      <div class="bd-page-footer bd-page-footer-all" id="page-footer-6">
        <div class="bd-page-footer-inner-all bd-page-footer-inner">
          <p>7</p>
        </div>
      </div>
      <div
        id="page-separator-6"
        class="bd-page-separator"
        contenteditable="false"
      ></div>
      <div class="bd-page-header bd-page-header-all" id="page-header-6"></div>
    </div>
    <div
      class="bd-page-spacer"
      id="page-spacer-7"
      style="margin-top: calc(var(--editor-page-height) - 168.739984375px)"
    >
      <div
        class="ProseMirror-widget bd-app-icon-menu bd-page-footer-widget bd-ens"
        id="footer-page-7"
        style="
          position: absolute;
          background-color: white;
          border: 1px solid rgb(226, 232, 240);
          z-index: 10;
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          right: 50%;
          bottom: 0px;
          transform: translateY(100%)
            translateX(
              calc(var(--editor-page-width) - var(--editor-page-ml) + 100%)
            );
        "
      >
        <div
          contenteditable="false"
          class="bd-app-icon-btn bd-ens editor-appeditor-deco-wrapper"
          style="border-radius: 10%; cursor: pointer"
        >
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <path
              d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,16V20H18V16H6Z"
            ></path>
          </svg>
        </div>
      </div>
      <div
        class="ProseMirror-widget bd-app-icon-menu bd-page-top-widget"
        id="6-header-widget"
        style="
          position: absolute;
          background-color: white;
          border: 1px solid rgb(226, 232, 240);
          z-index: 10;
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          right: 50%;
          bottom: 0px;
        "
      >
        <div
          contenteditable="false"
          class="bd-app-icon-btn bd-ens editor-appeditor-deco-wrapper"
          style="border-radius: 10%; cursor: pointer"
        >
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <path
              d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,4V8H18V4H6Z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
    <div class="bd-page-separator-wrapper">
      <div class="bd-page-footer bd-page-footer-all" id="page-footer-7">
        <div class="bd-page-footer-inner-all bd-page-footer-inner">
          <p>8</p>
        </div>
      </div>
      <div
        id="page-separator-7"
        class="bd-page-separator"
        contenteditable="false"
      ></div>
      <div class="bd-page-header bd-page-header-all" id="page-header-7"></div>
    </div>
    <div
      class="bd-page-spacer"
      id="page-spacer-8"
      style="margin-top: calc(var(--editor-page-height) - 168.739984375px)"
    >
      <div
        class="ProseMirror-widget bd-app-icon-menu bd-page-footer-widget bd-ens"
        id="footer-page-8"
        style="
          position: absolute;
          background-color: white;
          border: 1px solid rgb(226, 232, 240);
          z-index: 10;
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          right: 50%;
          bottom: 0px;
          transform: translateY(100%)
            translateX(
              calc(var(--editor-page-width) - var(--editor-page-ml) + 100%)
            );
        "
      >
        <div
          contenteditable="false"
          class="bd-app-icon-btn bd-ens editor-appeditor-deco-wrapper"
          style="border-radius: 10%; cursor: pointer"
        >
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <path
              d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,16V20H18V16H6Z"
            ></path>
          </svg>
        </div>
      </div>
      <div
        class="ProseMirror-widget bd-app-icon-menu bd-page-top-widget"
        id="7-header-widget"
        style="
          position: absolute;
          background-color: white;
          border: 1px solid rgb(226, 232, 240);
          z-index: 10;
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          right: 50%;
          bottom: 0px;
        "
      >
        <div
          contenteditable="false"
          class="bd-app-icon-btn bd-ens editor-appeditor-deco-wrapper"
          style="border-radius: 10%; cursor: pointer"
        >
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <path
              d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,4V8H18V4H6Z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
    <div class="bd-page-separator-wrapper">
      <div class="bd-page-footer bd-page-footer-all" id="page-footer-8">
        <div class="bd-page-footer-inner-all bd-page-footer-inner">
          <p>9</p>
        </div>
      </div>
      <div
        id="page-separator-8"
        class="bd-page-separator"
        contenteditable="false"
      ></div>
      <div class="bd-page-header bd-page-header-all" id="page-header-8"></div>
    </div>
    <div
      class="bd-page-spacer"
      id="page-spacer-9"
      style="margin-top: calc(var(--editor-page-height) - 168.739984375px)"
    >
      <div
        class="ProseMirror-widget bd-app-icon-menu bd-page-footer-widget bd-ens"
        id="footer-page-9"
        style="
          position: absolute;
          background-color: white;
          border: 1px solid rgb(226, 232, 240);
          z-index: 10;
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          right: 50%;
          bottom: 0px;
          transform: translateY(100%)
            translateX(
              calc(var(--editor-page-width) - var(--editor-page-ml) + 100%)
            );
        "
      >
        <div
          contenteditable="false"
          class="bd-app-icon-btn bd-ens editor-appeditor-deco-wrapper"
          style="border-radius: 10%; cursor: pointer"
        >
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <path
              d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,16V20H18V16H6Z"
            ></path>
          </svg>
        </div>
      </div>
      <div
        class="ProseMirror-widget bd-app-icon-menu bd-page-top-widget"
        id="8-header-widget"
        style="
          position: absolute;
          background-color: white;
          border: 1px solid rgb(226, 232, 240);
          z-index: 10;
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          right: 50%;
          bottom: 0px;
        "
      >
        <div
          contenteditable="false"
          class="bd-app-icon-btn bd-ens editor-appeditor-deco-wrapper"
          style="border-radius: 10%; cursor: pointer"
        >
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <path
              d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,4V8H18V4H6Z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
    <div class="bd-page-separator-wrapper">
      <div class="bd-page-footer bd-page-footer-all" id="page-footer-9">
        <div class="bd-page-footer-inner-all bd-page-footer-inner">
          <p>10</p>
        </div>
      </div>
      <div
        id="page-separator-9"
        class="bd-page-separator"
        contenteditable="false"
      ></div>
      <div class="bd-page-header bd-page-header-all" id="page-header-9"></div>
    </div>
  </node-view-wrapper>
</template>

<!--style-->
<style lang="less">
* {
  //pointer-events: auto!important;
}
[compname='compBdPage'] {
  //font-size: 0;
  position: relative;
  z-index: 10;

  --editor-page-header-height-all: 2.1cm;
  --editor-page-footer-height-all: 2.1cm;

  --editor-page-width: var(--umo-page-width);
  --editor-page-height: var(--umo-page-height);
  --editor-page-ml: var(--umo-page-margin-left);
  --editor-page-mr: var(--umo-page-margin-right);
  --editor-page-inner-height: 953px;
}

div.bd-page-spacer {
  float: left;
  clear: both;
  width: 0;
  height: 0;
  display: table;
  position: relative;
}

div.bd-page-separator-wrapper {
  box-sizing: content-box;
  float: left;
  clear: both;
  pointer-events: none;
  left: calc((var(--editor-page-ml) * -1) - 1px);
  z-index: 1;
  position: relative;
}

div.bd-page-top-widget {
  transform: translateX(
      calc(var(--editor-page-width) - var(--editor-page-ml) + 100%)
    )
    translateY(calc(var(--editor-page-height) * -1 + 5cm + 50%));
}

.bd-page-footer-inner-all {
  background: var(--editor-page-footer-template-all, white) no-repeat;
  height: var(--editor-page-footer-height-all);
  background-size: cover;
}

.bd-page-header-all {
  background: var(--editor-page-header-template-all, rgba(0, 0, 0, 0)) no-repeat;
  height: var(--editor-page-header-height-all);
  background-size: cover;
  background-position: left top;
}

.bd-page-footer {
  width: 100%;
  &::after {
    content: '';
    position: absolute;
    display: table;
    border: 1px solid darkgray;
    transform: translateY(-100%);
    width: var(--editor-page-width);
    height: var(--editor-page-height);
    z-index: 10;
  }
}

.bd-page-header {
  width: 100%;
  margin-bottom: 10px;
}

.bd-app-icon-btn {
  cursor: pointer;
  border-radius: var(--radius-sm, 0.25rem);
  border-style: var(--tw-border-style);
  border-width: 1px;
  border-color: var(--color-slate-50, oklch(98.4% 0.003 247.858));
  fill: var(--color-black, #000);
  padding: calc(var(--spacing, 0.25rem) * 1);
  text-align: center;
  font-size: var(--text-sm, 0.875rem);
  line-height: var(
    --tw-leading,
    var(--text-sm--line-height, calc(1.25 / 0.875))
  );
  --tw-font-weight: var(--font-weight-medium, 500);
  font-weight: var(--font-weight-medium, 500);
  place-content: center;
  align-items: center;
  display: inline-flex;
  position: relative;
}

.bd-page-separator {
  height: 8px;
  width: var(--editor-page-width);
  background-color: #efefef;
  margin-top: 0;
  margin-bottom: 0;
  display: block;
  position: relative;
}

.editor-appeditor-deco-wrapper {
  flex-direction: row;
  place-content: center;
  display: flex;
}

div.bd-page-separator-last ~ div.bd-page-separator-wrapper,
div.bd-page-separator-last > div.bd-page-header,
div.bd-page-separator-last ~ div.bd-page-spacer {
  display: none !important;
}
</style>
