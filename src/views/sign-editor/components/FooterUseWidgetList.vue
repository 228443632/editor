<!--
 * @Description: footer 底部 table
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 03/10/25 PM4:19
 -->
<!--setup-->
<script setup lang="tsx">
import type { Table } from 'tdesign-vue-next'
import { deepClone } from 'sf-utils2'

const props = defineProps({})
const emit = defineEmits({})
const count = ref(0)

/* 状态 */
const __signContext__ = inject('__signContext__') // 预览上下文

const tBaseTableRef = ref<InstanceType<typeof Table>>()
const tableAttrs = ref({
  columns: [
    { colKey: 'index', title: '序号', width: 60, fixed: 'left' },
    { colKey: 'compName', title: '类型', width: 80, fixed: 'left' },
    { colKey: 'keywords', title: '关键字', minWidth: 100, fixed: 'left' },
    { colKey: 'pageNum', title: '所在页码', width: 80 },
    { colKey: 'x', title: 'X坐标/X偏移量', width: 120 },
    { colKey: 'y', title: 'X坐标/Y偏移量', width: 120 },
    {
      colKey: '-',
      title: '操作',
      width: 70,
      fixed: 'right',
      cell: (h, { row }) => {
        return (
          <div class="flex gap-2 items-center">
            <span
              class="cursor-pointer text-error"
              onClick={() => __signContext__.value.removeParamsComp(row)}
            >
              删除
            </span>
          </div>
        )
      },
    },
  ],
  maxHeight: 350,
  bordered: true,
  onRowClick: ({ row }) => {
    onChooseUseWidgetItem(row)
  },
  //  __signContext__.activeCompParam
  size: 'small',
  rowClassName: ({ row }) => {
    return row.key && row.key == __signContext__.value?.activeCompParam?.key
      ? '!bg-primary/6 !text-primary !text-bold hover:bg-[#F3F3F3]'
      : '!hover:bg-[#F3F3F3]'
  },
  data: computed(() => {
    // _useWidgetList
    const _tempParamsCompList = deepClone(
      __signContext__.value._paramsCompList || [],
    )
    //  <icon name="image-failed" class="error-icon" />
    const compNameMap = {
      compSign: {
        name: '签名',
        icon: 'icon-sign',
      },
      compSeal: {
        name: '印章',
        icon: 'icon-seal',
      },
      compSignDate: {
        name: '签署日期',
        icon: 'icon-sign-date',
      },
    }
    return _tempParamsCompList.map((item, index) => {
      const resultItem = {
        key: item.key,
        index: index + 1,
        compName: compNameMap[item.type]?.name,
        keywords: item.keywords,
        pageNum: item.pageNum,
        x: Math.floor(item.offsetLeft),
        y: Math.floor(item.offsetTop),
      }
      if (item.keywords) {
        resultItem.x = Math.floor(item._keywordsTranslateX)
        resultItem.y = Math.floor(item._keywordsTranslateY)
      }
      Object.keys(resultItem).forEach((key) => {
        resultItem[key] ??= '-'
      })
      return resultItem
    })
  }),
})

/* 方法 */

/**
 * 选择使用控件
 * @param item
 */
const onChooseUseWidgetItem = (item) => {
  __signContext__.value.selectParamsComp(item)

  if (__signContext__.value.scrollIntoViewByParamsComp) {
    __signContext__.value.scrollIntoViewByParamsComp(item)
  }
}

/* 计算 */

/* 监听 */

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({})
</script>

<!--render-->
<template>
  <section>
    <div class="table-title group-tab-slide mb-4">已使用签署控件集合</div>
    <t-table
      v-bind="tableAttrs"
      class="text-12px"
      ref="tBaseTableRef"
      row-key="id"
    ></t-table>
  </section>
</template>

<!--style-->
<style scoped lang="less">
@import '@/style/common-lazy';

.table-title {
  font-weight: bold;
  color: #333;
  font-size: 14px;
  line-height: 24px;
}
</style>
