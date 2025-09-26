<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 24/07/25 PM7:05
 -->
<!--setup-->
<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { useElementBounding } from '@vueuse/core'
import { UMO_AUX_LINE_CTOR } from '@/examples/utils/tiptap-util'
import { MAX_Z_INDEX } from '@/examples/utils/dom'

const props = defineProps({
  /**
   * 是否展示线
   */
  showLine: {
    type: Boolean,
    default: false,
  },

  /**
   * 宽度
   */
  width: {
    type: Number,
    default: undefined,
  },

  /**
   * 高度
   */
  height: {
    type: Number,
    default: undefined,
  },

  /**
   * 是否自动调整大小
   */
  autoResize: {
    type: Boolean,
    default: true,
  },
})
const emit = defineEmits({})

/* 状态 */
const rootRef = ref<HTMLHtmlElement>()
const umoPageContentRef = ref<HTMLHtmlElement>(
  document.querySelector(
    'div.umo-zoomable-container.umo-scrollbar .umo-page-content',
  ),
)
const rootBound = useElementBounding(rootRef)

const umoPageContentBound = useElementBounding(umoPageContentRef)
const updateFlag = ref(0)

/* 方法 */

const update = () => {
  rootBound.update()
  umoPageContentBound.update()
}

/* 计算 */
const _rootStyle = computed(() => {
  const style = {} as CSSProperties
  if (_width.value) style.width = `${_width.value}px`
  if (_height.value) style.height = `${_height.value}px`
  return style
})

const _lineWrapCloneStyle = computed(() => {
  const style = { ..._rootStyle.value } as CSSProperties
  return _rootStyle.value
})

const _lineWrapTeleportStyle = computed(() => {
  return {
    '--line-z': MAX_Z_INDEX - 10,
    '--line-c': MAX_Z_INDEX - 9,
    '--width': `${umoPageContentBound.width.value}px`,
    '--height': `${umoPageContentBound.height.value}px`,
    // 距离左侧
    '--ll': `${Number(rootBound.left.value - umoPageContentBound.left.value).toFixed(1)}px`,
    // 距离右侧到左侧
    '--llr': `${Number(rootBound.right.value - umoPageContentBound.left.value).toFixed(1)}px`,
    // 距离顶部
    '--lt': `${Number(rootBound.top.value - umoPageContentBound.top.value).toFixed(1)}px`,
    // 底部距离到顶部
    '--ltb': `${Number(rootBound.bottom.value - umoPageContentBound.top.value).toFixed(1)}px`,
    '--lb': `${Number(umoPageContentBound.bottom.value - rootBound.bottom.value).toFixed(1)}px`,
    '--lr': `${Number(umoPageContentBound.right.value - rootBound.right.value).toFixed(1)}px`,
  }
})

const _position = computed(() => {
  return {
    left: parseFloat(_lineWrapTeleportStyle.value['--ll']),
    right: parseFloat(_lineWrapTeleportStyle.value['--lr']),
    top: parseFloat(_lineWrapTeleportStyle.value['--lt']),
    bottom: parseFloat(_lineWrapTeleportStyle.value['--lb']),
  }
})

const _width = computed(() =>
  props.autoResize ? rootBound.width.value : props.width,
)
const _height = computed(() =>
  props.autoResize ? rootBound.height.value : props.height,
)

/* 监听 */

watchEffect(() => {
  _width.value
  _height.value
  updateFlag.value++
})

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({
  update,

  _position,
})
</script>

<!--render-->
<template>
  <div ref="rootRef" class="line-wrap" :style="_rootStyle">
    <slot></slot>
  </div>

  <teleport v-if="showLine" :to="`.${UMO_AUX_LINE_CTOR}`">
    <section
      class="contents line-wrap-teleport"
      :style="_lineWrapTeleportStyle"
    >
      <section class="line-wrap-clone" :style="_lineWrapCloneStyle" />
      <div class="line-wrap__left line-wrap__x">
        <span
          class="whitespace-nowrap rounded-2px text-white text-10px bg-primary px-4px py-2px absolute"
          :style="{
            top: `${parseFloat(_lineWrapTeleportStyle['--lt']) / 2}px`,
            transform: `translateY(-50%)`,
          }"
          >{{ parseFloat(_lineWrapTeleportStyle['--lt']) }}</span
        >
      </div>
      <div class="line-wrap__right line-wrap__x"></div>
      <div class="line-wrap__top line-wrap__y absolute">
        <span
          class="whitespace-nowrap rounded-2px text-white text-10px bg-primary px-4px py-2px absolute"
          :style="{
            left: `${parseFloat(_lineWrapTeleportStyle['--ll']) / 2}px`,
            transform: `translateX(-50%)`,
          }"
          >{{ parseFloat(_lineWrapTeleportStyle['--ll']) }}</span
        >
      </div>
      <div class="line-wrap__bottom line-wrap__y"></div>
    </section>
  </teleport>
</template>

<!--style-->
<style lang="less">
.line-wrap {
}

.line-wrap-teleport {
  pointer-events: none;
  & > div {
    position: absolute;
    //transition: 100ms;
    z-index: var(--line-z);
  }

  .line-wrap-clone {
    left: var(--ll);
    top: var(--lt);
    z-index: var(--line-c);
    position: absolute;
  }

  .line-wrap__x {
    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 1px;
      height: 100%;
      background-image: linear-gradient(to bottom, #999 50%, transparent 50%);
      background-size: 1px 10px;
      background-repeat: repeat-y;
      z-index: 1;
    }
  }

  .line-wrap__y {
    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background-image: linear-gradient(to right, #999 50%, transparent 50%);
      background-size: 10px 1px;
      background-repeat: repeat-x;
      z-index: 1;
    }
  }
}

.line-wrap__left {
  left: var(--ll);
  top: 0;
  height: var(--height);
  width: 1px;
}
.line-wrap__right {
  left: var(--llr);
  top: 0;
  height: var(--height);
  width: 1px;
}
.line-wrap__top {
  left: 0;
  top: var(--lt);
  width: var(--width);
  height: 1px;
}
.line-wrap__bottom {
  left: 0;
  top: var(--ltb);
  width: var(--width);
  height: 1px;
}
</style>
