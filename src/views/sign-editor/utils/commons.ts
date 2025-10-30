/**
 * @Description: 通用方法
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 02/10/25 PM10:20
 */
import { cssUtil } from '@/views/doc-editor/utils/css-util.ts'
import { arrayToObj, deepClone, uuid, isNoNullable } from 'sf-utils2'
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
   * 获取组件的 origin xy
   * @param item
   */
  getItemOriginXY(item: IParamsCompItem) {},

  /**
   * 更新每一项 偏移x y位置
   * @param item
   */
  updateItemOffsetXY(item: IParamsCompItem) {
    pageUtils.fillItemWH(item)
    const translateX = item.translateX || 0
    const translateY = item.translateY || 0
    if (item.keywords) {
      if (item.list?.length) {
        const originKeywordRect = item.list[0]
        const firstLineRects = item.list.filter(
          (cItem) => cItem.top == originKeywordRect.top,
        )
        let keywordWidth = 0
        firstLineRects.forEach((cItem) => {
          keywordWidth += cItem.width
        })

        // 如果有关键字，说明是关键字定位, 以 offsetTop 和 offsetLeft 计算
        item.offsetX = +Number(
          originKeywordRect.left + keywordWidth / 2 + translateX,
        ).toFixed(0)
        item.offsetY = +Number(
          originKeywordRect.top + originKeywordRect.height / 2 + translateY,
        ).toFixed(0)

        const originOffsetTop = Math.floor(item.offsetY - item.height / 2)
        const originOffsetLeft = Math.floor(item.offsetX - item.width / 2)

        if (!item.offsetTop) {
          item.top = item.offsetTop = originOffsetTop
        }
        if (!item.offsetLeft) {
          item.left = item.offsetLeft = originOffsetLeft
        }

        item._keywordsTranslateX = Math.floor(
          item.offsetLeft - originOffsetLeft,
        )
        item._keywordsTranslateY = Math.floor(item.offsetTop - originOffsetTop)
      }
    } else {
      // 绝对定位
      const { offsetTop, pageNum } = pageUtils.getPageOffsetTopByTop(item.top)
      item.offsetLeft = item.left ?? 0
      item.offsetTop = offsetTop

      item.offsetX = Math.floor(item.offsetLeft + item.width / 2)
      item.offsetY = Math.floor(item.offsetTop + item.height / 2)
      item.pageNum = pageNum
    }
    return item
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
   * 解析参数组件
   * @param paramsCompList
   */
  enhanceCompParams(paramsCompList: IParamsCompItem[] & { _isSkip?: boolean }) {
    const paramsCompListClone = deepClone(paramsCompList || [])
    if (paramsCompList?._isSkip) {
      delete paramsCompListClone._isSkip
      return paramsCompListClone
    }
    return paramsCompListClone.map((item) => {
      item.isInRect = false
      item.key ||= uuid()

      pageUtils.safeItem(item)
      pageUtils.updateItemOffsetXY(item)

      if (item.keywords) {
        // 关键字
        if (item.list?.length) {
          // 获取偏移量
        }
      }

      return item
    }) as IParamsCompItem[]
  },

  /**
   * 逆向解析参数组件
   * @param paramsCompList
   * @param retainField
   */
  reverseEnhanceCompParams(
    paramsCompList: IParamsCompItem[],
    retainField?: IParamsCompItem['type'][],
  ) {
    // offsetX offsetY pageNum 一定有
    retainField ||= []
    const retainFieldObj = arrayToObj(retainField)
    console.log('retainFieldObj', retainFieldObj)
    return deepClone(paramsCompList || [])
      .map((item: IParamsCompItem) => {
        pageUtils.safeItem(item)
        pageUtils.fillItemWH(item)

        if (item.keywords) {
          // 关键字
          if (item.list?.length) {
            pageUtils.updateItemOffsetXY(item)
          }
        } else {
          // 非关键字
          item.offsetLeft = +Number(item.offsetX - item.width / 2).toFixed(0)
          item.offsetTop = +Number(item.offsetY - item.height / 2).toFixed(0)

          item.top =
            (item.pageNum - 1) * pageUtils.perPageGap +
            (item.pageNum - 1) * a4._basePx.h +
            item.offsetTop
          item.left = item.offsetLeft ?? item.left
        }

        item.translateY = 0
        item.translateX = 0
        item.isInRect = false
        item.key = uuid()
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
    const pageWidth = a4._basePx.w
    const pageHeight = a4._basePx.h

    if (item.keywords) {
      if (item.list?.length) {
        const right = item.offsetLeft + item.width
        const bottom = item.offsetTop + item.height
        const left = item.offsetLeft
        const top = item.offsetTop

        if (left < 0) item.offsetLeft = 0
        if (top < 0) item.offsetTop = 0
        if (right > pageWidth) item.offsetLeft = pageWidth - item.width
        if (bottom > pageHeight) item.offsetTop = pageHeight - item.height

        item.top = item.offsetTop
        item.left = item.offsetLeft
      }
    } else {
      // 绝对定位
      let { offsetTop, pageNum } = pageUtils.getPageOffsetTopByTop(item.top)
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
            pageHeight -
            item.height +
            pageUtils.getAbsoluteTopByPageNum(pageNum)
        }
      }
    }

    item.offsetX = +Number(item.offsetLeft + item.width / 2).toFixed(0)
    item.offsetY = +Number(item.offsetTop + item.height / 2).toFixed(0)

    return item
  },

  /**
   * 更新位置
   * @param target
   * @param top
   * @param left
   */
  setItemTopLeft(target: IParamsCompItem, top?: number, left?: number) {
    // console.log('debug02', top, left, target)
    if (target.keywords) {
      if (target.list?.length) {
        // 是关键字
        if (isNoNullable(left) && !Number.isNaN(left))
          target.offsetLeft = target.left = left
        if (isNoNullable(top) && !Number.isNaN(top))
          target.offsetTop = target.top = top
      }
    } else {
      if (isNoNullable(left) && !Number.isNaN(left)) target.left = left
      if (isNoNullable(top) && !Number.isNaN(top)) target.top = top
    }
  },
}
