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
    <icon name="color" class="" size="18"/>
    <div
      :class="[
        `umo-current-color`,
        `umo-current-color--${_color || ''}`,
      ]"
      :style="{
        color: _color || '#fff',
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
    default: '#000',
  },
})
const emits = defineEmits(['change'])

const { popupVisible, togglePopup } = usePopup()
const editor = inject('editor')

let currentColor = $ref<string | undefined>()
const colorChange = (color: string) => {
  currentColor = color || 'transparent'
  popupVisible.value = false

  if (props.modeless) {
    emits('change', currentColor)
    return
  }

  if (color === '') {
    editor.value?.chain().focus().unsetColorV2().run()
  } else {
    editor.value?.chain().focus().setColorV2(color).run()
  }
}

/**
 * 颜色
 */
const _color = computed(() => {
  return editor.value?.getAttributes('textStyle')?.color || currentColor
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
