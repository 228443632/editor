/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 19/10/25 PM6:55
 */
import type { useVuePdfEmbed } from 'vue-pdf-embed'
import { pageUtils } from '@/views/sign-editor/utils/commons.ts'
import { arrayToObj, uuid } from 'sf-utils2'
import type { IParamsCompItem } from '@/views/sign-editor/types/types.ts'

type PDFDocumentProxy = ReturnType<typeof useVuePdfEmbed>['doc']

type TOptions = {
  dpr?: number

  /** 匹配规则 all 所有 last 最后一个 first 第一个， 默认是最后一个 last*/
  matchRule?: 'all' | 'last' | 'first'

  /** 高亮关键字 偏移高度 默认是4 */
  highlightKeywordOffsetHeight?: number

  /** 缩放因子 */
  scaleFactor: Ref<number>
}

/**
 * 搜索 PDF
 * @param doc
 * @param options
 */
export function useSearchPDF(doc: PDFDocumentProxy, options?: TOptions) {
  const keywordsPosList = ref([]) as Ref<IParamsCompItem[]>

  const dpr = options?.dpr || window.devicePixelRatio

  const _maxPageNum = computed(() => doc.value.numPages)

  const highlightKeywordOffsetHeight =
    options?.highlightKeywordOffsetHeight ?? 0

  /**
   * 缩放因子
   */
  const _scaleFactor = computed(() => unref(options?.scaleFactor) || 1.33)

  /**
   * 关键字
   */
  const _keywordsPosListByKwd = computed(() => {
    return arrayToObj(keywordsPosList.value, 'keywords')
  })

  /** 搜索选项 */
  type TSearchOptions = {
    // /** 是否反转 默认是 */
    // reverse?: boolean
    /** 匹配规则 all 所有 last 最后一个 first 第一个， 默认是最后一个 last*/
    matchRule?: TOptions['matchRule']
  }

  /**
   * 搜索关键字
   * @param keyword
   * @param options
   */
  async function search(keyword: string, options?: TSearchOptions) {
    if (_keywordsPosListByKwd.value[keyword]) console.error('[关键字已存在]')
    if (!_maxPageNum.value || _maxPageNum.value < 1) return
    if (!keyword?.length) return
    const matchRule = options?.matchRule ?? 'last'

    const maxPageNum = doc.value.numPages
    const asyncTaskList = []
    const result = []
    for (let i = 1; i <= maxPageNum; i++) {
      const pageNum = matchRule == 'last' ? maxPageNum - i + 1 : i
      const page = await doc.value.getPage(pageNum)

      if (matchRule == 'last' || matchRule == 'first') {
        // 需要取第一个或者最后一个
        const resultList = await searchKeywordByPage(page, pageNum, keyword, {
          matchRule,
        })
        if (resultList?.length) {
          // resultList.forEach((item) => {
          //   if (matchRule == 'first') item.list = item.list.slice(0, 1)
          //   if (matchRule == 'last') item.list = item.list.slice(-1)
          // })
          console.log('debug05-resultList', resultList)
          result.push(...Array.from(resultList || []))
          break
        }
      } else {
        asyncTaskList.push(
          // eslint-disable-next-line no-async-promise-executor
          new Promise(async (resolve) => {
            const resultList = await searchKeywordByPage(
              page,
              pageNum,
              keyword,
              {
                matchRule,
              },
            )
            result.push(...Array.from(resultList || []))
            resolve(resultList)
          }),
        )
      }
    }
    if (asyncTaskList?.length) {
      await Promise.all(asyncTaskList)
    }
    return result
  }

  /**
   * 搜索关键字
   * @param page
   * @param pageNum
   * @param keyword
   * @param options
   */
  async function searchKeywordByPage(
    page,
    pageNum: number,
    keyword: string,
    options?: {
      matchRule?: TOptions['matchRule']
    },
  ) {
    const matchRule = options?.matchRule ?? 'last'
    const textContent = await page.getTextContent()
    const items = textContent.items || []
    const viewport = page.getViewport({ scale: dpr })
    const pageWidth = viewport.rawDims.pageWidth
    const pageHeight = viewport.rawDims.pageHeight

    const radioScale = pageUtils.a4._basePx.w / pageWidth

    let indexesList = searchIndexes2(items, keyword) || []
    // console.log('indeexes2', indexesList)
    // const posList = indexes2.startEndRange.map(item => {
    //   const target = items[item]
    // })
    if (matchRule == 'first') indexesList = indexesList.slice(0, 1)
    if (matchRule == 'last') indexesList = indexesList.slice(-1)

    const matchList = []
    const result = []

    indexesList.forEach((indexes) => {
      // console.log('indexes', indexes)
      for (let i = indexes.startIndex; i <= indexes.endIndex; i++) {
        const target = items[i]
        let { transform, width, height } = target

        const x = transform[4] // PDF 坐标系 x 坐标
        const y = pageHeight - transform[5] - height // 转换为浏览器坐标系（原点在左上角）

        height = height * unref(_scaleFactor) + highlightKeywordOffsetHeight * 2

        const radioX = x * radioScale
        const radioY = y * radioScale
        const radioWidth = width * radioScale
        const radioHeight = height * radioScale
        const resultItem = {
          key: uuid(),
          get left() {
            return this.x
          },
          get top() {
            return this.y
          },
          get right() {
            return this.left + this.width
          },
          get bottom() {
            return this.top + this.height
          },
          pageNum,
          x: radioX,
          y: radioY,
          width: radioWidth,
          height: radioHeight,
        }
        // const diffCharLen = indexes.endChar - indexes.startChar
        const strLen = target.str.length
        // console.log('diffCharLen', diffCharLen)
        if (indexes.startIndex == i) {
          // 第一个
          let endChar = strLen
          if (indexes.startEndRange?.length == 1) {
            // 只有一个
            endChar = indexes.endChar
          }
          // console.log('debug01', i, endChar - indexes.startChar)
          resultItem.width =
            radioWidth * ((endChar - indexes.startChar) / strLen)
          resultItem.x += radioWidth * (indexes.startChar / strLen)
        } else if (indexes.endIndex == i) {
          // 最后一个
          resultItem.width = radioWidth * ((indexes.endChar + 1) / strLen)
        } else {
          // 中间
        }
        matchList.push(resultItem)
      }

      if (matchList.length) {
        const targetItem = {
          keywords: keyword,
          key: uuid(),
          pageNum,
          offsetTop: matchList[0]?.top,
          offsetLeft: matchList[0]?.left,
          list: matchList,
          radio: radioScale,
        }
        result.push(targetItem)
      }
      // console.log('resultList', keywordsPosList.value)
    })

    keywordsPosList.value.push(...result)

    return result as IParamsCompItem[]

    // textContent.items.forEach((item) => {
    //   const { str, transform, width, height } = item
    //   const x = transform[4] // PDF 坐标系 x 坐标
    //   const y = viewport.height - transform[5] // 转换为浏览器坐标系（原点在左上角）
    //   console.log(
    //     `文本: ${str}, 位置: (${x}, ${y}), 宽: ${width}, 高: ${height}`,
    //   )
    // })
  }

  return {
    /**
     * 查询
     */
    search,
    /**
     * 关键字位置 list
     */
    keywordsPosList,
  }
}

/**
 * 匹配关键字 在段落list中
 * @param array
 * @param keyword
 * @param options
 */
function searchIndexes2(array: Record<string, any>[], keyword: string) {
  // const arrayPure = array.map((item) =>
  //   item.replace(/^\s+/, '').replace(/\s+$/, ''),
  // )
  // const matchRule = options?.matchRule ?? 'last'

  // 如果是最后一个，则需要反转
  // if (matchRule == 'last') {
  //   array = array.reverse()
  //   keyword = keyword.split('').reverse().join('')
  // }

  const arrayPure = array.map((item) => {
    if (item.hasEOL) {
      return item.str.replace(/^\s+/, '').replace(/\s+$/, '')
    }
    return item.str
  })
  const arrayString = arrayPure.join('')

  const keywordsIndexList = [
    ...arrayString.matchAll(new RegExp(keyword, 'g')),
  ].map((item) => item['index'])
  // console.log('keywordsIndexList', keywordsIndexList)

  const result = [] as {
    startIndex: number
    endIndex: number
    startChar: number
    endChar: number
    startEndRange: number[]
  }[]
  keywordsIndexList.forEach((keywordsIndex) => {
    let startIndex: number,
      keywordLen = keyword.length,
      startChar: number,
      endChar: number,
      endIndex: number
    if (~keywordsIndex) {
      keywordsIndex += 1
      for (let i = 0; i < array.length; i++) {
        const item = arrayPure[i]
        keywordsIndex -= item.length
        if (keywordsIndex <= 0) {
          startIndex = i
          startChar = item.length - 1 - Math.abs(keywordsIndex) // 字符开始的位置，当前索引的字符串中
          keywordLen -= item.length - startChar
          if (keywordLen > 0) {
            for (let j = startIndex + 1; j < array.length; j++) {
              const cItem = arrayPure[j]
              keywordLen -= cItem.length
              if (keywordLen <= 0) {
                endIndex = j
                endChar = cItem.length - 1 - Math.abs(keywordLen)
                break
              }
            }
          } else {
            endIndex = startIndex
            endChar = startChar
          }
          break
        }
      }
    }

    if (startIndex == endIndex && startChar == endChar) {
      endChar = startChar + keyword.length
    }
    result.push({
      /**
       * 开始的位置
       */
      startIndex,
      /**
       * 结束
       */
      endIndex,
      /**
       * 开始位置 开头字符位置
       */
      startChar,
      /**
       * 结束位置 结束字符位置
       */
      endChar,
      /**
       * 范围
       */
      startEndRange: getIndexArray(startIndex, endIndex),
    })
  })

  return result

  function getIndexArray(startIndex: number, endIndex: number) {
    const result = []
    for (let i = startIndex; i <= endIndex; i++) {
      result.push(i)
    }
    return result
  }
}
