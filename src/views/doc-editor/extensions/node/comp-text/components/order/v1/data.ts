/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 2026/5/18 09:58
 */
import { formatMoney } from '@/views/doc-editor/utils/common-util.ts'

/**
 * 留案claim组件数据
 */
export const defaultRetentionClaimCompData = {
  columns: [
    { label: '资产类型', prop: 'batchNo', width: 170, align: 'center' },
    {
      label: '债务人数量',
      prop: 'debtorNum',
      width: 90,
      align: 'center',
    },
    { label: '债权笔数', prop: 'bondNum', width: 90, align: 'center' },
    {
      label: '债权本金',
      prop: 'bondAmount',
      width: null,
      align: 'center',
    },
  ],
  data: [
    {
      batchNo: '消费金融',
      debtorNum: 5569,
      bondNum: 5587,
      bondAmount: formatMoney(90004481.86),
    },
    {
      batchNo: '信用开',
      debtorNum: 6459,
      bondNum: 6459,
      bondAmount: formatMoney(90007556.11),
    },
    {
      batchNo: '个人消费',
      debtorNum: 4257,
      bondNum: 4312,
      bondAmount: formatMoney(90024372.4),
    },
    {
      batchNo: '企业经营贷',
      debtorNum: 765,
      bondNum: 775,
      bondAmount: formatMoney(15019718.16),
    },
    {
      batchNo: '合计',
      debtorNum: 17050,
      bondNum: 17133,
      bondAmount: formatMoney(285056128.53),
    },
  ],
}
