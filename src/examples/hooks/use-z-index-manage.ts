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

export function useZIndexManage(
  editor?: Ref<Editor>,
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
            if (COMP_PARAMS_MAP[nodeName] && node.attrs.zIndex) {
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

  zIndex.value++

  return {
    zIndex,
  }
}
