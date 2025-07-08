<template>
  <menus-button
    ico="strike"
    :text="t('base.strike')"
    shortcut="Ctrl+Shift+X"
    hide-text
    :menu-active="editor?.isActive('strike')"
    :disabled="!editor?.can().chain().focus().toggleStrike().run()"
    @menu-click="editor?.chain().focus().toggleStrikeV2().run()"
  />
</template>

<script setup lang="ts">
const editor = inject('editor')
</script>
