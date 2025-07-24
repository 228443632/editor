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

const zIndexObj = {
  pools: new Set([1000]),

  get max() {
    return Math.max(...this.pools)
  },

  get min() {
    return Math.min(...this.pools)
  },
}

export function useZIndexManage(
  editor?: Ref<Editor>,
  options?: IUseZIndexOptions,
) {
  let z = zIndexObj.max
  const zIndex = ref(z++)
  watch(
    editor,
    (newEditor: Editor) => {
      if (newEditor) {
        if (options?.autoCalcInitial) {
          newEditor.state.doc.descendants((node) => {
            const nodeName = node.type.name
            // zIndex.value =
            if (COMP_PARAMS_MAP[nodeName] && +node.attrs.zIndex > 0) {
              zIndexObj.pools.add(+node.attrs.zIndex)
              zIndex.value = zIndexObj.max
            }
          })
        }
      }
    },
    {
      immediately: true,
    },
  )

  watch(
    zIndex,
    (newZIndex: number) => {
      zIndexObj.pools.add(newZIndex)
    },
    {
      immediately: true,
    },
  )

  /**
   * 获取最高
   * @param autoIncr
   */
  function getTop(autoIncr = true) {
    const maxValue = zIndexObj.max
    if (autoIncr) {
      zIndex.value = maxValue + 1
      return zIndex.value
    }
    return maxValue
  }

  /**
   * 获取最低
   * @param autoDecr
   */
  function getLow(autoDecr = true) {
    const minValue = zIndexObj.min
    if (autoDecr) {
      zIndex.value = minValue - 1
      return Math.max(zIndex.value, 1000)
    }
    return Math.max(minValue, 1000)
  }

  return {
    zIndex,
    getTop,
    getLow,
  }
}
