<template>
  <t-dialog
    :visible="visible"
    :attach="container"
    :prevent-scroll-through="false"
    placement="center"
    draggable
    destroy-on-close
    v-bind="$attrs"
  >
    <template #header>
      <icon v-if="$attrs.icon" :name="$attrs.icon as string" :size="iconSize"/>
      <span>{{ $attrs.header }}</span>
    </template>
    <slot />
  </t-dialog>
</template>

<script setup lang="ts">
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },

  iconSize: {
    type: Number,
    default: 20
  }
})
const container = inject('container', 'body')
</script>
