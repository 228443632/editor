<!--
 * @Description: 订单-应支付乙方的委托服务报酬
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 22/04/25 PM3:37
 -->
<script setup>
import { deepClone, isString, isNumber } from 'sf-utils2'

const { proxy } = getCurrentInstance()
const props = defineProps({
  /**
   * 组件数据
   */
  compData: {
    type: Object,
    default: () => {
      return {
        columns: [
          { label: '资产类型', prop: 'assetType', width: 160, align: 'center' },
          {
            label: '目标回款率',
            prop: 'clctRate',
            width: null,
            align: 'center',
          },
          {
            label: '佣金费率',
            prop: 'clctCommissionRate',
            width: 100,
            align: 'center',
          },
        ],

        data: [
          {
            assetType: '消费金融',
            commissionPlanList: [
              { clctRate: '回款率≥0.4%', clctCommissionRate: '40%' },
              { clctRate: '0.2%≤回款率<0.4%', clctCommissionRate: '35%' },
              { clctRate: '回款率<0.2%', clctCommissionRate: '30%' },
              {
                clctRate: '目标回款率达成率',
                clctCommissionRate: '佣金系数',
                headerFlag: 'Y',
              },
              { clctRate: '回款率≥0.4%', clctCommissionRate: '40%' },
              { clctRate: '0.2%≤回款率<0.4%', clctCommissionRate: '35%' },
              { clctRate: '回款率<0.2%', clctCommissionRate: '30%' },
              {
                clctRate: '留案案件回款率',
                clctCommissionRate: '佣金费率',
                headerFlag: 'Y',
              },
              { clctRate: '回款率≥0.4%', clctCommissionRate: '40%' },
              { clctRate: '0.2%≤回款率<0.4%', clctCommissionRate: '35%' },
              { clctRate: '回款率<0.2%', clctCommissionRate: '30%' },
            ],
          },
          {
            assetType: '消费金融',
            commissionPlanList: [
              {
                clctRate: '目标回款率',
                clctCommissionRate: '佣金费率',
                headerFlag: 'Y',
              },
              { clctRate: '回款率≥0.4%', clctCommissionRate: '40%' },
              { clctRate: '0.2%≤回款率<0.4%', clctCommissionRate: '35%' },
              { clctRate: '回款率<0.2%', clctCommissionRate: '30%' },
              {
                clctRate: '目标回款率达成率',
                clctCommissionRate: '佣金系数',
                headerFlag: 'Y',
              },
              { clctRate: '回款率≥0.4%', clctCommissionRate: '40%' },
              { clctRate: '0.2%≤回款率<0.4%', clctCommissionRate: '35%' },
              { clctRate: '回款率<0.2%', clctCommissionRate: '30%' },
              {
                clctRate: '留案案件回款率',
                clctCommissionRate: '佣金费率',
                headerFlag: 'Y',
              },
              { clctRate: '回款率≥0.4%', clctCommissionRate: '40%' },
              { clctRate: '0.2%≤回款率<0.4%', clctCommissionRate: '35%' },
              { clctRate: '回款率<0.2%', clctCommissionRate: '30%' },
            ],
          },
        ],
      }
    },
  },
})
const emit = defineEmits([])

/* 状态 */
const rootRef = ref()
const rootStyle = ref()
const isInCell = ref(false)

// console.log('props.compData', props.compData)

const _columns = computed(() => {
  const columns = deepClone(props.compData?.columns || [])
  return columns.map((item) => {
    let width
    if (isNumber(item.width)) {
      width = `${item.width}px`
    } else if (isString(item.width)) {
      if (+item.width) {
        width = `${item.width}px`
      }
    }

    return {
      ...item,
      width,
    }
  })
})

const _dataList = computed(() => {
  const dataList = deepClone(props.compData?.data || [])
  const result = []
  dataList.forEach((item) => {
    item.children = item.commissionPlanList
    if (Array.isArray(item.children)) {
      item.children.forEach((child, childIndex) => {
        const tempRow = {
          [_mergeField.value]: item[_mergeField.value],
          ...child,
        }
        if (childIndex === 0) {
          tempRow.prjNameColspan = 1
          tempRow.prjNameRowspan = item.children?.length
        }
        result.push(tempRow)
      })
    }
    return item
  })
  return result
})

const _mergeField = computed(() => {
  return props.compData?.columns?.[0]?.prop;
});


function getColRowspan({ row, rowIndex, col, colIndex }) {
  // if (colIndex == 0) {
  //   return row.list?.length || 1
  // }
  if (col.prop == _mergeField.value) {
    if (row.prjNameColspan) {
      return {
        colspan: row.prjNameColspan,
        rowspan: row.prjNameRowspan,
      }
    }
    return {
      colspan: 0,
      rowspan: 0,
    }
  }
  return {
    colspan: 1,
    rowspan: 1,
  }
}

onMounted(() => {
  console.log('rootRef', rootRef.value)
  console.log('parentElement', getNearestCell())
  const cellDom = getNearestCell()
  if (cellDom) {
    isInCell.value = true
    cellDom.style.overflow = 'hidden'
    rootStyle.value = {
      marginLeft: `-1px`,
      width: `calc(100% + 2px)`,
    }
    cellDom.style.padding = '0'
    cellDom.style.margin = '0'
  }
})

function getNearestCell() {
  let parentElement = rootRef.value.parentElement
  while (parentElement) {
    if (parentElement.tagName === 'TD' || parentElement.tagName === 'TH') {
      // 找到在parent中 是table元素
      break
    }
    if (parentElement.tagName === 'BODY') {
      parentElement = null
      break
    }
    parentElement = parentElement?.parentElement
  }
  return parentElement
}

/* 方法 */

/* 计算 */

/* 监听 */

/* 周期 */
onMounted(() => {})

/* 暴露 */
defineExpose({
  $: proxy.$,
})
</script>

<!--render-->
<template>
  <table
    ref="rootRef"
    :class="['server-comp-table', '', isInCell && 'is-in-cell', 'module-order']"
    :style="rootStyle"
  >
    <colgroup>
      <col
        v-for="(item, index) in _columns"
        :key="index"
        :style="{
          'min-width': '25px',
          width: item.width,
        }"
      />
    </colgroup>
    <tbody>
      <tr class="row-header">
        <td
          v-for="(col, colIndex) in _columns"
          :key="colIndex"
          :class="[`align-${col.align}`]"
        >
          <div>{{ col.label }}</div>
        </td>
      </tr>
      <tr
        v-for="(row, rowIndex) in _dataList"
        :key="rowIndex"
        :class="[
          `row-${rowIndex + 1}`,
          rowIndex == 0 && 'is-first',
          rowIndex == _dataList.length - 1 && 'is-last',
        ]"
      >
        <template v-for="(col, colIndex) in _columns" :key="col.prop">
          <td
            v-if="getColRowspan({ row, rowIndex, col, colIndex })?.rowspan"
            :class="[
              `align-${col.align}`,
              row.headerFlag == 'Y' && colIndex > 0 && 'cell--fake-col',
            ]"
            :colspan="1"
            :rowspan="getColRowspan({ row, rowIndex, col, colIndex })?.rowspan"
          >
            <div>{{ row[col.prop] ?? '-' }}</div>
          </td>
        </template>
      </tr>
    </tbody>
  </table>
</template>

<!--style-->
<style lang="less">
@import '../server-component.less';
</style>
