/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 26/10/25 PM10:14
 */
import { jsPlumb } from 'jsplumb'
import { jsPlumbConfig } from './js-plumb-config.ts'

export function useJsPlumb(containerRef: Ref<HTMLElement>) {
  const jsPlumbInstance = shallowRef()

  /**
   * 初始化jsPlumb
   */
  const initJsPlumb = () => {
    jsPlumbInstance.value = jsPlumb.getInstance()

    jsPlumbInstance.value.ready(() => {
      // 导入默认配置
      jsPlumbInstance.value.importDefaults({
        ...jsPlumbConfig.jsplumbSetting,
        Container: unrefElement(containerRef),
      })
      // 完成连线前的校验
      jsPlumbInstance.value.bind('beforeDrop', (evt) => {
        const res = () => {} // 此处可以添加是否创建连接的校验， 返回 false 则不添加；
        return res
      })
      // 连线创建成功后，维护本地数据
      jsPlumbInstance.value.bind('connection', (evt) => {
        console.log('evt')
        // this.addLine(evt)
      })
      // 连线双击删除事件
      jsPlumbInstance.value.bind('dblclick', (conn, originalEvent) => {
        // this.confirmDelLine(conn)
      })
      // 断开连线后，维护本地数据
      jsPlumbInstance.value.bind('connectionDetached', (evt) => {
        // this.deleLine(evt)
      })
      // 会使整个jsPlumb立即重绘。
      jsPlumbInstance.value.setSuspendDrawing(false, true)
    })

    console.log('jsPlumbInstance.value', jsPlumbInstance.value)
  }

  /**
   * 监听容器变化
   */
  watch(
    containerRef,
    () => {
      if (containerRef.value) {
        initJsPlumb()
      }
    },
    {
      immediate: true,
    },
  )

  onMounted(() => {})

  return {
    jsPlumbInstance,
  }
}
