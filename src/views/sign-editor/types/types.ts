/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/10/25 PM6:46
 */
import type { TPrettifyString } from 'sf-utils2/types/generic-helper'

/**
 * 参数组件item
 */
export interface IParamsCompItem {
  /** 组件类型*/
  type?: TPrettifyString<'compSeal' | 'compSign' | 'compSignDate'>

  /** 绝对顶部 */
  top?: number

  /** 绝对左部 */
  left?: number

  /** 中间点x = top + width / 2 */
  x?: number

  /** 中间点y = left + height / 2 */
  y?: number

  /** 宽度 */
  width?: number

  /** 高度 */
  height?: number

  /** 当前相对y轴偏移量*/
  translateY?: number

  /** 当前相对x轴偏移量*/
  translateX?: number

  /** 组件key*/
  key: string

  /** 是否在选中rect内*/
  isInRect?: boolean

  /** 每一页的相对位置 */
  offsetTop?: number

  /**
   * 每一页左边距
   */
  offsetLeft?: number

  /** 真正的 中间点x = offsetTop + width / 2 */
  offsetX?: number

  /** 真正的 中间点y = offsetLeft + height / 2 */
  offsetY?: number

  /** 所处的页码 */
  pageNum?: number

  /**
   * 是否正在拖拽
   */
  isEsDragging?: boolean

  [K: string]: any
}
