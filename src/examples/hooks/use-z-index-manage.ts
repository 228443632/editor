/**
 * @Description: 层级管理
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 21/07/25 AM11:46
 */
import type { Editor } from '@tiptap/core'
import { COMP_PARAMS_MAP } from '@/examples/extensions/constant'

interface IUseZIndexOptions {
  /**
   * 是否自动计算初始值
   */
  autoCalcInitial?: boolean
}

const zIndex = ref(3000)
const zIndexPools = shallowRef(new Set<number>()) as Ref<Set<number>>

export function useZIndexManage(
  editor: Ref<Editor>,
  options?: IUseZIndexOptions,
) {
  watch(
    editor,
    (newEditor: Editor) => {
      if (newEditor) {
        if (options?.autoCalcInitial) {
          newEditor.state.doc.descendants((node) => {
            const nodeName = node.type.name
            // zIndex.value =
            if (COMP_PARAMS_MAP[nodeName] && +node.attrs.zIndex > 0) {
              zIndexPools.value.add(+node.attrs.zIndex)
              zIndex.value = Math.max(zIndex.value, node.attrs.zIndex)
            }
          })
        }
      }
    },
    {
      immediately: true,
    },
  )

  watch(zIndex, (newZIndex: number) => {
    zIndexPools.value.add(newZIndex)
  })

  /**
   * 获取最高
   * @param autoIncr
   */
  function getTop(autoIncr = true) {
    const maxValue = Math.max(...zIndexPools.value)
    if (autoIncr) zIndex.value = maxValue + 1
    return zIndex.value
  }

  /**
   * 获取最低
   * @param autoDecr
   */
  function getLow(autoDecr = true) {
    let minValue = Math.min(...zIndexPools.value)
    if (minValue) minValue--
    return Math.max(minValue, 1000)
  }

  zIndex.value++

  return {
    zIndex,
    zIndexPools,
    getTop,
    getLow,
  }
}
