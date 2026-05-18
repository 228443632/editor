/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 17/01/26 PM3:06
 */
/**
 * 渲染表格分页边框
 */
// @ts-nocheck
export const renderTablePagingBorder = () => {
  function load() {
    // const theads = document.querySelectorAll('thead');
    // theads.forEach((thead) => {
    //   thead.remove()
    // });
    //
    // const tfoots = document.querySelectorAll('tfoot');
    // tfoots.forEach((tfoot) => {
    //   tfoot.remove()
    // });

    // getPaperSize()
    const a4 = getPaperSize('A4');

    const page = {
      // height: 1123,
      // width: 794,
      // pl: 120,
      // pt: 96,

      height: Math.ceil(a4._basePx.h),
      width: Math.ceil(a4._basePx.w),
      pl: Math.ceil(a4._basePx.pl),
      pt: Math.ceil(a4._basePx.pt),

      contentHeight: Math.ceil(a4._basePx.h - a4._basePx.pt * 2),
      contentWidth: Math.ceil(a4._basePx.w - a4._basePx.pl * 2),

      getSafeBottom(pageNum) {
        return page.height - page.pt + (pageNum - 1) * page.height;
      },

      getSafePageByHeight(height) {
        const pageNum = Math.floor((height - (page.height - page.pt)) / page.height + 1);
        return Math.max(pageNum, 1);
      },
    };

    // const header = document.querySelector('.umo-page-node-header')
    // header.remove()

    const tableList = [...new Set(Array.from(document.querySelectorAll('table:not(table table)')))];
    const nestTableList = [...new Set(Array.from(document.querySelectorAll('table table')))];
    console.log('tableList', tableList);

    nestTableList.forEach((table) => {
      table.__isNested = true;
      tableList.push(table);
    });

    // 最底 排在后面
    tableList.sort((a, b) => {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      return aRect.bottom - bRect.bottom;
    });

    // const lastTable = tableList.at(-1)
    // tableList.length = 0
    // tableList[0] = lastTable
    const totalPageObj = {};

    // 最底 排在后面
    tableList.sort((a, b) => {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      return aRect.bottom - bRect.bottom;
    });

    // const lastTable = tableList.at(-1)
    // tableList.length = 0
    // tableList[0] = lastTable
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    tableList.forEach((table) => {
      if (!table.clientHeight) return;

      // 是内嵌的
      let diffHeight = 0;
      let isOverEnd = false; // 是否到底
      let pageNum = 0; // 当前页码

      const rows = Array.from(table.rows);

      const pageDiffHeight = {};

      while (!isOverEnd) {
        pageNum++;

        if (pageNum > 100) {
          break;
        }
        if (isOverEnd) {
          break;
        }
        totalPageObj[pageNum] = true;

        const pageBottom = getPageBottom(pageNum);

        rows.forEach((row, rowIndex) => {
          const trRect = row.getBoundingClientRect();
          const trTop = trRect.top + diffHeight;
          const trBottom = trRect.bottom + diffHeight;

          if (pageBottom > trTop && pageBottom < trBottom && page.contentHeight > trRect.height) {
            // diffHeight += pageBottom - prevTrRect.bottom + (table.__isNested ? -1 : 1);
            pageDiffHeight[pageNum] = pageBottom - trTop + 2;
            diffHeight += +pageDiffHeight[pageNum];
            // console.log('diffHeight', pageNum, diffHeight, pageDiffHeight[pageNum], pageDiffHeight[pageNum - 1])
          }

          if (rowIndex == rows.length - 1) {
            // 最后一个
            if (pageBottom >= trBottom) {
              isOverEnd = true;
            }
          }
        });
      }

      if (diffHeight > 0) {
        /**
         * @type {HTMLTableRowElement}
         */
        const lastRow = rows.at(-1);
        const trTmp = document.createElement('tr');
        trTmp.style.height = `${diffHeight}px`;
        trTmp.style.border = 'none';
        trTmp.style.marginTop = '-1px';
        lastRow.insertAdjacentElement('afterend', trTmp);

        if (!table.__isNested) {
          trTmp.classList.add('tr-no-nested-001');
        }
      }

      // 非嵌套添加
      const tHead = table.tHead;
      if (!table.__isNested && !tHead) {
        const tHead = document.createElement('thead');
        tHead.innerHTML = '<tr style="height: 1px;"></tr>';
        table.insertAdjacentElement('afterbegin', tHead);
      }

      const tfoot = table.tFoot;
      if (!tfoot) {
        const tfoot = document.createElement('tfoot');
        tfoot.innerHTML = `<tr style="height: 2px; margin-top: -2px;"></tr>`;
        table.insertAdjacentElement('beforeend', tfoot);
      }
    });

    // 修复表格被截断fix
    // const compTextDomList = document.querySelectorAll(`[compname="comp-text"]`)
    // compTextDomList.forEach(comp => {
    //   const serverComponentTable = comp.querySelector('server-component > table')
    //   if (serverComponentTable) {
    //     // comp.innerHTML = serverComponentTable.outerHTML
    //     comp.parentNode.replaceChild(serverComponentTable, comp)
    //     const nextElement = serverComponentTable.nextElementSibling
    //     if (nextElement && nextElement.classList.contains('Tiptap-invisible-character')) {
    //       nextElement.remove()
    //     }
    //   }
    // })

    function getPageBottom(pageNum) {
      return pageNum * page.contentHeight + page.pt;
    }
    function getPageTop(pageNum) {
      console.log('page.contentHeight', page.contentHeight);
      return getPageBottom(pageNum) - page.contentHeight;
    }
    // const totalPageNum = Math.max(...Object.keys(totalPageObj).map((pageNum) => +pageNum))

    // 删除所有 tr-no-nested-001
    const trList = document.querySelectorAll('.tr-no-nested-001');
    trList.forEach((tr) => tr.remove());
  }
  load();

  /**
   * 获取纸张尺寸
   * @param {String} type 可选值：A4、A5、A6
   */
  function getPaperSize(type) {
    type ||= 'A4';

    const cssUtil = {
      /**
       * 获取dpi
       * @returns {*[]}
       */
      getDpi() {
        const result = [];
        if (window.screen['deviceXDPI'] != undefined) {
          result[0] = window.screen['deviceXDPI'];
          result[1] = window.screen['deviceYDPI'];
        } else {
          const tmpNode = document.createElement('div');
          tmpNode.style.cssText =
            'width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden';
          document.body.appendChild(tmpNode);
          result[0] = parseInt(`${tmpNode.offsetWidth}`);
          result[1] = parseInt(`${tmpNode.offsetHeight}`);
          tmpNode.parentNode.removeChild(tmpNode);
        }
        return result;
      },

      /**
       * mm 转成 px，
       * @param mm 单位是毫米
       */
      mmToPx(mm) {
        const DPI = cssUtil.getDpi();
        if (typeof mm === 'string') mm = parseFloat(mm);
        return +mm * (DPI[0] / 25.4);
      },

      /**
       * px 转成 mm，
       * @param px
       */
      pxToMm(px) {
        const DPI = cssUtil.getDpi()[0];
        if (typeof px === 'string') px = parseFloat(px);
        return (+px * 25.4) / DPI;
      },
    };

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
        pl: 20, // 页边距 左
        pr: 20, // 页边距 右
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
    };
    const size = sizeConf[type];
    // 1px= 0.75pt
    return {
      _base: size,
      _basePx: Object.entries(size).reduce((pre, [key, value]) => {
        pre[key] = cssUtil.mmToPx(value);
        return pre;
      }, {}),
    };
  }
};



// css

