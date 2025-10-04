/**
 * @Description: spin加载，支持不同的spin方式
 * @Author BPF
 * @create 2021/10/6 14:23
 */
import './spin.less'
import {
  add,
  domUtils,
  isBoolean,
  isObject,
  isPlainObject,
  uuid,
} from 'sf-utils2'
import { mountWithRender } from '@/utils/vnode'

interface IFakeProgressOptions {
  /**
   * 每次间隔更新时间 默认是50ms
   */
  internalTime?: number

  /**
   * 计数速度 默认是6
   */
  trickleSpeed?: number

  /**
   * 保留 位数，默认是0
   */
  precision?: number
}

/**
 * 猜测虚假进度时间
 * @param second 单位s
 * @param trickleSpeed 每次递增进度 默认是4
 */
export function guessFakeProgressTime(second: number, trickleSpeed = 6) {
  const half = Math.floor(trickleSpeed / 2)
  const totalTimes = Math.ceil(100 / half) // 次数
  return Math.floor((second * 1000) / totalTimes)
}

/**
 * 生成虚假的进度 百分比逻辑
 */
export function useFakeProgress(options?: IFakeProgressOptions) {
  const setting = {
    internalTime: 300,
    trickleSpeed: 8,
    precision: 0,
    ...(options || {}),
  } as IFakeProgressOptions

  const progress = ref(0)
  const timerId = ref()
  const reset = {}

  const start = () => {
    progress.value = 1
    const work = function () {
      timerId.value = setTimeout(
        function () {
          if (progress.value >= 100) {
            progress.value = 99
            return
          }
          const tempProgress = +add(
            progress.value,
            Math.round(Math.random() * setting.trickleSpeed).toFixed(
              setting.precision,
            ),
          )
          if (tempProgress >= 99) {
            progress.value = 99
            if (setting.precision > 0) progress.value += 0.9
            return
          }
          progress.value = tempProgress
          work()
        },
        (() => {
          let random = 0
          while (random < 0.32) {
            random = Math.random()
          }
          return setting.internalTime * random
        })(),
      )
    }
    work()
  }

  const done = () => {
    progress.value = 100
  }

  onBeforeUnmount(() => {
    timerId.value && clearTimeout(timerId.value)
  })

  return {
    reset,
    progress,
    start,
    timerId,
    done,
  }
}

const SpinProps = {
  /** 是否处于加载中 */
  loading: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否展示loading 形状
   */
  showLoadingShape: {
    type: Boolean,
    default: true,
  },
  /** 方向 */
  direction: {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'default',
  },
  id: {
    type: String,
    default: undefined,
  },
  /** 层级 */
  zIndex: {
    type: Number,
    default: 1 << 13,
  },
  /** 展示类型 dot rect circle circular circle2 */
  type: {
    type: [String, Object] as PropType<
      'dot' | 'rect' | 'circle' | 'circular' | 'circle2' | 'flower' | Component
    >,
    default: 'dot',
  },
  /** 尺寸 default small large */
  size: {
    type: String as PropType<'default' | 'small' | 'large'>,
    default: 'default',
  },
  /** 是否展示loading文字 */
  showLoadingText: {
    type: Boolean,
    default: false,
  },
  /** loading文字内容 */
  loadingText: {
    type: String,
    default: '加载中...',
  },
  /** 是否需要遮盖层 */
  mask: {
    type: Boolean,
    default: true,
  },
  /** 延迟渲染，防止闪烁现象 */
  delay: {
    type: Number,
    default: 20,
  },
  /** 是否展示虚假的进度百分比 */
  isFakeProgressText: {
    type: Boolean,
    default: false,
  },
  /** 虚假进度条百分options */
  fakeProgressTextOptions: {
    type: Object as PropType<IFakeProgressOptions>,
    default: undefined,
  },

  /** 颜色, 默认主色 */
  color: {
    type: String,
    default: `#2d49d1`,
  },

  /** 风格样式，card 卡片式 */
  styleType: {
    type: String as PropType<'card' | 'default'>,
    default: `default`,
  },
}

type TSpinProps = ExtractPropTypes<typeof SpinProps> & {
  loading: boolean
}

declare global {
  interface HTMLElement {
    __spinVNode: any
    __props: Ref<TSpinProps> | undefined
  }
}

const Spin = defineComponent({
  props: {
    /** 数据 */
    spinData: {
      type: Object as PropType<TSpinProps>,
      default: () => {},
    },
  },
  setup(props) {
    const { progress, start, done } = useFakeProgress(
      props.spinData.fakeProgressTextOptions,
    )

    // 虚假的进度条数值
    const _progress = computed((): string => {
      if (!props?.spinData?.isFakeProgressText) return undefined
      return progress.value + '%'
    })

    watchEffect(() => {
      if (props?.spinData?.isFakeProgressText) {
        if (props.spinData?.loading) start()
        else done()
      }
    })

    return () => {
      const spinnerDot =
        props?.spinData?.type === 'dot' ? (
          <div
            class={`spinner-icon spinner-dot spinner-dot--${props?.spinData?.size || 'default'}`}
          >
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </div>
        ) : null

      const spinnerRect =
        props?.spinData?.type === 'rect' ? (
          <div
            class={`spinner-icon spinner-rect spinner-rect--${props?.spinData?.size || 'default'}`}
          >
            <div class="cube1"></div>
            <div class="cube2"></div>
          </div>
        ) : null

      // 类似地，为其他类型创建 JSX 元素

      const spinnerFlower =
        props?.spinData?.type === 'flower' ? (
          <span
            class={`spinner-icon spinner-flower spinner-flower--${props?.spinData?.size || 'default'}`}
          ></span>
        ) : null

      const spinnerCircle =
        props?.spinData?.type === 'circle' ? (
          <svg
            viewBox="25 25 50 50"
            class={`spinner-icon spinner-circle spinner-circle--${props?.spinData?.size || 'default'}`}
          >
            <circle
              cx="50"
              cy="50"
              r="20"
              fill="none"
              class="path-background path"
            />
            <circle
              cx="50"
              cy="50"
              r="20"
              fill="none"
              class="path-loading path"
            />
          </svg>
        ) : null

      const spinnerCircle2 =
        props?.spinData?.type === 'circle2' ? (
          <div
            class={`spinner-icon spinner-circle2 spinner-circle2--${props?.spinData?.size || 'default'}`}
          >
            {' '}
          </div>
        ) : null

      /* 组件 */
      const spinnerComponent = isObject(props?.spinData?.type) ? (
        <component is={props?.spinData?.type}></component>
      ) : null

      const spinnerCircular =
        props?.spinData?.type === 'circular' ? (
          <svg
            viewBox="25 25 50 50"
            class={`spinner-icon spinner-circular spinner-circular--${props?.spinData?.size || 'default'}`}
          >
            {' '}
            <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
          </svg>
        ) : null

      // ... 为其他 spinner 类型创建 JSX
      const loadingText = props?.spinData?.showLoadingText ? (
        <div
          class={`loading__text loading__text--${props?.spinData?.size || 'default'}`}
        >
          {props?.spinData?.loadingText}
          {_progress.value}
        </div>
      ) : null

      const mask = props?.spinData?.mask ? (
        <div
          class="spin-popper--mask"
          data-type="spin"
          data-spin-id={props?.spinData?.id}
        ></div>
      ) : null

      return (
        <div
          class={[
            'spin-popper--initial',
            'spin-popper',
            !props.spinData?.showLoadingShape && 'is-shape-hidden',
            `spin-popper--${props?.spinData?.direction}`,
          ].join(' ')}
          data-type="spin"
          data-spin-id={props?.spinData?.id}
          style={{ zIndex: props?.spinData?.zIndex }}
        >
          {spinnerDot}
          {spinnerRect}
          {spinnerFlower}
          {spinnerCircle}
          {spinnerCircle2}
          {spinnerCircular}
          {spinnerComponent}
          {/* ... 插入其他 spinner 类型 */}
          {loadingText}
          {mask}
        </div>
      )
    }
  },
})

let uid = 1

const spin = {
  name: 'spin',

  /**
   * 传入的属性props
   */
  props: {
    id: undefined,
    loading: true,
    showLoadingShape: true, // 是否展示loading 形状
    type: 'dot', // 可选值 dot rect circle circular circle2
    size: 'default', // 可选值 default small large
    showLoadingText: false, // 是否展示loading 文字
    loadingText: '加载中...', // loading文字内容
    delay: 20, // 延迟渲染，防止闪烁现象
    zIndex: 1 << 10,
    mask: true, // 是否需要遮盖层
    direction: 'vertical', // horizontal vertical 加载图标 文字方向
    color: `var(--tzx-primary-color)`, // 颜色, 默认主色
    styleType: 'default',
    fakeProgressTextOptions: undefined,
  } as TSpinProps,

  /**
   * 更新dom节点
   * @param el 当前节点
   * @param props props属性值
   */
  updateDomNode(el: HTMLElement, props: TSpinProps) {
    const spinPopperEls = el.querySelectorAll(
      `.spin-popper[data-spin-id="${props.id}"]`,
    ) // popper
    // const spinPopperMaskEls = el.querySelectorAll(`.spin-popper--mask[data-spin-id="${props.id}"]`) // mask遮盖层

    el.__props ||= ref({} as TSpinProps)
    Object.assign(el.__props.value, props)
    // el.style.setProperty(`--v-spin-primary-color`, props.color)

    if (!spinPopperEls?.length) {
      const rootDom = document.createElement('div')
      const { vNode } = mountWithRender(Spin, {
        props: { spinData: el.__props.value },
        element: rootDom,
      })
      el.__spinVNode = vNode
      el.insertAdjacentElement('beforeend', vNode.el)
      rootDom.remove()
    }
  },

  mergeBindingVal(binding: DirectiveBinding<TSpinProps>): TSpinProps {
    let props = {} as TSpinProps
    const showLoadingText = binding.modifiers?.showLoadingText
    if (isBoolean(binding.value)) {
      props = {
        showLoadingText,
        ...this.props,
        ...binding.modifiers,
        loading: binding.value,
      }
    } else if (isPlainObject(binding.value)) {
      props = {
        showLoadingText,
        ...this.props,
        ...binding.modifiers,
        ...binding.value,
      }
    }
    return props
  },
}

/**
 * 重新更新DOM node
 * @param {Element} el
 * @param {Object} props
 */
const updateDomNode = function (el: HTMLElement, props: TSpinProps) {
  const classes = ['v-spin-wrap', `v-spin-wrap--${props.styleType}`]
  // 防止闪烁
  if (props.delay == 0) {
    props.loading
      ? domUtils.addClasses(el, classes)
      : domUtils.removeClasses(el, classes)
    spin.updateDomNode(el, props)
  } else {
    setTimeout(() => {
      props.loading
        ? domUtils.addClasses(el, classes)
        : domUtils.removeClasses(el, classes)
      spin.updateDomNode(el, props)
    }, props.delay)
  }
}

const spinDirective = {
  mounted(el, binding) {
    const props = spin.mergeBindingVal(binding)
    if (binding.modifiers?.fullscreen) el = document.body
    props.id = 'x_' + uuid().slice(0, 6) + '_' + ++uid
    el.dataset.spinId = props.id
    // 防止闪烁
    updateDomNode(el, props)
  },

  updated(el, binding) {
    if (JSON.stringify(binding.oldValue) === JSON.stringify(binding.value))
      return
    const props = spin.mergeBindingVal(binding)
    if (binding.modifiers?.fullscreen) el = document.body
    if (!el) return
    props.id ||= el.dataset?.spinId
    updateDomNode(el, props)
  },
}

export default spinDirective
