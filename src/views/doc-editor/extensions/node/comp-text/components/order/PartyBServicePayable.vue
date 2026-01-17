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
          { label: '资产', prop: 'prjName', width: 200, align: 'center' },
          {
            label: '回款率指标',
            prop: 'clctRate',
            width: null,
            align: 'center',
          },
          {
            label: '回款佣金费率',
            prop: 'clctCommissionRate',
            width: 100,
            align: 'center',
          },
        ],

        data: [
          {
            prjName: '$项目名称',
            commissionPlanList: [
              { clctRate: '回款率≥0.4%', clctCommissionRate: '40%' },
              { clctRate: '0.2%≤回款率<0.4%', clctCommissionRate: '35%' },
              { clctRate: '回款率<0.2%', clctCommissionRate: '30%' },
            ],
          },
          {
            prjName: '$项目名称',
            commissionPlanList: [
              { clctRate: '回款率≥0.5%', clctCommissionRate: '40%' },
              { clctRate: '0.3%≤回款率<0.5%', clctCommissionRate: '35%' },
              { clctRate: '回款率<0.3%', clctCommissionRate: '30%' },
            ],
          },
          {
            prjName: '$项目名称',
            commissionPlanList: [
              { clctRate: '回款率≥0.5%', clctCommissionRate: '40%' },
              { clctRate: '0.3%≤回款率<0.5%', clctCommissionRate: '35%' },
              { clctRate: '回款率<0.3%', clctCommissionRate: '30%' },
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
          prjName: item.prjName,
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

function getColRowspan({ row, rowIndex, col, colIndex }) {
  // if (colIndex == 0) {
  //   return row.list?.length || 1
  // }
  if (col.prop == 'prjName') {
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
  <t-watermark
    is-repeat
    removable
    :watermark-content="{
      text: '仅供预览，不具备法律效力',
      fontColor: 'rgba(0,0,0,0.2)',
    }"
    :width="180"
    :height="28"
    :y="180"
    :x="0"
  >
    <table
      ref="rootRef"
      :class="['server-comp-table', '', isInCell && 'is-in-cell']"
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
              :class="[`align-${col.align}`]"
              :colspan="1"
              :rowspan="
                getColRowspan({ row, rowIndex, col, colIndex })?.rowspan
              "
            >
              <div>{{ row[col.prop] ?? '-' }}</div>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </t-watermark>
</template>

<!--style-->
<style scoped lang="less">
@import './server-component.less';
</style>
