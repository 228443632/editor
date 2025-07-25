<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 25/07/25 AM10:27
 -->
<!--setup-->
<script setup lang="ts">
import { deepClone } from 'sf-utils2'

const props = defineProps({})
const emit = defineEmits({})

/* 状态 */
const __nodeProps = inject('NODE_PROPS') as Record<string, any>
const { updateAttributes } = __nodeProps

/* 方法 */
/**
 * 加粗
 */
const onToggleBold = () => {
  const cssText = deepClone(__nodeProps.node.attrs.cssText)
  cssText.fontWeight = cssText.fontWeight === 'bold' ? 'normal' : 'bold'
  updateAttributes({
    cssText,
  })
}

/* 计算 */
const _isBold = computed(() => {
  return __nodeProps.node.attrs.cssText?.fontWeight === 'bold'
})

/* 监听 */

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({})
</script>

<!--render-->
<template>
  <menus-button
    ico="bold"
    text="加粗"
    hide-text
    :menu-active="_isBold"
    @menu-click="onToggleBold"
  />
</template>

<!--style-->
<style scoped lang="less"></style>
