<template>
  <div class="umo-toc-container">
    <section>
      <div class="umo-toc-title">
        <span
          v-for="(item, index) in _tabOptions"
          :key="index"
          :class="[
            `umo-toc-title__item`,
            tocActive == item.value && `is-active`,
          ]"
          @click="tocActive = item.value"
        >
          <template v-if="item.value == 'dir'">
            <slot :name="`toc-title-${item.value}`" v-bind="item">
              {{ item.label }}
            </slot>
          </template>

          <template v-else>
            <slot :name="`toc-title-${item.value}`" v-bind="item">
              {{ item.label }}
            </slot>
          </template>
        </span>
        <div class="umo-dialog__close" @click="$emit('close')">
          <icon name="close" size="16" />
        </div>
      </div>
    </section>

    <div v-show="tocActive == `dir`" class="umo-toc-content umo-scrollbar">
      <t-tree
        class="umo-toc-tree"
        :data="tocTreeData"
        :keys="{
          label: 'textContent',
          value: 'id',
        }"
        :empty="t('toc.empty')"
        :transition="false"
        activable
        hover
        expand-all
        @active="headingActive"
      />
    </div>
    <div
      v-if="false"
      class="umo-toc-resize-handle"
      @mousedown="startResize"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { TextSelection } from '@tiptap/pm/state'

const container = inject('container')
const editor = inject('editor')
const page = inject('page')

defineEmits(['close'])

interface TocItem {
  [key: string]: any
  children?: TocItem[]
}
// 最终可视化数据
let tocTreeData = $ref([])
let watchTreeData: TocItem[] = [] // 可视化监听数据
const buildTocTree = (tocArray: Record<string, any>[]): TocItem[] => {
  if (!Array.isArray(tocArray)) return []
  const root: TocItem[] = []
  const stack: TocItem[] = []
  for (const item of tocArray) {
    const node: TocItem = {
      textContent: item.textContent,
      level: item.originalLevel,
      id: item.id,
      actived: false, // item.isActive,
      children: [],
    }
    while (
      stack.length > 0 &&
      stack[stack.length - 1].level >= item.originalLevel
    ) {
      stack.pop()
    }
    if (stack.length === 0) {
      root.push(node)
    } else {
      stack[stack.length - 1].children!.push(node)
    }
    stack.push(node)
  }
  return root
}

const tocActive = inject('tocActive')

const throttleTocTreeData = (toc: any) =>
  useThrottleFn(() => {
    // 每次都监听 但不是每次发生变化，重复赋值导致toc数据双击生效
    const curTocTreeData = buildTocTree(toc)
    if (JSON.stringify(watchTreeData) !== JSON.stringify(curTocTreeData)) {
      watchTreeData = curTocTreeData
      tocTreeData = JSON.parse(JSON.stringify(curTocTreeData))
    }
  }, 200)()

watch(
  () => editor.value?.storage.tableOfContents.content,
  (toc: any[]) => {
    void throttleTocTreeData(toc)
  },
  { immediate: true },
)

const headingActive = (value: any) => {
  if (!editor.value) {
    return
  }
  const nodeElement = editor.value.view.dom.querySelector(
    `[data-toc-id="${value[0]}"]`,
  )
  const pageContainer = document.querySelector(
    `${container} .umo-zoomable-container`,
  ) as HTMLElement
  const pageHeader = pageContainer?.querySelector(
    '.umo-page-node-header',
  ) as HTMLElement
  pageContainer.scrollTo({
    top: nodeElement.offsetTop + pageHeader.offsetHeight,
  })
  const pos = editor.value.view.posAtDOM(nodeElement as Node, 0)
  const { tr } = editor.value.view.state
  tr.setSelection(new TextSelection(tr.doc.resolve(pos)))
  editor.value.view.dispatch(tr)
  editor.value.view.focus()
}

const umoPageContainer = document.querySelector(
  '.umo-page-container',
) as HTMLElement
const baseTocWidth = 320
const isResizing = ref(false)
const startX = ref(0)
const initialWidth = ref(baseTocWidth)
const startResize = (e: MouseEvent) => {
  if (!umoPageContainer) {
    return
  }
  isResizing.value = true
  startX.value = e.clientX
  initialWidth.value = parseInt(
    getComputedStyle(
      umoPageContainer?.querySelector('.umo-toc-container') as HTMLElement,
    ).width,
    10,
  )
  umoPageContainer.addEventListener('mousemove', resize)
  umoPageContainer.addEventListener('mouseup', stopResize)
}

const resize = (e: MouseEvent) => {
  if (isResizing.value) {
    const offsetX = e.clientX - startX.value
    const newWidth = initialWidth.value + offsetX
    const minWidth = baseTocWidth / 1.5
    const maxWidth = baseTocWidth * 2
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      const tocContainer = umoPageContainer.querySelector(
        '.umo-toc-container',
      ) as HTMLElement
      tocContainer.style.width = `${newWidth}px`
    }
  }
}

const stopResize = () => {
  isResizing.value = false
  umoPageContainer.removeEventListener('mousemove', resize)
  umoPageContainer.removeEventListener('mouseup', stopResize)
}

const _tabOptions = computed(() => {
  return [
    {
      label: t('toc.title'),
      value: 'dir',
    },
    ...(page.value?.tocTabsOptions || []),
  ]
})
</script>

<style lang="less" scoped>
.umo-toc-container {
  padding-top: var(--padding-top);
  padding-left: 10px;
  //left: var(--left-aside-left);
  //background-color: var(--umo-color-white);
  background: transparent;
  border-right: solid 1px var(--umo-border-color);
  width: var(--left-aside-width);
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex: none;
  flex-direction: column;
  position: relative;
  .umo-toc-resize-handle {
    position: absolute;
    top: 0;
    right: -2px;
    width: 3px;
    height: 100%;
    opacity: 0.5;
    background-color: transparent;
    &:hover {
      background-color: var(--umo-primary-color);
      cursor: col-resize;
    }
  }
  .umo-toc-title {
    //border-bottom: solid 1px var(--umo-border-color-light);
    display: flex;
    align-items: center;
    font-size: 13px;
    position: relative;
    padding: 0px 4px 6px;
    gap: 14px;
    .umo-toc-title__item {
      color: #9ea5b1;
      font-weight: normal;
      cursor: pointer;
      position: relative;
      display: inline-block;
      &:after {
        content: '';
        --left: 2px;
        width: calc(100% - 2 * var(--left));
        display: block;
        height: 3px;
        border-radius: 2px;
        transform: scaleX(0);
        transition: transform 0.3s ease;
        position: absolute;
        background-color: currentColor;
        bottom: -6px;
        left: var(--left);
      }
      &.is-active {
        color: #333;
        font-weight: bold;
        &:after {
          transform: scaleX(1);
        }
      }
    }
    .icon-toc {
      margin-right: 5px;
      font-size: 20px;
    }
    .umo-dialog__close {
      position: absolute;
      right: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .umo-toc-content {
    flex: 1;
    display: flex;
    padding: 10px;
    flex-direction: column;
    overflow: auto scroll;
    .umo-toc-tree {
      --td-comp-size-m: 22px;
      --td-comp-paddingLR-xs: 4px;
      --td-comp-margin-xs: 0;
      --td-brand-color-light: #e2e4ea;
      --td-comp-paddingTB-xxs: 0;
      user-select: none;
      font-size: 12px;
      :deep(.umo-tree__empty) {
        height: 60px;
        font-size: 12px;
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--umo-text-color-light);
      }
      :deep(.umo-is-active) {
        font-weight: 400;
        color: var(--umo-primary-color);
      }
      :deep {
        .umo-tree__item + .umo-tree__item {
          margin-top: 2px;
        }

        .umo-tree__icon {
          --td-font-size-body-medium: 12px;
        }
      }
    }
  }
}
</style>
