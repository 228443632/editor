<!--
 * @Description: 添加关键字定位
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 24/10/25 PM3:03
 -->
<!--setup-->
<script setup lang="ts">
import type { Form } from 'tdesign-vue-next'
import { formRules } from '@/views/sign-editor/utils/form-rules.ts'
import { COMP_PARAMS_NAME_MAP } from '@/views/doc-editor/extensions/constant.ts'
import { to, deepClone, isFunction, arrayToObj } from 'sf-utils2'
import type { IParamsCompItem } from '@/views/sign-editor/types/types.ts'
import { pageUtils } from '@/views/sign-editor/utils/commons.ts'

const props = defineProps({
  /**
   * 校验组件
   */
  validateComp: {
    type: Function as PropType<
      (type: IParamsCompItem['type']) => Promise<boolean>
    >,
    default: undefined,
  },
})
const emit = defineEmits(['ok'])

/* 状态 */
const __signContext__ = inject('__signContext__')

const formData = ref({
  keywords: undefined,
  // compType: COMP_PARAMS_NAME_MAP.compSign,
  compType: undefined,
})
const formRef = ref<InstanceType<typeof Form>>()
const options = reactive({
  compType: computed(() => {
    const compTypeList = __signContext__.value.compTypeList || []
    const compTypeListObj = arrayToObj(compTypeList)
    return [
      { key: COMP_PARAMS_NAME_MAP.compSeal, label: '印章' },
      { key: COMP_PARAMS_NAME_MAP.compSign, label: '签名' },
      { key: COMP_PARAMS_NAME_MAP.compSignDate, label: '签署日期' },
    ].filter((item) => {
      return compTypeListObj[item.key]
    })
  }),
})

const rules = {
  keywords: [
    {
      validator: (val) => {
        if (val?.length < 2 || !val?.length) {
          return {
            result: false,
            message: '关键字不少于2个字符',
            type: 'error',
          }
        }
        return { result: true }
      },
    },
  ],
}
/* 方法 */

/**
 * 提交
 */
const submit = async () => {
  const [valid] = await to(formRef.value.validate())
  if (valid !== true)  return useMessage('error', { content: '请检查表单是否填写完整' })

  const resultList = await __signContext__.value.pdfSearch(
    formData.value.keywords,
    {
      matchRule: 'last',
    },
  )
  if (!resultList?.length)
    return useMessage('error', { content: '未找到关键字' })
  console.log(resultList, 'keywords', __signContext__.value.keywordsPosList)

  const [keywordRect] = resultList || []

  if (keywordRect) {
    const keywordRectClone = deepClone(keywordRect) as IParamsCompItem
    keywordRectClone.type = formData.value.compType

    pageUtils.updateItemOffsetXY(keywordRectClone)

    keywordRectClone.isInRect = false

    if (isFunction(props.validateComp)) {
      const valid2 = await props.validateComp(keywordRectClone.type)
      if (valid2 !== true) return
    }

    const paramsCompList = __signContext__.value.paramsCompList
    paramsCompList.push(keywordRectClone)

    // 添加历史记录
    __signContext__.value.manalHistory.commit()

    console.log('keywordRectClone', keywordRectClone)

    if (__signContext__.value.scrollIntoViewByParamsComp) {
      nextTick(() => {
        __signContext__.value.scrollIntoViewByParamsComp(keywordRectClone)
      })
    }
  }

  return true
}

/* 计算 */

/* 监听 */

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({
  submit,
})
</script>

<!--render-->
<template>
  <t-form ref="formRef" :data="formData" :colon="true" label-align="top" class>
    <t-form-item
      label="关键字"
      name="keywords"
      required-mark
      :rules="[...formRules.required, ...rules.keywords]"
      @keydown.enter.prevent="emit('ok')"
    >
      <t-input
        v-model="formData.keywords"
        clearable
        placeholder="请输入（不少于2个字符）"
        class="w-full"
        maxlength="15"
        show-limit-number
        autofocus
      >
      </t-input>
    </t-form-item>

    <t-form-item
      label="控件类型"
      name="compType"
      required-mark
      :rules="[...formRules.required]"
    >
      <t-radio-group v-model="formData.compType">
        <t-radio
          v-for="item in options.compType"
          :key="item.key"
          :value="item.key"
          >{{ item.label }}</t-radio
        >
      </t-radio-group>
    </t-form-item>
  </t-form>
</template>

<!--style-->
<style scoped lang="less"></style>
