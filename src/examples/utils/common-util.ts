/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 17/04/25 AM11:43
 */

import type { ITreeItem } from '@/types/tree'
import { isArray, isNullable, isNullableString, isObject } from 'sf-utils2'
import { isString } from '@tool-belt/type-predicates'

/**
 * 生成UUId
 * @returns {string}
 */
export function simpleUUID() {
  // xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return 'xxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 空白占位符工具库
export const whitespace = {
  // 零宽度空格 (Zero Width Space)
  zeroWidthSpace: '\u200B',

  // 普通空格 (Space)
  space: ' ',

  // 不间断空格 (Non-Breaking Space)
  nonBreakingSpace: '\u00A0',

  // 窄空格 (Narrow No-Break Space)
  narrowNoBreakSpace: '\u202F',

  // 半角空格 (En Space)
  enSpace: '\u2002',

  // 全角空格 (Em Space)
  emSpace: '\u2003',

  // 四分之一角空格 (Three-Per-Em Space)
  threePerEmSpace: '\u2004',

  // 六分之一角空格 (Four-Per-Em Space)
  fourPerEmSpace: '\u2005',

  // 细空格 (Thin Space)
  thinSpace: '\u2009',

  // 数学空格 (Mathematical Space)
  mathematicalSpace: '\u205F',

  // 制表符 (Tab)
  tab: '\t',

  // 换行符 (New Line)
  newLine: '\n',

  // 回车符 (Carriage Return)
  carriageReturn: '\r',
}

/**
 * 将树形结构数据转换为 renderHTML结构
 * @param nodes
 */
export function convertToDom(nodes: ITreeItem<any>[] = []) {
  if (!nodes.length) return []
  return nodes.map(toDOM).flat(1)
  function toDOM(node) {
    if (isObject(node)) {
      const children = node.children
      let childrenRest = []
      if (!isArray(children)) {
        childrenRest = [children]
      }
      return [node.tag, node.attrs || {}, ...childrenRest.map(toDOM)]
    }
    return isNullableString(node) && !commonUtil.isZeroWidthChar(node)
      ? null
      : node
  }
}

// console.log(
//   'convertToDom',
//   convertToDom([
//     {
//       tag: 'span',
//       attrs: { 'data-type': '1' },
//       children: [
//         { tag: 'div', attrs: { class: 'child' }, children: ['子内容'] },
//         { tag: 'p', attrs: {}, children: ['段落'] }
//       ]
//     }
//   ])
// )

/**
 * 字体大小
 */
export const fontSizes = [
  { label: t('base.fontSize.default'), value: '14px', order: 4 },
  { label: t('base.fontSize.42pt'), value: '42pt', order: 20 }, // 56
  { label: t('base.fontSize.36pt'), value: '36pt', order: 19 }, // 48
  { label: t('base.fontSize.26pt'), value: '26pt', order: 16 }, // 35
  { label: t('base.fontSize.24pt'), value: '24pt', order: 15 }, // 32
  { label: t('base.fontSize.22pt'), value: '22pt', order: 14 }, // 29
  { label: t('base.fontSize.18pt'), value: '18pt', order: 11 }, // 24
  { label: t('base.fontSize.16pt'), value: '16pt', order: 10 }, // 22
  { label: t('base.fontSize.15pt'), value: '15pt', order: 9 }, // 21
  { label: t('base.fontSize.14pt'), value: '14pt', order: 7 }, // 19
  { label: t('base.fontSize.12pt'), value: '12pt', order: 4 }, // 16
  { label: t('base.fontSize.10_5pt'), value: '10.5pt', order: 1 }, // 14
  { label: t('base.fontSize.9pt'), value: '9pt', order: 3 }, // 12
  { label: t('base.fontSize.7_5pt'), value: '7.5pt', order: 1 }, // 10
  { label: t('base.fontSize.6_5pt'), value: '6.5pt', order: 0 }, // 9
  { label: '10px', value: '10px', order: 1 },
  { label: '11px', value: '11px', order: 2 },
  { label: '12px', value: '12px', order: 3 },
  { label: '14px', value: '14px', order: 4 },
  { label: '16px', value: '16px', order: 5 },
  { label: '18px', value: '18px', order: 6 },
  { label: '20px', value: '20px', order: 8 },
  { label: '22px', value: '22px', order: 10 },
  { label: '24px', value: '24px', order: 11 },
  { label: '26px', value: '26px', order: 12 },
  { label: '28px', value: '28px', order: 13 },
  { label: '32px', value: '32px', order: 15 },
  { label: '36px', value: '36px', order: 17 },
  { label: '42px', value: '42px', order: 18 },
  { label: '48px', value: '48px', order: 19 },
  { label: '72px', value: '72px', order: 21 },
  { label: '96px', value: '96px', order: 22 },
]

/**
 * 字体检测，是否支持
 * @param font
 * https://www.cnblogs.com/gaidalou/p/8479452.html
 */
export const fontDetect = (font?: string) => {
  if (!font) {
    return true
  }
  if (!isString(font)) {
    return false
  }

  const baseFont = 'fontname'
  const testChar = 'text'
  const canvasWidth = 100
  const canvasHeight = 100

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true })

  canvas.width = canvasWidth
  canvas.height = canvasHeight
  if (context) {
    context.textAlign = 'center'
    context.fillStyle = 'black'
    context.textBaseline = 'middle'
  }

  const getImageDataWithFont = (currentFont: string) => {
    if (!context) {
      return []
    }
    context.clearRect(0, 0, canvasWidth, canvasHeight)
    context.font = `${canvasHeight}px ${currentFont}, ${baseFont}`
    context.fillText(testChar, canvasWidth / 2, canvasHeight / 2)
    const { data } = context.getImageData(0, 0, canvasWidth, canvasHeight)

    return Array.from(data).filter((pixel) => pixel !== 0)
  }

  // 返回结果，如果使用 baseFont 和输入的 font 时，通过 getImageDataWithFont 函数检测得到的像素数据不一致，则说明自定义字体生效
  return (
    getImageDataWithFont(baseFont).join('') !==
    getImageDataWithFont(font).join('')
  )
}

export type TUpdateDefaultObjectValue<Target, DefaultValue> = Target &
  Omit<DefaultValue, keyof Target>

/**
 * 更新对象默认值
 * @param target
 * @param defaultValue
 * @example
 * ```js
 * const target = {id: 1}
 * const default = {name: 2, id: null, height: 100}
 * updateDefaultObjectValue(target, default)
 * => {name: 2, id: 1, height: 100}
 * ```
 */
export const updateDefaultObjectValue = <T extends object, D extends object>(
  target: T,
  defaultValue: D,
) => {
  Object.keys(defaultValue).forEach((key) => {
    if (isNullable(target[key])) {
      target[key] = defaultValue[key]
    }
  })
  return target as TUpdateDefaultObjectValue<T, D>
}

export const commonUtil = {
  simpleUUID,
  whitespace,
  convertToDom,

  /**
   * 判断字符是否是零宽度字符
   * @param {string} char - 要检查的字符
   * @returns {boolean} - 如果是零宽度字符，返回 true；否则返回 false
   */
  isZeroWidthChar(char) {
    // 定义零宽度字符的 Unicode 范围
    const zeroWidthChars = [
      '\u200B', // 零宽度空格
      '\u200C', // 零宽度非连接符
      '\u200D', // 零宽度连接符
      '\uFEFF', // 字节顺序标记 (BOM)
    ]

    // 检查字符是否在零宽度字符列表中
    return zeroWidthChars.includes(char)
  },

  /**
   * 去除换行空格
   **/
  trimSpace(str: string) {
    return str.replace(/\n+\s*/g, '')
  },
}
