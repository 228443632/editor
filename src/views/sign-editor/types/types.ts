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
  type?: TPrettifyString<'compSeal' | 'compSign' | 'compSignDate'>
  x?: number
  y?: number
  top?: number
  left?: number

  /**
   * 组件key
   */
  key: string

  /** 是否在选中rect内*/
  isInRect?: boolean

  /** 每一页的相对位置 */
  offsetTop?: number

  /** 所处的页码 */
  pageNum?: string

  /**
   * 是否正在拖拽
   */
  isEsDragging?:  boolean
}
