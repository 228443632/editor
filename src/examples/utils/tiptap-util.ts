/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 24/04/25 PM3:24
 */
import type { Editor } from '@tiptap/core'
import type { Node, Fragment } from 'prosemirror-model'
import { isArray } from 'sf-utils2'

type TPosAtNodeOption = { key: string }

export const tiptapUtil = {
  /**
   * 根据pos位置获取node节点
   * @param editor
   * @param pos
   */
  nodeAtPosByResolve(editor: Editor, pos: number) {
    const resolve = editor.state.doc.resolve(pos)
    console.log(
      'resolve',
      resolve,
      resolve.node(resolve.depth).content.content,
      resolve.parentOffset,
    )
    return resolve.node(resolve.depth)
  },

  /**
   * 根据pos位置获取node节点
   * @param editor
   * @param pos
   */
  nodeAt(editor: Editor, pos: number) {
    return editor.state.doc.nodeAt(pos)
  },

  /**
   * 根据pos位置获取pos
   * @param editor
   * @param nodes
   * @param option
   */
  posAtNode(
    editor: Editor,
    nodes: Node | Node[],
    option?: TPosAtNodeOption,
  ): { node: Node; pos: number }[] {
    const nodesList = (isArray(nodes) ? nodes : [nodes]) as Node[]
    const fieldKey = option?.key ?? 'data-id'
    const nodesMap = new Map<string, { node: Node; pos: number }>()
    nodesList.forEach((node) => {
      nodesMap.set(generateKey(node), undefined)
    })
    let count = 0
    editor.state.doc.descendants((node, pos) => {
      const key = generateKey(node)
      if (nodesMap.has(key)) {
        nodesMap.set(key, { node, pos })
        count++
      }
      if (count === nodesList.length) return false
      return true
    })
    console.log(
      '[...nodesMap.values()]',
      nodesList,
      [...nodesMap.keys()],
      [...nodesMap.values()],
    )
    return [...nodesMap.values()]

    function generateKey(node: Node) {
      return `${node.type.name}#${node.attrs[fieldKey]}`
    }
  },

  /**
   * 交换操作 块
   * @param editor
   * @param posA
   * @param posB
   */
  swapBlocksAtPos(editor: Editor, posA: number, posB: number) {
    const { state } = editor
    const $posA = state.doc.resolve(posA)
    const $posB = state.doc.resolve(posB)

    const fromA = $posA.before($posA.depth)
    const toA = $posA.after($posA.depth)
    const fromB = $posB.before($posB.depth)
    const toB = $posB.after($posB.depth)

    const sliceA = state.doc.slice(fromA, toA)
    const sliceB = state.doc.slice(fromB, toB)

    editor.view.dispatch(
      fromA > fromB
        ? state.tr
            .delete(fromA, toA)
            .insert(fromA, sliceB.content)
            .delete(fromB, toB)
            .insert(fromB, sliceA.content)
        : state.tr
            .delete(fromB, toB)
            .insert(fromB, sliceA.content)
            .delete(fromA, toA)
            .insert(fromA, sliceB.content),
    )
  },

  /**
   * 交换操作 块
   * @param editor
   * @param nodeA
   * @param nodeB
   * @param option
   */
  swapBlocksAtNode(
    editor: Editor,
    nodeA: Node,
    nodeB: Node,
    option?: TPosAtNodeOption,
  ) {
    const nodeInfoList = tiptapUtil.posAtNode(editor, [nodeA, nodeB], option)
    const posList = nodeInfoList.map((nodeInfo) => nodeInfo.pos) as [
      number,
      number,
    ]
    tiptapUtil.swapBlocksAtPos(editor, ...posList)
  },

  /**
   * 交换操作 节点
   * @param editor
   * @param nodeA
   * @param nodeB
   * @param option
   */
  swapInlineByNode(
    editor: Editor,
    nodeA: Node,
    nodeB: Node,
    option?: TPosAtNodeOption,
  ) {
    if (!nodeA || !nodeB) return false

    const { state, view } = editor
    const [nodeInfo1, nodeInfo2] = tiptapUtil.posAtNode(
      editor,
      [nodeA, nodeB],
      option,
    )
    if (!nodeInfo1 || !nodeInfo2) return false

    const pos1 = nodeInfo1.pos
    const pos2 = nodeInfo2.pos

    // 使用 Mapping 处理位置映射
    const slice1 = state.doc.slice(pos1, pos1 + nodeA.nodeSize)
    const slice2 = state.doc.slice(pos2, pos2 + nodeB.nodeSize)

    // 原子化交换（使用 ReplaceStep 保证事务一致性）
    // 原子化替换（先删除再插入）
    view.dispatch(
      pos1 > pos2
        ? state.tr
            .delete(pos1, pos1 + nodeA.nodeSize)
            .insert(pos1, slice2.content)
            .delete(pos2, pos2 + nodeB.nodeSize)
            .insert(pos2, slice1.content)
        : state.tr
            .delete(pos2, pos2 + nodeB.nodeSize)
            .insert(pos2, slice1.content)
            .delete(pos1, pos1 + nodeA.nodeSize)
            .insert(pos1, slice2.content),
    )

    return true
  },

  /**
   * 编辑node节点
   * @param editor
   * @param callback
   */
  descendants(
    editor: Editor,
    callback: Parameters<typeof Fragment.prototype.descendants>[0],
  ) {
    editor.state.doc.descendants(callback)
  },


  /**
   * 根据 跳转查询 dom
   * @param editor
   * @param nodeTypeName
   * @param attributes
   */
  domAtCondition(editor: Editor, nodeTypeName: string, attributes?: Record<string, any>) {
    const nodePos = editor.$node(nodeTypeName, attributes)
    return editor.view.domAtPos(nodePos.pos)
  }
}
