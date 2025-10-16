/**
 * @Description: 通用方法
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/10/25 PM10:20
 */
import { cssUtil } from '@/views/doc-editor/utils/css-util.ts'
import { arrayToObj, deepClone, uuid } from 'sf-utils2'
import type { IParamsCompItem } from '@/views/sign-editor/types/types.ts'
import {
  COMP_PARAMS_NAME_MAP,
  COMP_SEAL_STYLE,
  COMP_SIGN_DATE_STYLE,
  COMP_SIGN_STYLE,
} from '@/views/doc-editor/extensions/constant.ts'

export const a4 = cssUtil.getPaperSize('A4')

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
      pageUtils.safeItem(item)
      item.translateY = 0
      item.isInRect = false
      item.key ||= uuid()

      pageUtils.fillItemWH(item)

      const { offsetTop, pageNum } = pageUtils.getPageOffsetTopByTop(item.top)
      item.offsetLeft = item.left ?? 0
      item.offsetTop = offsetTop

      item.offsetX = ~~(item.offsetLeft + item.width / 2)
      item.offsetY = ~~(item.offsetTop + item.height / 2)
      item.pageNum = pageNum
      return item
    }) as IParamsCompItem[]
  },

  /**
   * 填充宽高
   */
  fillItemWH(item: IParamsCompItem) {
    switch (item.type) {
      // 签章
      case COMP_PARAMS_NAME_MAP.compSeal:
        item.width ??= COMP_SEAL_STYLE.width
        item.height ??= COMP_SEAL_STYLE.height
        break
      // 签名
      case COMP_PARAMS_NAME_MAP.compSign:
        item.width ??= COMP_SIGN_STYLE.width
        item.height ??= COMP_SIGN_STYLE.height
        break
      // 签名日期
      case COMP_PARAMS_NAME_MAP.compSignDate:
        item.width ??= COMP_SIGN_DATE_STYLE.width
        item.height ??= COMP_SIGN_DATE_STYLE.height
        break
      default:
        break
    }
    item.width ??= 0
    item.height ??= 0
  },

  /**
   * 默认安全 值
   * @param item
   */
  safeItem(item: IParamsCompItem) {
    item.top ??= 0
    item.left ??= 0
    item.offsetTop ??= 0
    item.offsetLeft ??= 0
    item.offsetX ??= 0
    item.offsetY ??= 0
    item.translateX ??= 0
    item.translateY ??= 0
    item.x ??= 0
    item.y ??= 0
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
    // offsetX offsetY pageNum 一定有
    retainField ||= []
    const retainFieldObj = arrayToObj(retainField)
    console.log('retainFieldObj', retainFieldObj)
    return deepClone(paramsCompList || [])
      .map((item) => {
        pageUtils.safeItem(item)
        item.translateY = 0
        item.isInRect = false
        item.key = uuid()

        pageUtils.fillItemWH(item)
        item.offsetX ??= 0
        item.offsetY ??= 0

        item.offsetLeft = ~~(item.offsetX - item.width / 2)
        item.offsetTop = ~~(item.offsetY - item.height / 2)

        item.top =
          (item.pageNum - 1) * pageUtils.perPageGap +
          (item.pageNum - 1) * a4._basePx.h +
          item.offsetTop
        item.left = item.offsetLeft ?? item.left

        console.log('item', item)

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
    let { offsetTop, pageNum } = pageUtils.getPageOffsetTopByTop(item.top)
    const pageWidth = a4._basePx.w
    const pageHeight = a4._basePx.h
    if (pageNum > maxPageNum) {
      pageNum = maxPageNum
      offsetTop = pageHeight + offsetTop
    }

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
        if (pageNum >= maxPageNum) {
          // 大于等于最大页码
          item.top =
            pageUtils.getAbsoluteTopByPageNum(maxPageNum) +
            pageHeight -
            item.height
        } else {
          item.top = pageUtils.getAbsoluteTopByPageNum(pageNum + 1)
        }
      } else {
        item.top =
          pageHeight - item.height + pageUtils.getAbsoluteTopByPageNum(pageNum)
      }
    }

    item.offsetX = ~~(item.offsetLeft + item.width / 2)
    item.offsetY = ~~(item.offsetTop + item.height / 2)

    return item
  },
}
