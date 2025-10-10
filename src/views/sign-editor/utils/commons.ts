/**
 * @Description: 通用方法
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/10/25 PM10:20
 */
import { cssUtil } from '@/views/doc-editor/utils/css-util.ts'
import { arrayToObj, deepClone, uuid } from 'sf-utils2'
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
    let pageNum = pageUtils.getPageNumByTop(top)
    if (pageNum < 1) pageNum = 1
    return {
      offsetTop: top - (pageNum - 1) * a4._basePx.h - (pageNum - 1) * mt,
      pageNum,
    }
  },

  /**
   * 根据top获取当前所处的页页的偏移量 offsetTop
   * @param top
   * TODO
   */
  // getPageOffsetTopByY(top: number) {
  //   const mt = pageUtils.perPageGap
  //   let pageNum = pageUtils.getPageNumByTop(top)
  //   if (pageNum < 1) pageNum = 1
  //   return {
  //     offsetTop: top - (pageNum - 1) * a4._basePx.h - (pageNum - 1) * mt,
  //     pageNum,
  //   }
  // },

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
      item.translateY = 0
      item.isInRect = false
      item.key ||= uuid()
      item.width ??= 0
      item.height ??= 0
      const { offsetTop, pageNum } = pageUtils.getPageOffsetTopByTop(item.top)
      item.offsetLeft = item.left
      item.offsetTop = offsetTop

      item.offsetX = ~~(item.offsetLeft + item.width / 2)
      item.offsetY = ~~(item.offsetTop + item.height / 2)
      item.pageNum = pageNum
      return item
    }) as IParamsCompItem[]
  },

  /**
   * 逆向解析参数组件
   * @param paramsCompList
   * @param retainField
   */
  reverseExpandCompParams(
    paramsCompList: IParamsCompItem[],
    retainField?: IParamsCompItem['type'][],
  ) {
    retainField ||= []
    const retainFieldObj = arrayToObj(retainField)
    return deepClone(paramsCompList || [])
      .map((item) => {
        item.translateY = 0
        item.isInRect = false
        item.key ||= uuid()
        item.top =
          (item.pageNum - 1) * pageUtils.perPageGap +
          (item.pageNum - 1) * a4._basePx.h +
          item.offsetTop
        item.left = item.offsetLeft || item.left
        return item
      })
      .filter((item) => retainFieldObj[item.type])
  },

  /**
   * 纠正位置
   * @param item
   * @param maxPageNum
   */
  correctPos(item: IParamsCompItem, maxPageNum: number) {
    // const y = ~~(item.top + item.height / 2)
    const { offsetTop, pageNum } = pageUtils.getPageOffsetTopByTop(item.top)
    const pageWidth = a4._basePx.w
    const pageHeight = a4._basePx.h

    const right = item.left + item.width
    const bottom = offsetTop + item.height
    const left = item.left
    const top = offsetTop

    if (left < 0) item.left = 0
    if (top < 0) item.top = pageUtils.getAbsoluteTopByPageNum(pageNum)
    if (right > pageWidth) item.left = pageWidth - item.width
    if (bottom > pageHeight) {
      const centerY = offsetTop + item.height / 2
      if (centerY > pageHeight) {
        const tmpPageNext = pageNum >= maxPageNum ? maxPageNum : pageNum + 1
        item.top = pageUtils.getAbsoluteTopByPageNum(tmpPageNext)
      } else {
        item.top =
          pageHeight - item.height + pageUtils.getAbsoluteTopByPageNum(pageNum)
      }
    }
    return item
  },
}
