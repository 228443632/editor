<template>
  <menus-button
    ico="bold"
    :text="t('base.bold')"
    shortcut="Ctrl+B"
    hide-text
    :menu-active="editor?.isActive('bold')"
    :disabled="!editor?.can()?.chain?.()?.toggleBoldV2()?.run()"
    @menu-click="editor?.chain()?.focus()?.toggleBoldV2?.().run()"
  />
</template>

<script setup lang="ts">
const editor = inject('editor')
</script>
