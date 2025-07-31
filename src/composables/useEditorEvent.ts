/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 23/04/25 AM12:03
 */
import type { Editor } from '@tiptap/vue-3'
import type { TCommonFunc } from 'sf-utils2/types/generic-helper'

export function useEditorEvent(editor: Ref<Editor>) {
  const events = ref({}) as Ref<Record<string, TCommonFunc[]>>
  const addListenerEvent = (eventName: string, callback: TCommonFunc) => {
    if (!editor.value) return
    events.value[eventName] ||= []
    events.value[eventName].push(callback)
    editor.value.on(eventName, callback)
  }

  const removeListenerEvent = (eventName: string, callback: TCommonFunc) => {
    editor.value.off(eventName, callback)
  }

  const removeListenerEventEntire = (eventName: string) => {
    const cbs = events.value[eventName] as TCommonFunc[]
    if (cbs.length) {
      cbs.forEach((cb) => {
        editor.value.off(eventName, cb)
      })
    }
  }

  onBeforeUnmount(() => {
    Object.keys(events.value).forEach((eventName) => {
      removeListenerEventEntire(eventName)
      events.value[eventName] = null
    })
  })

  return {
    addListenerEvent,
    removeListenerEvent,
    removeListenerEventEntire,
  }
}

export default useEditorEvent
