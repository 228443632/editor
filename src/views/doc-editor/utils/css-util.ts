/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 24/04/25 PM7:36
 */
import { type CSSProperties } from 'vue'
export const cssUtil = {
  /**
   * 获取所有的样式
   */
  getAllCSSRules() {
    let cssText = ''
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        // 处理同源样式表（避免跨域错误）
        const rules = sheet.cssRules || sheet.rules
        if (rules) {
          Array.from(rules).forEach((rule) => {
            cssText += `${rule.cssText}\n`
          })
        }
      } catch (e) {
        console.warn('无法读取样式表规则（可能跨域）:', sheet.href)
      }
    })
    return cssText
  },

  /**
   * 获取外部link内容
   */
  async getExternalCSS() {
    const links = document.querySelectorAll(
      'link',
    ) as unknown as HTMLLinkElement[]

    // 并行发起所有请求
    const fetchPromises = Array.from(links)
      .filter((link) => link.href && link.href.endsWith('.css'))
      .map(async (link) => {
        console.log('link', link.href)
        try {
          const response = await fetch(link.href)
          console.log('response', response)
          if (response.ok) {
            return await response.text()
          }
        } catch (e) {
          console.warn('无法加载外部样式表:', link.href)
          return '' // 返回空字符串避免中断
        }
      })

    // 等待所有请求完成
    const cssResults = await Promise.all(fetchPromises)
    console.log('cssResults', cssResults)
    return cssResults.join('\n') // 合并结果
  },

  /**
   * 获取所有的css
   */
  async getCssAll() {
    // if (process.env.NODE_ENV === 'production') {
    //   return ''
    // }
    const cssRes = await Promise.all([
      cssUtil.getExternalCSS(),
      cssUtil.getAllCSSRules(),
    ])
    return cssRes.join('\n')
  },

  /**
   * css样式文本转对象
   * @param styleText
   * @return {CSSProperties}
   */
  styleTextToObj(styleText = ''): CSSProperties {
    const styleTextList = styleText.split(';')
    return styleTextList.reduce((acc, cur) => {
      if (!cur.trim()) return acc
      const [key, val] = cur.split(':') as [string, string]
      if (key && val) {
        acc[key.trim()] = val.trim()
      }
      return acc
    }, {}) as CSSProperties
  },

  /**
   * style对象转styleText
   * @param styleObj - CSS属性对象
   */
  styleObjToText(styleObj: CSSProperties = {}): string {
    return Object.keys(styleObj).reduce((acc, cur) => {
      acc += `${cur}:${styleObj[cur]};`
      return acc
    }, '')
  },

  /**
   * 获取dpi
   * @returns {*[]}
   */
  getDpi() {
    const result = []
    if (window.screen['deviceXDPI'] != undefined) {
      result[0] = window.screen['deviceXDPI']
      result[1] = window.screen['deviceYDPI']
    } else {
      const tmpNode = document.createElement('div')
      tmpNode.style.cssText =
        'width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden'
      document.body.appendChild(tmpNode)
      result[0] = parseInt(`${tmpNode.offsetWidth}`)
      result[1] = parseInt(`${tmpNode.offsetHeight}`)
      tmpNode.parentNode.removeChild(tmpNode)
    }
    return result
  },

  /**
   * mm 转成 px，
   * @param mm 单位是毫米
   */
  mmToPx(mm: string | number) {
    const DPI = cssUtil.getDpi()
    if (typeof mm === 'string') mm = parseFloat(mm)
    return +mm * (DPI[0] / 25.4)
  },

  /**
   * px 转成 mm，
   * @param px
   */
  pxToMm(px: string | number) {
    const DPI = cssUtil.getDpi()[0]
    if (typeof px === 'string') px = parseFloat(px)
    return (+px * 25.4) / DPI
  },

  /**
   * 获取纸张尺寸
   * @param {String} type 可选值：A4、A5、A6
   */
  getPaperSize(type: 'A4' | 'A5' | 'A6') {
    type ||= 'A4'

    type TSize = {
      w: number
      h: number
      mt: number // 外边距 上
      mb: number // 外边距 下
      ml: number // 外边距 左
      mr: number // 外边距 右
      pt: number // 页边距 上
      pb: number // 页边距 下
      pl: number // 页边距 左
      pr: number // 页边距 右
      hh: number // 页眉
      fh: number // 页脚
    }

    const sizeConf = {
      A4: {
        w: 210, // 宽
        h: 297, // 高
        mt: 20, // 外边距 上
        mb: 15, // 外边距 下
        ml: 15, // 外边距 左
        mr: 15, // 外边距 右
        pt: 25.4, // 页边距 上
        pb: 25.4, // 页边距 下
        pl: 31.8, // 页边距 左
        pr: 31.8, // 页边距 右
        hh: 6.6, // 页眉
        fh: 14, // 页脚
      },
      A5: {
        w: 148,
        h: 210,
        mt: 20, // 外边距 上
        mb: 15, // 外边距 下
        ml: 15, // 外边距 左
        mr: 15, // 外边距 右
        pt: 20, // 页边距 上
        pb: 15, // 页边距 下
        pl: 15, // 页边距 左
        pr: 15, // 页边距 右
        hh: 6.6, // 页眉
        fh: 14, // 页脚
      },
      A6: {
        w: 105,
        h: 148,
        mt: 20, // 外边距 上
        mb: 15, // 外边距 下
        ml: 15, // 外边距 左
        mr: 15, // 外边距 右
        pt: 20, // 页边距 上
        pb: 15, // 页边距 下
        pl: 15, // 页边距 左
        pr: 15, // 页边距 右
        hh: 6.6, // 页眉
        fh: 14, // 页脚
      },
    } as Record<string, TSize>
    const size = sizeConf[type]
    // 1px= 0.75pt
    return {
      _base: size as unknown as TSize,
      _basePx: Object.entries(size).reduce((pre, [key, value]) => {
        pre[key] = cssUtil.mmToPx(value)
        return pre
      }, {}) as unknown as TSize,
    }
  },
}

console.log('A4', cssUtil.getPaperSize('A4'))
