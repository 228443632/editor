<!--
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/08/24 4:51 PM
 -->
<!--setup-->
<script setup lang="ts">
// import PdfPreview2 from '@/views/doc-editor/PdfPreview2.vue'

// import type { GlobalConfigProvider } from 'tdesign-vue-next'
// import cnConfig from 'tdesign-vue-next/esm/locale/zh_CN'
// import enConfig from 'tdesign-vue-next/esm/locale/en_US'
// import ruConfig from '@/locales/tdesign/ru-RU.ts'

const { proxy } = getCurrentInstance()

const props = defineProps({})
const emit = defineEmits({})

/* 状态 */
// const localeConfig = ref<Record<string, GlobalConfigProvider>>({
//   'zh-CN': cnConfig as unknown as GlobalConfigProvider,
//   'en-US': enConfig as unknown as GlobalConfigProvider,
//   'ru-RU': ruConfig as unknown as GlobalConfigProvider,
// })

/* 方法 */

/* 计算 */

/* 监听 */

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({})
</script>

<!--render-->
<template>
  <t-config-provider
    :global-config="{
      classPrefix: 'umo',
    }"
  >
    <router-view></router-view>
  </t-config-provider>
</template>

<!--style-->
<style lang="less">
#app {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

* {
  margin: 0;
  padding: 0;
}
</style>
