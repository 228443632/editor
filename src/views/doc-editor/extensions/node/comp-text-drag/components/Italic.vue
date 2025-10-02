<template>
  <menus-button
    :text="t('base.italic')"
    ico="italic"
    hide-text
    :menu-active="_isActive"
    @menu-click="onToggle"
  />
</template>

<script setup lang="ts">
import { deepClone } from 'sf-utils2'

const editor = inject('editor')

const __nodeProps = inject('NODE_PROPS') as Record<string, any>
const { updateAttributes } = __nodeProps
const _cssText = computed(() => __nodeProps.node.attrs?.cssText || {})

const _isActive = computed(() => {
  return _cssText.value.fontStyle === 'italic'
})

/**
 * 切换
 */
const onToggle = () => {
  const cssText = deepClone(_cssText.value)
  cssText.fontStyle = cssText.fontStyle === 'italic' ? null : 'italic'
  updateAttributes({
    cssText,
  })
}
</script>
