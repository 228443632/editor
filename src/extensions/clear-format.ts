/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 06/07/25 AM10:50
 */
import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    clearFormat: {
      clearFormat: () => ReturnType
    }
  }
}
export type ClearFormatOption = object
export default Extension.create<ClearFormatOption>({
  name: 'clearFormat',
  addOptions() {
    return {}
  },
  addCommands() {
    return {
      clearFormat:
        () =>
        ({ chain }) => {
          // feat 特定节点
          return chain()
            .focus()
            .unsetAllMarks()
            .updateAttributes('compText', { cssText: {} })
            .run()
        },
    }
  },
})
