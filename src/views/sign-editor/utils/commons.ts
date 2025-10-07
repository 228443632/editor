/**
 * @Description: 通用方法
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/10/25 PM10:20
 */
import { cssUtil } from '@/views/doc-editor/utils/css-util.ts'
import { deepClone, uuid } from 'sf-utils2'
import type { IParamsCompItem } from '@/views/sign-editor/types/types.ts'

const a4 = cssUtil.getPaperSize('A4')

export const pageUtils = {
  /** 每页间隔 */
  perPageGap: 12,

  a4,

  /**
   * 根据页码获取 绝对top
   * @param pageNum
   */
  getAbsoluteTopByPageNum(pageNum: number) {
    const mt = pageUtils.perPageGap
    return (pageNum - 1) * a4._basePx.h + (pageNum - 1) * mt
  },

  /**
   * 根据top获取当前所处的页页的偏移量 offsetTop
   * @param top
   */
  getPageOffsetTopByTop(top: number) {
    const mt = pageUtils.perPageGap
    const pageNum = pageUtils.getPageNumByTop(top)
    return {
      offsetTop: top - (pageNum - 1) * a4._basePx.h - (pageNum - 1) * mt,
      pageNum,
    }
  },

  /**
   * 根据top 获取页码
   * @param top
   */
  getPageNumByTop(top: number) {
    const mt = pageUtils.perPageGap
    const pageH = a4._basePx.h
    return Math.ceil((top + mt) / (mt + pageH))
  },

  /**
   * 解析参数组件
   * @param paramsCompList
   */
  expandCompParams(paramsCompList: IParamsCompItem[] & { _isSkip?: boolean }) {
    const paramsCompListClone = deepClone(paramsCompList || [])
    if (paramsCompList?._isSkip) {
      delete paramsCompListClone._isSkip
      return paramsCompListClone
    }
    return paramsCompListClone.map((item) => {
      item.isInRect = false
      item.key ||= uuid()
      const { offsetTop, pageNum } = pageUtils.getPageOffsetTopByTop(item.top)
      item.offsetTop = offsetTop
      item.pageNum = pageNum
      return item
    }) as IParamsCompItem[]
  },

  /**
   * 逆向解析参数组件
   * @param paramsCompList
   */
  reverseExpandCompParams(paramsCompList: IParamsCompItem[]) {
    return paramsCompList.map((item) => {
      item.isInRect = false
      item.key ||= uuid()
      item.top =
        (item.pageNum - 1) * pageUtils.perPageGap +
        (item.pageNum - 1) * a4._basePx.h +
        item.offsetTop
      return item
    })
  },
}
