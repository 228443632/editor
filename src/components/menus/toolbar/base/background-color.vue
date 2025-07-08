<template>
  <menus-button
    :text="text || t('base.bgColor')"
    menu-type="popup"
    popup-handle="arrow"
    hide-text
    :popup-visible="popupVisible"
    @toggle-popup="togglePopup"
  >
    <icon name="background-color" class="umo-icon-background-color" size="20"/>
    <div
      :class="[`umo-current-color`, `umo-current-color--${_bgColor || ''}`]"
      :style="{
        color: _bgColor || '#fff',
      }"
    ></div>
    <template #content>
      <color-picker :default-color="defaultColor" @change="colorChange" />
    </template>
  </menus-button>
</template>

<script setup lang="ts">
const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  modeless: {
    type: Boolean,
    default: false,
  },
  defaultColor: {
    type: String,
    default: '',
  },
})
const emits = defineEmits(['change'])

const { popupVisible, togglePopup } = usePopup()
const editor = inject('editor')

let currentColor = $ref<string | undefined>()

const colorChange = (color: string) => {
  currentColor = color
  popupVisible.value = false

  if (props.modeless) {
    emits('change', currentColor)
    return
  }

  if (color === '') {
    editor.value?.chain().focus().unsetHighlightV2().run()
  } else {
    editor.value?.chain().focus().setHighlightV2({ color }).run()
  }
}

/**
 * 背景颜色
 */
const _bgColor = computed(() => {
  return editor.value?.getAttributes('highlight')?.color ?? currentColor
})
</script>

<style lang="less" scoped>
.umo-icon-background-color {
  border-radius: 2px;
}

.umo-current-color {
  width: var(--umo-button-font-size);
  height: 5px;
  border-radius: 2px;
  position: absolute;
  margin: 0 0 -18px -4px;
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
