/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 2026/5/15 23:44
 */
const sfUtils = require('sf-utils2')
const fs = require('fs/promises')
const path = require('path')
// const { template } = require('sf-utils2')

const TP_PATH = path.join(__dirname, 'template.html')
const OUTPUT_PATH = path.join(__dirname, 'output.html')

function formatMoney(num, currency = 'CNY') {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2, // 最小小数位
    maximumFractionDigits: 2  // 最大小数位
  }).format(num);
}

const orderSubjectClaim = {
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

const mockB = {
  columns: [
    { label: '资产类型', prop: 'prjName', width: 200, align: 'center' },
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
      prjName: '消费金融',
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
      prjName: '消费金融',
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
    ...new Array(50).fill({
      prjName: '消费金融',
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
    }).map((item, index) => {
      item.prjName = '消费金融' + (index + 1)
      return item
    })
  ],
}

async function renderHtml() {
  const content = await fs.readFile(TP_PATH, { encoding: 'utf-8' })
  const result = sfUtils.template(
    content,
    {
      'cf_outsourcing_batch.orderSubjectClaim': `<server-component data-compid="OrderSubjectClaim" data-compdata="${encodeURIComponent(JSON.stringify(orderSubjectClaim))}"></server-component>`,
      // 'cf_outsourcing_batch.orderRetentionClaim': `<server-component data-compid="OrderRetentionClaim" data-compdata="${encodeURIComponent(JSON.stringify(orderSubjectClaim))}"></server-component>`,
      'cf_outsourcing_batch.orderRetentionClaim': `<server-component data-compid="OrderRetentionClaim" data-compdata="${encodeURIComponent(JSON.stringify(null))}"></server-component>`,
      'cf_commission_plan.orderPartyBServicePayable': `<server-component data-compid="OrderPartyBServicePayable" data-compdata="${encodeURIComponent(JSON.stringify(mockB))}"></server-component>`,
    },
    {
      tmplRE: /\$\{{2}([.\w[\]\s]+)\}{2}/g,
    },
  )
  await fs.writeFile(OUTPUT_PATH, result, { encoding: 'utf-8' })
  console.log('输出成功👏')
  process.exit(0)
}

renderHtml()