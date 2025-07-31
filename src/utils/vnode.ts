/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 28/04/25 AM10:49
 */
import { isFunction } from 'sf-utils2'
import { render as renderVNode } from 'vue'

export function toValue<T>(source: T | (() => T) | Ref<T>): T {
  return isFunction(source)
    ? source() // 处理 Getter 函数
    : isRef(source)
      ? source.value // 处理 Ref
      : (source as T) // 返回普通值
}

interface IMountWithCreateAppOptions {
  props?: Record<string, any>
  children?: any
  element?: HTMLElement
  app?: any
  lazyRender?: boolean
}

/**
 * 挂载 通过createApp方式组件 推荐这样方式
 * @param {VNodeTypes | ClassComponent} component
 * @param options
 * @return {{el: *, destroy: destroy, vNode: *, render: () => {}}}
 */
export function mountWithCreateApp(
  component: Component,
  options: IMountWithCreateAppOptions,
) {
  const { props, element, app, lazyRender } = options
  let el = element

  let vNode = createApp(component, props)
  if (app && app._context) Object.assign(vNode._context, app._context) // must use Object.assign on _context
  vNode.appContext ||= app?.$?.appContext

  const render = () => {
    if (el) vNode.mount(el)
    else if (typeof document !== 'undefined')
      vNode.mount((el = document.createElement('div')))
  }

  /**
   * 卸载dom
   * @param {boolean} isRemoveDom 是否卸载过后移出dom
   */
  const destroy = (isRemoveDom = false) => {
    vNode?.unmount()
    if (isRemoveDom)
      el.remove
        ? el.remove()
        : el.parentNode && Node.prototype.removeChild.call(el.parentNode, el)
    el = null
    vNode = null
  }

  !lazyRender && render()

  return { vNode, destroy, el, render }
}

/**
 * 挂载 通过render方式渲染组件
 * ⚠️注意：该卸载组件，只会触发根组件onBeforeUnmount 或者 onUnmount，其子组件不会触发卸载生命周期
 * @param {VNodeTypes | ClassComponent} component
 * @param {object} props
 * @param {Array} children
 * @param {HTMLElement} element
 * @param {object} app
 * @param {boolean} lazyRender 是否惰性渲染，即需不需要初始化渲染
 * @return {{el: *, destroy: destroy, vNode: *, render: () => {}}}
 */
export const mountWithRender = (
  component,
  options: IMountWithCreateAppOptions,
) => {
  const { props, children, element, app, lazyRender } = options
  let el: HTMLElement = element

  let vNode = h(component, props, children)
  if (app && app._context) vNode.appContext = app._context
  vNode.appContext ||= app?.$?.appContext

  const render = () => {
    if (el) renderVNode(vNode, el)
    else if (typeof document !== 'undefined')
      renderVNode(vNode, (el = document.createElement('div')))
  }

  /**
   * 卸载dom
   * @param {boolean} isRemoveDom 是否卸载过后移出dom
   */
  const destroy = (isRemoveDom = false) => {
    if (el) renderVNode(null, el)
    if (isRemoveDom)
      el.remove
        ? el.remove()
        : el.parentNode && Node.prototype.removeChild.call(el.parentNode, el)
    el = null
    vNode = null
  }

  !lazyRender && render()

  return { vNode, destroy, el, render }
}
