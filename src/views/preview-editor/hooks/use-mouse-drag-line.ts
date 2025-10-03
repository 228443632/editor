/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/10/25 PM11:55
 */
import { rafThrottle } from 'sf-utils2'

type ICompRectPos = Partial<{
  left: number
  top: number
  right: number
  bottom: number
}>

type TUseMouseDragLineOptions = {
  mouseEventContainerRef: Ref
}

const MIN_MOVE_DISTANCE = 4

export function useMouseDragLine(
  containerRef: Ref,
  options?: TUseMouseDragLineOptions,
) {
  const startX = ref<number>(0)
  const startY = ref<number>(0)

  const endX = ref<number>(0)
  const endY = ref<number>(0)
  const containerBound = useElementBounding(containerRef)

  const { mouseEventContainerRef = ref(document.body) } = options || {}

  const isMoving = ref<boolean>(false)

  const mousemove = (e: MouseEvent) => {
    if (!_containerEl.value) return
    endX.value = e.clientX - containerBound.left.value
    endY.value = e.clientY - containerBound.top.value

    if (
      Math.abs(_width.value) >= MIN_MOVE_DISTANCE ||
      Math.abs(_height.value) >= MIN_MOVE_DISTANCE
    ) {
      isMoving.value = true
    }

    // console.log(
    //   'mousemove',
    //   e,
    //   startX.value,
    //   startY.value,
    //   endX.value,
    //   endY.value,
    // )
  }
  const throttleMousemove = rafThrottle(mousemove) as typeof mousemove

  const mouseup = (e: MouseEvent) => {
    if (!_containerEl.value) return
    _mEventContainerEl.value.removeEventListener('mousemove', throttleMousemove)
    _mEventContainerEl.value.removeEventListener('mouseup', mouseup)
    endX.value = e.clientX - containerBound.left.value
    endY.value = e.clientY - containerBound.top.value
    console.log('卸载了')
    setTimeout(async () => {
      isMoving.value = false
      await Promise.resolve()
      startX.value = 0
      startY.value = 0
      endX.value = 0
      endY.value = 0
    })
  }

  const mousedown = (e: MouseEvent) => {
    if (!_containerEl.value) return
    startX.value = e.clientX - containerBound.left.value
    startY.value = e.clientY - containerBound.top.value
    console.log('卸载了开始')
    mouseEventContainerRef.value.addEventListener(
      'mousemove',
      throttleMousemove,
    )
    _mEventContainerEl.value.addEventListener('mouseup', mouseup)
  }

  const click = (e: MouseEvent) => {
    if (e.target !== _containerEl.value) return
    console.log('click', e)
    _mEventContainerEl.value.removeEventListener('mousemove', throttleMousemove)
    _mEventContainerEl.value.removeEventListener('mouseup', mouseup)
  }

  watch([containerRef, mouseEventContainerRef], () => {
    initEvent()
  })

  const _width = computed<number>(() => endX.value - startX.value)
  const _height = computed<number>(() => endY.value - startY.value)

  const _containerEl = computed(() => unrefElement(containerRef))
  const _mEventContainerEl = computed(() =>
    unrefElement(mouseEventContainerRef),
  )

  onBeforeUnmount(() => {
    destroyEvent()
  })

  const _fromX = computed<number>(() => Math.min(startX.value, endX.value))
  const _fromY = computed<number>(() => Math.min(startY.value, endY.value))
  const _toX = computed<number>(() => Math.max(startX.value, endX.value))
  const _toY = computed<number>(() => Math.max(startY.value, endY.value))

  function initEvent() {
    destroyEvent()
    const el = unrefElement(containerRef) as HTMLElement
    const mouseEventContainer = unrefElement(
      mouseEventContainerRef,
    ) as HTMLElement
    if (el) {
      // el.addEventListener('click', click)
      mouseEventContainer.addEventListener('mousedown', mousedown)
    }
  }

  function destroyEvent() {
    const el = unrefElement(containerRef) as HTMLElement
    const mouseEventContainer = unrefElement(
      mouseEventContainerRef,
    ) as HTMLElement
    if (el && mouseEventContainer) {
      mouseEventContainer.removeEventListener('click', click)
      mouseEventContainer.removeEventListener('mousedown', mousedown)
      mouseEventContainer.removeEventListener('mousemove', throttleMousemove)
      mouseEventContainer.removeEventListener('mouseup', mouseup)
    }
  }

  /**
   * 判断元素是否在容器内
   * @param containerRect
   * @param targetRect
   */
  const isInRect = (targetRect: ICompRectPos, containerRect?: ICompRectPos) => {
    containerRect = {
      left: _fromX.value,
      top: _fromY.value,
      right: _toX.value,
      bottom: _toY.value,
    }
    return (
      targetRect.left >= containerRect.left &&
      targetRect.top >= containerRect.top &&
      targetRect.right <= containerRect.right &&
      targetRect.bottom <= containerRect.bottom
    )
  }

  return {
    _width,
    _height,
    startX,
    startY,
    endX,
    endY,
    isMoving,
    isInRect,
    _fromX,
    _fromY,
    _toX,
    _toY,
  }
}
