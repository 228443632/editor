/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 23/04/25 AM12:03
 */
import type { Editor } from '@tiptap/vue-3'

export function useEditorEvent(editor: Ref<Editor>) {
  const events = ref({})
  const addListenerEvent = (eventName: string, callback: Function) => {
    events.value[eventName] = callback
    editor.value.on(eventName, callback)
  }

  const removeListenerEvent = (eventName: string, callback: Function) => {
    editor.value.off(eventName, callback)
  }

  onBeforeUnmount(() => {
    Object.keys(events.value).forEach((eventName) => {
      events.value[eventName] = null
      removeListenerEvent(eventName, events.value[eventName])
    })
  })

  return {
    addListenerEvent,
    removeListenerEvent,
  }
}

export default useEditorEvent
