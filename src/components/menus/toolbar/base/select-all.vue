<template>
  <menus-button
    ico="select-all"
    :text="t('base.selectAll')"
    shortcut="Ctrl+A"
    hide-text
    @menu-click="editor?.chain().focus().selectAllV2().run()"
  />
</template>

<script setup lang="ts">
const editor = inject('editor')
</script>
