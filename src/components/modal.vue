<template>
  <t-dialog
    :visible="visible"
    :attach="container"
    :prevent-scroll-through="false"
    placement="center"
    draggable
    dialog-class-name="is-draggable"
    destroy-on-close
    v-bind="$attrs"
    :dialog-style="{
      left: `${dialogLeft}px`,
      top: `${dialogTop}px`,
    }"
    @mousedown="startDrag"
  >
    <template #header>
      <icon v-if="$attrs.icon" :name="$attrs.icon as string" :size="iconSize" />
      <span>{{ $attrs.header }}</span>
    </template>
    <slot />
  </t-dialog>
</template>

<script setup lang="ts">
// import { useEventListener } from '@vueuse/core'
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },

  iconSize: {
    type: Number,
    default: 20,
  },
})

const container = inject('container', 'body')
const attrs = useAttrs()

const dialogLeft = ref(0)
const dialogTop = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)

const startDrag = (e) => {
  if (!attrs.draggable) return
  if (e.target.classList.contains('umo-dialog')) {
    isDragging.value = true
    startX.value = e.clientX - dialogLeft.value
    startY.value = e.clientY - dialogTop.value
    document.addEventListener('mousemove', handleDrag)
    document.addEventListener('mouseup', stopDrag)
  }
}

const handleDrag = (e) => {
  if (isDragging.value) {
    dialogLeft.value = e.clientX - startX.value
    dialogTop.value = e.clientY - startY.value
  }
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

watch(
  () => props.visible,
  () => {
    nextTick(() => {
      dialogLeft.value = 0
      dialogTop.value = 0
    })
  },
)
</script>
