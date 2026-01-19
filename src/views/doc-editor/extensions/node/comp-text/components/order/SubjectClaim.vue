<!--
 * @Description: 订单- 新增委托处置债权(标的债权)
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 22/04/25 PM3:37
 -->
<script setup>
import { deepClone, isString, isNumber } from 'sf-utils2'
import { formatMoney } from '@/views/doc-editor/utils/common-util'

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
          { label: '批次号', prop: 'batchNo', width: 170, align: 'center' },
          {
            label: '债务人数量',
            prop: 'debtorNum',
            width: 90,
            align: 'center',
          },
          { label: '债权笔数', prop: 'bondNum', width: 90, align: 'center' },
          {
            label: '债权金额',
            prop: 'bondAmount',
            width: null,
            align: 'center',
          },
        ],
        data: [
          {
            batchNo: '$批次号',
            debtorNum: 5569,
            bondNum: 5587,
            bondAmount: formatMoney(90004481.86),
          },
          {
            batchNo: '$批次号',
            debtorNum: 6459,
            bondNum: 6459,
            bondAmount: formatMoney(90007556.11),
          },
          {
            batchNo: '$批次号',
            debtorNum: 4257,
            bondNum: 4312,
            bondAmount: formatMoney(90024372.4),
          },
          {
            batchNo: '$批次号',
            debtorNum: 765,
            bondNum: 775,
            bondAmount: formatMoney(15019718.16),
          },
          {
            batchNo: '累计',
            debtorNum: 17050,
            bondNum: 17133,
            bondAmount: formatMoney(285056128.53),
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

// 需要合并的列
const needMergeCellKeys = ['asset']

const _columns = computed(() => {
  const columns = deepClone(props.compData?.columns || [])
  return deepClone(columns).map((item) => {
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
  return dataList.map((item) => {
    item.children = item.list
    return item
  })
})

function getColRowspan({ row, rowIndex, col, colIndex }) {
  // if (colIndex == 0) {
  //   return row.list?.length || 1
  // }
  return 1
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
            {{ col.label }}
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
          <td
            v-for="(col, colIndex) in _columns"
            :key="col.prop"
            :class="[`align-${col.align}`]"
            :colspan="1"
            :rowspan="getColRowspan({ row, rowIndex, col, colIndex })"
          >
            <template
              v-if="
                row.children?.length && !needMergeCellKeys.includes(col.prop)
              "
            >
              <div
                v-for="(childItem, childIndex) in row.children"
                :key="childIndex"
                class="cell-div"
              >
                {{ childItem[col.prop] ?? '-' }}
              </div>
            </template>

            <template v-else>
              {{ row[col.prop] ?? '-' }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </t-watermark>
</template>

<!--style-->
<style scoped lang="less">
@import './server-component.less';
</style>
