/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 17/04/25 AM11:43
 */

import type { ITreeItem } from '@/types/tree'
import { isArray, isNullableString, isObject } from 'sf-utils2'

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
