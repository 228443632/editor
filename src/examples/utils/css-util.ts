/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 24/04/25 PM7:36
 */

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
            cssText += rule.cssText + '\n'
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
    if (process.env.NODE_ENV === 'production') {
      return ''
    }
    const cssRes = await Promise.all([
      cssUtil.getExternalCSS(),
      cssUtil.getAllCSSRules(),
    ])
    return cssRes.join('\n')
  },
}
