<!--
 * @Description: 目录内容参数
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 22/04/25 PM2:27
 -->
<!--setup-->
<script setup lang="ts">
import useEditorEvent from '@/composables/useEditorEvent'
import { debounce } from 'sf-utils2'
import type { Node } from 'prosemirror-model'

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

  __compNodeList__.value = []
  editor.value?.state.doc.descendants((node: Node, pos: number) => {
    if (nameMap[node.type.name]) {
      console.log(node.attrs.nodeId)
      const icon = compIconMap[node.type.name]?.icon
      __compNodeList__.value.push({ node, pos, icon })
    }
  })
}

const debounceUpdateContentList = debounce(updateContentList, 100)

/**
 * 选中节点
 * @param item
 */
function onChooseItem(item: { node: Node; pos: number }) {
  requestAnimationFrame(() => {
    console.log('item.pos', item.pos)
    editor.value.chain().focus().setNodeSelection(item.pos).run()
    const dom = editor.value.view.nodeDOM(item.pos)
    if (dom) {
      dom.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  })
}

/**
 * 删除节点
 */
function onDelItem(item: { node: Node; pos: number }) {
  editor.value
    .chain()
    .focus()
    .deleteRange(item.pos, item.pos + item.node.nodeSize)
    .run() // 先选中节点
}

/* 计算 */

/* 监听 */

/* 周期 */
onMounted(() => {
  // editor.value.$nodes.querySelectorAll('')
  addListenerEvent('update', ({ editor }) => {
    // The selection has changed.
    console.log('selectionUpdate')
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
  <div class="umo-toc-params">
    <ul>
      <li
        v-for="item in __compNodeList__"
        :key="item.node.attrs?.nodeId"
        class="flex items-center"
        @click="onChooseItem(item)"
      >
        <icon :name="item.icon" class="text-[#999]"></icon>
        <span class="flex flex-1 items-center ml-4px">{{
          item.node.attrs?.placeholder
        }}</span>
        <icon
          @click="onDelItem(item)"
          name="close-circle-filled"
          class="flex-none invisible umo-toc-params__close-icon text-[#666]"
        ></icon>
      </li>
    </ul>
  </div>
</template>

<!--style-->
<style scoped lang="less">
.umo-toc-params {
  padding: 16px 0;
  ul {
    padding: 0 16px 0 0;
    li {
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      margin-bottom: 2px;
      min-height: 36px;
      padding: 10px 10px;
      text-align: left;
      width: 100%;
      transition: background-color 0.3s;
      &:hover {
        background-color: #f8f8f8;
        .umo-toc-params__close-icon {
          visibility: visible;
        }
      }
    }
  }
}
</style>
