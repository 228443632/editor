<template>
  <menus-button
    :text="text || t('base.color')"
    menu-type="popup"
    popup-handle="arrow"
    hide-text
    :popup-visible="popupVisible"
    @toggle-popup="togglePopup"
    @menu-click="colorChange(currentColor)"
  >
    <icon name="color" class="" size="18" />
    <div
      :class="[`umo-current-color`, `umo-current-color--${_color || ''}`]"
      :style="{
        color: _color || '#fff',
      }"
    ></div>
    <template #content>
      <color-picker :default-color="'#ccc'" @change="colorChange" />
    </template>
  </menus-button>
</template>

<script setup lang="ts">
import { deepClone, domUtils } from 'sf-utils2'

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  modeless: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['change'])

const { popupVisible, togglePopup } = usePopup()
const editor = inject('editor')

const __nodeProps = inject('NODE_PROPS') as Record<string, any>
const { updateAttributes } = __nodeProps
const _cssText = computed(() => __nodeProps.node.attrs?.cssText || {})

let currentColor = $ref<string | undefined>()
const colorChange = (color: string) => {
  currentColor = color || 'transparent'
  popupVisible.value = false

  if (props.modeless) {
    emits('change', currentColor)
    return
  }

  const cssText = deepClone(_cssText.value)
  cssText.color = color
  updateAttributes({
    cssText,
  })
}
/**
 * 颜色
 */
const _color = computed(() => {
  const color = _cssText.value.color || '#333'
  if (color.startsWith('rgb')) {
    return domUtils.RGBToHex(color) // '#ffa501'
  }
  return color
})
</script>

<style lang="less" scoped>
.umo-current-color {
  position: absolute;
  width: var(--umo-button-font-size);
  height: 5px;
  border-radius: 2px;
  margin: 0 0 -18px 0;
  background: currentColor;
}

.umo-current-color--,
.umo-current-color--transparent {
  box-shadow: 0 0 0 1px #bfbfbf inset;
  overflow: hidden;
  &:after {
    content: '';
    position: absolute;
    width: 1px;
    height: 200%;
    top: -30%;
    left: 50%;
    transform: translateX(-50%) rotate(30deg);
    background: red;
  }
}
</style>
