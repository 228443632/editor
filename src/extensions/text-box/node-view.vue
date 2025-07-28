<template>
  <node-view-wrapper
    :id="node.attrs.id"
    ref="containerRef"
    as="span"
    :compname="'textBox'"
    class="umo-node-view umo-floating-node"
    :style="{
      zIndex: 90,
      '--umo-textbox-border-color': node.attrs.borderColor,
      '--umo-textbox-border-width': node.attrs.borderWidth + 'px',
      '--umo-textbox-border-style': node.attrs.borderStyle,
      '--umo-textbox-background-color': node.attrs.backgroundColor,
    }"
  >
    <span
      class="umo-node-container umo-node-text-box"
      :draggable="isInnerDraggable && !options?.document?.readOnly"
      @dragstart="onDragStart"
      @dragover="onDragOver"
    >
      <drager
        :selected="selected"
        :disabled="disabled"
        tag="span"
        :rotatable="true"
        :boundary="false"
        :angle="node.attrs.angle"
        :width="node.attrs.width"
        :height="node.attrs.height"
        :left="node.attrs.left"
        :top="node.attrs.top"
        :min-width="14"
        :min-height="14"
        :title="t('node.textBox.tip')"
        class="inline-block"
        @rotate="debounceOnRotate"
        @resize="debounceOnResize"
        @dragstart="isInnerDraggable = false"
        @dragend="isInnerDraggable = true"
        @drag="debounceOnDrag"
        @blur="disabled = false"
        @click="onClick"
        @dblclick="editTextBox"
      >
        <node-view-content ref="contentRef" class="umo-node-text-box-content" />

        <span v-if="selected" class="contents" @mousedown="onChooseMove">
          <span class="l umo-text-box-line"></span>
          <span class="t umo-text-box-line"></span>
          <span class="r umo-text-box-line"></span>
          <span class="b umo-text-box-line"></span>
        </span>
      </drager>
    </span>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { NodeViewContent, nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'
import Drager from 'es-drager'
import { debounce } from 'sf-utils2'

const { node, updateAttributes, getPos } = defineProps(nodeViewProps)

const options = inject('options')

const containerRef = ref(null)
const contentRef = $ref(null)
let selected = $ref(false)
let disabled = $ref(false)

const isInnerDraggable = ref(false)

const onRotate = ({ angle }: { angle: number }) => {
  updateAttributes({ angle })
}
const onResize = ({ width, height }: { width: number; height: number }) => {
  updateAttributes({ width, height })
}
const onDrag = ({ left, top }: { left: number; top: number }) => {
  updateAttributes({ left, top })
}
const onClick = (event: MouseEvent) => {
  // const classList = (event.target as HTMLElement).classList
  // if (
  //   classList.contains('es-drager-rotate-handle') ||
  //   classList.contains('es-drager-resize-handle') ||
  //   classList.contains('es-drager-dot-handle')
  // ) {
  //   isInnerDraggable.value = false
  // }
  selected = true
  isInnerDraggable.value = false
}

const onChooseMove = () => {
  selected = true
  isInnerDraggable.value = true
}

const debounceOnRotate = debounce(onRotate, 20)
const debounceOnResize = debounce(onResize, 20)
const debounceOnDrag = debounce(onDrag, 20)

const onDragStart = (e: DragEvent) => {
  const pos = getPos()
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData(
    'text/plain',
    JSON.stringify({
      type: 'textBox',
      value: 'textBox',
      from: getPos(),
      to: pos + node.nodeSize,
      nodeSize: node.nodeSize,
      attrs: {
        ...node.attrs,
        left: 0,
        top: 0,
      },
    }),
  )
}

const onDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

onClickOutside(containerRef, () => {
  selected = false
  disabled = false
})

const editTextBox = () => {
  disabled = true
  const range = document.createRange()
  range.selectNodeContents(contentRef.$el)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
  contentRef.$el.focus()
}
</script>

<style lang="less">
.umo-node-view.umo-node-view[compname='textBox'] {
  display: inline-flex;
  position: absolute;
  text-indent: 0;

  .umo-text-box-line {
    --w: 4px;
    display: inline-block;
    position: absolute;
    background: transparent;
    cursor: move;
    z-index: 100;
  }
  .l {
    left: calc(0px - var(--w));
    top: 0;
    width: var(--w);
    height: 100%;
  }
  .r {
    right: 0;
    top: 0;
    width: var(--w);
    height: 100%;
  }
  .b {
    left: 0;
    bottom: 0;
    width: 100%;
    height: var(--w);
  }
  .t {
    left: 0;
    top: calc(0px - var(--w));
    width: 100%;
    height: var(--w);
  }
}
.umo-node-view {
  .umo-node-text-box {
    position: relative;
    .es-drager {
      user-select: text !important;
      cursor: default !important;
      z-index: 90 !important;
      background-color: var(--umo-textbox-background-color);
      &.dragging {
        caret-color: transparent;
      }
      &.disabled {
        outline: none;
        &:after {
          display: none !important;
        }
      }
      &.selected {
        .umo-node-text-box-content {
          outline: none;
        }
      }
      &.disabled.selected {
        .umo-node-text-box-content {
          outline: var(--umo-textbox-border-style)
            var(--umo-textbox-border-width) var(--umo-textbox-border-color);
        }
      }
    }
    .umo-node-text-box-content {
      outline: var(--umo-textbox-border-style) var(--umo-textbox-border-width)
        var(--umo-textbox-border-color);
      height: 100%;
      padding: 5px;
      box-sizing: border-box;
      overflow: hidden;
    }
  }
}
</style>
