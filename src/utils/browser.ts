const nav = typeof navigator !== 'undefined' ? navigator : null
const doc = typeof document !== 'undefined' ? document : null
export const agent = nav?.userAgent ?? ''

export const ie_edge = /Edg\/(\d+)/.exec(agent)
export const ie_upto10 = /MSIE \d/.exec(agent)
export const ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(agent)

export const ie = !!(ie_upto10 ?? ie_11up ?? ie_edge)
export const ie_version = ie_upto10
  ? Reflect.get(document, 'documentMode')
  : ie_11up
    ? +ie_11up[1]
    : ie_edge
      ? +ie_edge[1]
      : 0
export const gecko = !ie && /gecko\/(\d+)/i.test(agent)
export const gecko_version =
  gecko && +(/Firefox\/(\d+)/.exec(agent) ?? [0, 0])[1]

export const chrome = Boolean(!ie && /Chrome\/(\d+)/.test(agent))
export const chrome_version: number = chrome
  ? Number.parseInt(/Chrome\/(\d+)/.exec(agent)?.[1] ?? '0', 10)
  : 0
export const safari = !ie && !!nav && nav.vendor.includes('Apple Computer')
// Is true for both iOS and iPadOS for convenience
export const ios =
  safari && (/Mobile\/\w+/.test(agent) || (!!nav && nav.maxTouchPoints > 2))
export const mac = ios || (nav ? nav.platform.includes('Mac') : false)
export const windows = nav ? nav.platform.includes('Win') : false
export const android = /Android \d/.test(agent)
export const webkit =
  !!doc && 'webkitFontSmoothing' in doc.documentElement.style
export const webkit_version = webkit
  ? +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) ?? [0, 0])[1]
  : 0

/**
 * Dom表格最大行
 * @unfile
 */
function _getTableMaxRows(table: HTMLTableElement) {
  const rows = table.rows
  let maxLen = 1
  for (let i = 0, row; (row = rows[i]); i++) {
    let currentMax = 1
    for (let j = 0, cj; (cj = row.cells[j++]); ) {
      currentMax = Math.max(cj.rowSpan || 1, currentMax)
    }
    maxLen = Math.max(currentMax + i, maxLen)
  }
  return maxLen
}

/**
 * Dom表格最大列
 * @unfile
 * @module BSE.domUtils
 */
function _getTableMaxCols(table: HTMLTableElement) {
  const rows = table.rows,
    cellRows = {}
  let maxLen = 0
  for (let i = 0, row; (row = rows[i]); i++) {
    let cellsNum = 0
    for (let j = 0, cj; (cj = row.cells[j++]); ) {
      cellsNum += cj.colSpan || 1
      if (cj.rowSpan && cj.rowSpan > 1) {
        for (let k = 1; k < cj.rowSpan; k++) {
          if (!cellRows[`row_${i + k}`]) {
            cellRows[`row_${i + k}`] = cj.colSpan || 1
          } else {
            cellRows[`row_${i + k}`]++
          }
        }
      }
    }
    cellsNum += cellRows[`row_${i}`] || 0
    maxLen = Math.max(cellsNum, maxLen)
  }
  return maxLen
}

/**
 * 获取当前所处的位置
 */
function getTableIndexList(table: HTMLTableElement) {
  const maxRow = _getTableMaxRows(table),
    maxCol = _getTableMaxCols(table),
    tableIndex = [],
    tableRows = table.rows
  let insRow = maxRow - tableRows.length
  while (insRow--) {
    table.insertRow(tableRows.length)
  }
  for (let rowInx = 0; rowInx < maxRow; rowInx++) {
    tableIndex[rowInx] = new Array(maxCol)
  }
  for (let rowIndex = 0, row; (row = table.rows[rowIndex]); rowIndex++) {
    for (let cellIndex = 0, cell; (cell = row.cells[cellIndex]); cellIndex++) {
      cell.rowSpan > maxRow && (cell.rowSpan = maxRow) // rowSpan不能超过最大行
      const rowSpan = cell.rowSpan,
        colSpan = cell.colSpan
      let curRow = rowSpan,
        colIndex = cellIndex
      while (tableIndex[rowIndex][colIndex]) colIndex++ // 当前索引有值查找下一列
      while (curRow) {
        curRow--
        let curCol = colSpan
        while (curCol) {
          curCol--
          // while (tableIndex[rowIndex][colIndex + curCol]) colIndex++ // 当前索引有值查找下一列
          tableIndex[rowIndex + curRow][colIndex + curCol] = {
            rowIndex,
            cellIndex,
            colIndex,
            rowSpan,
            colSpan,
          }
        }
      }
    }
  }
  return tableIndex
}

export type TTableIndexListItem = {
  /** 当前列dom对象 */
  trEle: HTMLTableRowElement
  /** 对应的td dom对象 */
  tdEle: HTMLTableColElement
  /** 是否属于当前行 */
  isRowPart: boolean
  /** 是否属于当前列 */
  isColPart: boolean
  rSpan: number
  cSpan: number
  /** 行最大 */
  rMax: number
  /** 行最小 */
  rMin: number
  /** 列最大 */
  cMin: number
  /** 列最小 */
  cMax: number
  /** 当前列索引，真实在row中的td序号 */
  cIndex: number
  /** 列索引*/
  index: number
}

/**
 * 对getTableIndexList 进行二次封装
 * @param tableEle
 */
export function getTableIndexListPro(tableEle: HTMLTableElement) {
  const list = getTableIndexList(tableEle)
  const result = [] as TTableIndexListItem[][]
  for (let i = 0; i < list.length; i++) {
    result[i] = []
    for (let j = 0; j < list[i].length; j++) {
      const item = list[i][j]
      if (item) {
        item.rSpan = +item.rowSpan
        item.cSpan = +item.colSpan
        item.rMin = item.rowIndex // 行最小
        item.rMax = item.rowIndex + item.rowSpan - 1 // 行最大
        item.cMin = item.colIndex // 列最小
        item.cMax = item.colIndex + item.colSpan - 1 // 列最大
        item.rIndex = item.rowIndex // 当前行索引
        item.cIndex = item.cellIndex // 当前列索引，真实在row中的td序号
        item.isRowPart = i == item.rowIndex // 是否属于当前行
        item.isColPart = j == item.colIndex // 是否属于当前列
        item.trEle = tableEle.rows[item.rIndex] // 当前列dom对象
        item.tdEle = item.trEle.cells[item.cIndex] // 对应的td dom对象
        item.index = j // 索引
      }
      result[i].push(item || {})
    }
  }
  return result
}
