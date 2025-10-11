/**
 * @Description: hooks
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 2023/4/5 12:45
 */

import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { get } from '@vueuse/core'
import {
  scrollToElement,
  observerElementMutation,
  throttle,
  batchElsPosInContainer,
  getParentScrollElement,
} from 'sf-utils2'

/**
 * 锚点
 * @example
 *  useAnchor({
 *     target: pageRef,
 *     selectors: [
 *       { selector: '.item--basic-info', value: '1' },
 *       { selector: '.item--service-process', value: '2' }
 *     ],
 *     defaultValue: '1',
 *     offsetTop: -42
 *  })
 * @param options
 * @return {Ref<{init: undefined, active, updateOptions: undefined, scrollTo: undefined, removeEvents: undefined>>}
 */
export function useAnchor(options = {}) {
  // let { target = null, selectors = [], defaultValue = undefined, offsetTop = 0 } = options
  const anchor = ref({
    active: options.defaultValue,
    scrollTo: undefined,
    init: undefined,
    updateOptions: undefined,
    removeEvents: undefined,
  })

  let _scrollView = null // 滚动区域
  let _anchorPositions = [] // 各个锚点位置
  let _enableScrollCal = true // 是否允许滚动监听计算
  let _throttleScrollContent // 内容滚动方法
  let _observerMutation

  /**
   * 添加event
   */
  function addEvents() {
    const target = get(options.target)
    if (target?.nodeType === 1) {
      _scrollView &&
        _scrollView.addEventListener('scroll', _throttleScrollContent, false)
      _observerMutation = observerElementMutation({
        callback: getPositions,
        options: { el: target },
      })
      _observerMutation.start()
      nextTick(() => {
        getPositions()
      })
    }
  }

  /**
   * 监听内容发生滚动
   */
  function onScrollContent() {
    if (!_enableScrollCal) return
    const offsetTop = options.offsetTop || 0
    if (_anchorPositions?.length) {
      const scrollTop = _scrollView.scrollTop
      const idx = _anchorPositions.findLastIndex(
        (v) => scrollTop >= v.top + offsetTop,
      )
      if (~idx) anchor.value.active = options.selectors.at(idx)?.value
    }
  }

  /**
   * 移除滚动区域监听
   */
  function removeEvents() {
    if (options.target?.nodeType === 1) {
      _scrollView &&
        _scrollView.removeEventListener('scroll', _throttleScrollContent, false)
      if (_observerMutation) {
        _observerMutation.end()
        _observerMutation = null
      }
    }
  }

  /**
   * 计算各个 指标在滚动dom中的绝对位置
   */
  function getPositions() {
    const target = get(options.target)
    if (target) {
      _anchorPositions = batchElsPosInContainer({
        els: options.selectors.map((v) => v.selector),
        scrollDom: _scrollView,
      }).map((v, vi) => ({
        ...v,
        value: options.selectors[vi]?.value,
        top: v?.top,
      }))
      // console.log('重新计算位置了', _anchorPositions)
    }
  }

  /**
   * 初始化target
   */
  function initTarget(target) {
    target ||= get(options.target)
    if (target?.nodeType === 1) {
      _scrollView = target || getParentScrollElement(target)
    }
  }

  /**
   * 跳转到val
   * @param {any} val
   */
  function scrollTo(val) {
    const item = _anchorPositions.find((v) => v?.value === val)
    if (item?.el) {
      // 做兼容处理
      _enableScrollCal = false
      scrollToElement({
        target: item.el,
        scrollElement: _scrollView,
        cb: () => setTimeout(() => (_enableScrollCal = true), 20),
        duration: 500,
        offsetTop: options.offsetTop,
      })
    }
  }

  /**
   * 初始化
   * @returns {*}
   */
  function init() {
    removeEvents()
    _throttleScrollContent = throttle(onScrollContent, 10)
    const target = get(options.target)
    if (target?.nodeType !== 1)
      return console.error(`传入的target函数返回值需为元素节点`)
    initTarget(target)
    addEvents()
  }

  /**
   * 更新target
   * @param {Object} opts
   */
  function updateOptions(opts = {}) {
    Object.keys(opts).forEach((key) => {
      options[key] = opts[key]
    })
    init()
  }

  Object.assign(anchor.value, {
    scrollTo,
    init,
    updateOptions,
    removeEvents,
  })

  watch(
    () => options.target.value,
    () => {
      nextTick(() => {
        anchor.value.init()
      })
    },
  )

  onMounted(() => {
    anchor.value.init()
  })

  onUnmounted(() => {
    anchor.value.removeEvents()
  })

  return anchor
}

export default useAnchor
