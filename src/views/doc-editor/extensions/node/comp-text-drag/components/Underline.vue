<template>
  <menus-button
    ico="underline"
    :text="t('base.underline')"
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
  return _cssText.value.textDecoration === 'underline'
})

/**
 * 切换
 */
const onToggle = () => {
  const cssText = deepClone(_cssText.value)
  cssText.textDecoration =
    cssText.textDecoration === 'underline' ? null : 'underline'
  updateAttributes({
    cssText,
  })
}
</script>
