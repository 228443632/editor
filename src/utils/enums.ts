/**
 * @Description: 枚举映射
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 14/01/26 PM3:06
 */
import { isObject } from 'sf-utils2'
/**
 * 枚举映射
 */
export const $enums = {
  /** 服务渲染组件名映射 */
  serverRenderComponent: {
    /** 应支付乙方的委托服务报酬 */
    ORDER_PARTY_B_SERVICE_PAYABLE: enumsWrap(
      'orderPartyBServicePayable',
      '订单-应支付乙方的委托服务报酬',
    ),
    /** 订单-新增委托处置债权(标的债权) */
    ORDER_SUBJECT_CLAIM: enumsWrap(
      'orderSubjectClaim',
      '订单-新增委托处置债权(标的债权)',
    ),
  },
} as const

/**
 * 枚举包装
 * @param key
 * @param label
 * @param extra
 */
export function enumsWrap<
  T extends string | number,
  L extends string,
  R extends Record<string, any>,
>(key: T, label: L, extra?: R) {
  const result = {
    key,
    label,
  } as const
  if (isObject(extra)) Object.assign(result, extra)
  return result as {
    key: T
    label: L
  } & R
}

/**
 * 获取 枚举键 类型
 */
export type TEnumsWrapKeys<T extends object> =
  T extends Record<string, { key: infer K }> ? K : never

/**
 * 获取 枚举label名称 类型
 */
export type TEnumsWrapLabels<T extends object> =
  T extends Record<string, { label: infer L }> ? L : never

/**
 * [类型] 枚举键
 */
export type TEnumsDirectChildKey = keyof typeof $enums
/**
 * [类型] 枚举值
 */
export type TEnumsDirectChildValue = (typeof $enums)[TEnumsDirectChildKey]

export type TDictItem = {
  key: string
  label: string
  [K: string]: any
}

/**
 * 枚举包装成字典
 * @param dict
 */
export function enumsWrapToDict<T extends TEnumsDirectChildKey>(
  dict: T,
): TDictItem[]
export function enumsWrapToDict<T extends TDictItem>(
  dict: Record<string, T>,
): TDictItem[]
export function enumsWrapToDict(
  dict: Record<string, TDictItem> | TEnumsDirectChildKey,
): TDictItem[] {
  if (typeof dict === 'string') {
    return Object.values($enums[dict])
  }
  return Object.values(dict)
}

/**
 * 获取枚举键
 */
// export function enumsKeys<T extends TEnumsDirectChildKey>(enumObj: T): TEnumsWrapKeys<TEnumsDirectChildValue>[];
export function enumsKeys<T extends object>(enumObj: T) {
  let enumObjResult = enumObj
  if (typeof enumObj === 'string') enumObjResult = $enums[enumObj]
  return Object.values(enumObjResult).map(
    (item) => item.key,
  ) as TEnumsWrapKeys<T>[]
}

/**
 * 获取枚举值
 */
export function enumsLabels<T extends object>(enumObj: T) {
  return Object.values(enumObj) as TEnumsWrapLabels<T>[]
}

/**
 * 获取枚举值 说明
 */
// export function enumsDescription<T extends TEnumsDirectChildKey>(enumObj: TEnumsDirectChildKey): string;
// export function enumsDescription<T extends TEnumsDirectChildValue>(enumObj: TEnumsDirectChildValue): string;
export function enumsDescription(
  enumObj: TEnumsDirectChildKey | TEnumsDirectChildValue,
) {
  let tempEnumObj: unknown
  let dictKey: string
  if (typeof enumObj === 'string') {
    dictKey = enumObj
    tempEnumObj = $enums[enumObj]
  } else {
    tempEnumObj = enumObj
  }
  const dictList: TDictItem[] = []
  Object.values(tempEnumObj).forEach((item) => {
    if (item?.key) dictList.push(item)
    if (tempEnumObj === item) {
      dictKey = item.key
    }
  })
  return [
    `${dictKey || ''}`,
    dictList.map((item) => `${item.key}:${item.label}`).join('、'),
  ].join(' ')
}
