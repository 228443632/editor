<!--
 * @Description: 目录内容参数
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 22/04/25 PM2:27
 -->
<!--setup-->
<script setup lang="ts">
import type { Node } from 'prosemirror-model'
import { debounce } from 'sf-utils2'

import useEditorEvent from '@/composables/useEditorEvent'

const { proxy } = getCurrentInstance()

const props = defineProps({})
const emit = defineEmits({})

/* 状态 */
const page = inject('page')
const editor = inject('editor')
const tocActive = inject('tocActive')

tocActive.value = 'params'
const { addListenerEvent } = useEditorEvent(editor)
const __compNodeList__ = inject('__compNodeList__') as Ref<[]>
const __globalBizState__ = inject('__globalBizState__') as Ref<{}>
const rootRef = ref<HTMLHtmlElement>()

const compIconMap = {
  /**
   * 普通文本
   */
  compText: {
    icon: 'params-comp-text',
  },
  /**
   * 普通表格
   */
  compTable: {
    icon: 'params-comp-table',
  },
}

/* 方法 */

function updateContentList() {
  // editor.state.doc.forEach(

  const nameMap = {
    compText: 1,
  }

  const tempCompNodeList = []
  editor.value?.state.doc.descendants((node: Node, pos: number) => {
    if (nameMap[node.type.name]) {
      // console.log(node.attrs.nodeId)
      const icon = compIconMap[node.type.name]?.icon
      tempCompNodeList.push({ node, pos, icon })
    }
  })
  __compNodeList__.value = tempCompNodeList
}

const debounceUpdateContentList = debounce(updateContentList, 100)

/**
 * 选中节点
 * @param item
 */
function onChooseItem(item: { node: Node; pos: number }) {
  __globalBizState__.value.nodeActive = item.node
  console.log('item.pos', item.pos)
  editor.value.chain().focus().setNodeSelection(item.pos).run()
  const dom = editor.value.view.nodeDOM(item.pos)
  if (dom) {
    dom.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }
}

/**
 * 删除节点
 */
function onDelItem(item: { node: Node; pos: number }) {
  editor.value
    .chain()
    .focus()
    .deleteRange({ from: item.pos, to: item.pos + item.node.nodeSize })
    .run() // 先选中节点
}

/* 计算 */

const _nodeActiveNodeId = computed(
  () => __globalBizState__.value.nodeActive?.attrs?.nodeId,
)

/* 监听 */
watch(__compNodeList__, (newVal) => {
  const paramsTab = page.value.tocTabsOptions.find(
    (item) => item.value == 'params',
  )
  console.log('paramsTab', paramsTab)
  paramsTab.label = ['参数', newVal.length ? `(${newVal.length})` : '']
    .filter(Boolean)
    .join(' ')
})

watch(_nodeActiveNodeId, () => {
  nextTick(() => {
    const activeNodeDom = rootRef.value.querySelector(
      `.umo-toc-params__item.is-active`,
    )
    if (activeNodeDom)
      activeNodeDom.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      })
  })
})

/* 周期 */
onMounted(() => {
  // editor.value.$nodes.querySelectorAll('')
  addListenerEvent('update', ({ editor }) => {
    // The selection has changed.
    debounceUpdateContentList()
  })

  debounceUpdateContentList()

  console.log('nodeList', __compNodeList__)
})

/* 暴露 */
defineExpose({
  $: proxy.$,
})
</script>

<!--render-->
<template>
  <div ref="rootRef" class="umo-toc-params">
    <ul>
      <li
        v-for="item in __compNodeList__"
        :key="item.node.attrs?.nodeId"
        :class="[
          `flex items-center umo-toc-params__item`,
          _nodeActiveNodeId &&
            _nodeActiveNodeId == item.node.attrs?.nodeId &&
            'is-active',
        ]"
        @click="onChooseItem(item)"
      >
        <icon :name="item.icon" class="text-[#999]" size="14px"></icon>
        <span class="flex flex-1 items-center ml-4px umo-toc-params__text">{{
          item.node.attrs?.placeholder
        }}</span>
        <icon
          name="close-circle-filled"
          class="flex-none invisible umo-toc-params__close-icon text-[#9398A6]"
          @click.stop="onDelItem(item)"
        ></icon>
      </li>
    </ul>
  </div>
</template>

<!--style-->
<style scoped lang="less">
.umo-toc-params {
  padding: 10px 0;
  ul {
    padding: 0 16px 0 0;
    li {
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      margin-bottom: 2px;
      min-height: 28px;
      padding: 4px 10px;
      text-align: left;
      width: 100%;
      & + li {
        margin-top: 4px;
      }
      &.is-active {
        background: #d4d3d4;
      }
      &:hover {
        background-color: #f8f8f8;
        .umo-toc-params__close-icon {
          visibility: visible;
        }
      }
      .umo-toc-params__text {
        position: relative;
        &:after {
          content: '*';
          color: var(--umo-error-color);
          font-size: 13px;
          margin-left: 2px;
        }
      }
    }
  }
}
</style>
