/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 06/10/25 PM3:13
 */
import dayjs from 'dayjs'
import { saveAs } from 'file-saver'
import { chunk } from 'sf-utils2'
import { snapdom } from '@zumer/snapdom'

export async function exportPDFPuppeteer(
  pagesDomList: HTMLElement[],
  filename?: string,
) {
  const a4Width = 210 // A4宽度(mm)
  const a4Height = 297 // A4高度(mm)
  const margin = 0 // 页边距(mm)
  const concurrency = 4
  const highScale = Math.max(window.devicePixelRatio || 1, 2) // 至少2倍，推荐4倍

  console.time('开始')

  // 1. 并发生成所有页面的图片
  const imageDoms = await Promise.all(
    chunk(pagesDomList, concurrency).map(async (chunkItem) => {
      return await Promise.all(
        chunkItem.map(async (pageDom) => {
          // 确保当前页元素可见（避免隐藏元素渲染异常）
          pageDom.style.width = `${a4Width - margin * 2}mm` // 匹配A4宽度
          const svg = await snapdom.toSvg(pageDom, {
            dpr: window.devicePixelRatio,
          })
          return svg
        }),
      )
    }),
  ).then((chunkItem) => chunkItem.flat())

  console.timeEnd('开始')

  const doc = document.createElement('html')
  const body = document.createElement('body')
  doc.appendChild(body)
  imageDoms.forEach((dom, index) => {
    // const img = document.createElement('img')
    // img.style.width = `${a4Width}mm`
    // img.style.height = `${a4Height}mm`
    // img.src = imageDataUrl
    // console.log('imageDataUrl', dom)
    body.appendChild(dom)
  })

  // 通过fetch调用远程接口传入html内容并下载
  try {
    const response = await fetch(
      'http://localhost:3000/tools/htmlStringToPdf',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: doc.outerHTML,
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const pdfBlob = await response.blob()
    saveAs(
      pdfBlob,
      filename || `低码合同测试_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.pdf`,
    )
  } catch (error) {
    console.error('PDF导出失败:', error)
    // 如果远程接口调用失败，回退到本地HTML保存方式
    const blob = new Blob([doc.outerHTML], {
      type: 'text/html;charset=utf-8',
    })
    saveAs(blob, `低码合同测试.html`)
  }
  // const blob = new Blob([doc.outerHTML], {
  //   type: 'text/html;charset=utf-8',
  // })
  // saveAs(blob, `低码合同测试.html`)

  // const body = document.createElement('body')

  // const doc = document.createElement('html')
  // const head = document.createElement('head')
  // doc.appendChild(head)
  // doc.appendChild(body)

  // const parentElement = pagesDomList[0]?.parentElement as HTMLElement
  // body.appendChild(parentElement.cloneNode(true))

  //   const styles = document.querySelectorAll('style')
  // // const styleSheets = document.styleSheets
  // styles.forEach(style => {
  //   const clone = style.cloneNode(true)
  //   head.appendChild(clone)
  // })

  // console.log('doc', doc.outerHTML)

  // const blob = new Blob([doc.outerHTML], {
  //   type: 'text/html;charset=utf-8',
  // })
  // saveAs(blob, `低码合同测试.html`)
}

/**
 * 导出pdf
 * @param pagesDomList
 * @param filename
 * @param concurrency 控制并发数量，默认为CPU核心数
 */
export async function exportPDFWorker(
  pagesDomList: HTMLElement[],
  filename?: string,
) {
  if (!pagesDomList?.length) throw new Error('未找到导出内容')

  const { jsPDF } = await import('jspdf')

  // 配置A4尺寸参数
  const a4Width = 210 // A4宽度(mm)
  const a4Height = 297 // A4高度(mm)
  const margin = 0 // 页边距(mm)
  const pdf = new jsPDF({
    compress: true,
    orientation: 'p',
    unit: 'mm', // 与图片单位一致，减少尺寸转换计算
    format: 'A4',
  })
  console.time('开始')
  // 2. 循环处理每个页面，单独生成图片并添加到PDF
  for (let i = 0; i < pagesDomList.length; i++) {
    const pageDom = pagesDomList[i]
    // 确保当前页元素可见（避免隐藏元素渲染异常）
    pageDom.style.width = `${a4Width - margin * 2}mm` // 匹配A4宽度

    // 3. 为当前页生成高清图片（单独渲染）
    const jpg = await snapdom.toJpg(pageDom, {
      dpr: window.devicePixelRatio * 2,
      debug: true,
      fast: true,
      quality: 0.8,
    })

    // 4. 计算当前页尺寸映射（px → mm）
    // const contentWidth = pageDom.offsetWidth // 当前页宽度(px)
    // const contentHeight = pageDom.offsetHeight // 当前页高度(px)
    // const scaledWidth = contentWidth * scale // 缩放后宽度(px)
    // const scaleToPdf = (a4Width - margin * 2) / scaledWidth // px转mm系数
    // const pageHeightMm = contentHeight * scale * scaleToPdf // 当前页高度(mm)

    // 5. 添加新页面（第一页无需添加）
    if (i > 0) pdf.addPage()

    // 6. 精准添加当前页到PDF（位置居中对齐）
    pdf.addImage(
      jpg,
      'PNG', // 明确指定格式
      0, // x坐标（左对齐，留边距）
      0, // y坐标（上对齐，留边距）
      a4Width, // 宽度严格匹配A4
      a4Height, // 高度自适应当前页内容
      undefined,
      'FAST', // 快速渲染模式（保证质量的同时提升速度）
    )
  }
  pdf.save(filename || `${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.pdf`)
}

/**
 * 导出pdf (使用pdf-lib实现)
 * @param pagesDomList 需要导出的DOM元素列表
 * @param filename 导出文件名
 */
// export async function exportPDFWorker1(
//   pagesDomList: HTMLElement[],
//   filename?: string,
// ) {
//   if (!pagesDomList?.length) throw new Error('未找到导出内容')
//
//   // 导入现代截图工具
//   const { default: modernScreenshot } = await import('modern-screenshot')
//
//   // PDF配置 - A4尺寸(pt单位，1pt = 1/72英寸)
//   const a4Width = 595.28 // A4宽度(pt)
//   const a4Height = 841.89 // A4高度(pt)
//   const margin = 0 // 页边距(pt)
//
//   // 创建新的PDF文档
//   const pdfDoc = await PDFDocument.create()
//
//   // 设备像素比，确保高清渲染
//   const scale = Math.max(window.devicePixelRatio || 1, 2) // 最低2倍缩放保证清晰度
//
//   // 循环处理每个页面DOM
//   for (const pageDom of pagesDomList) {
//     // 调整DOM元素尺寸以匹配PDF页面
//     pageDom.style.width = `${(a4Width - margin * 2) / 2.83}mm` // pt转mm (1pt ≈ 0.3528mm)
//     pageDom.style.display = 'block' // 确保元素可见
//
//     console.log('modernScreenshot', modernScreenshot)
//     // 生成DOM元素的PNG截图
//     const dataUrl = await modernScreenshot.domToPng(pageDom, {
//       type: 'image/png',
//       quality: 1,
//       scale,
//       workerNumber: navigator.hardwareConcurrency || 2,
//       backgroundColor: '#ffffff',
//       debug: false,
//     })
//
//     // 将dataURL转换为pdf-lib可处理的Uint8Array
//     const response = await fetch(dataUrl)
//     const imageBytes = await response.arrayBuffer()
//     const pngImage = await pdfDoc.embedPng(new Uint8Array(imageBytes))
//
//     // 获取图片原始尺寸
//     const imageDims = pngImage.scale(1)
//
//     // 计算缩放比例以适应A4页面
//     const scaleX = (a4Width - margin * 2) / imageDims.width
//     const scaleY = (a4Height - margin * 2) / imageDims.height
//     const scaleRatio = Math.min(scaleX, scaleY)
//
//     // 计算居中位置
//     const x = margin + (a4Width - margin * 2 - imageDims.width * scaleRatio) / 2
//     const y =
//       margin + (a4Height - margin * 2 - imageDims.height * scaleRatio) / 2
//
//     // 添加新页面并绘制图片
//     const page = pdfDoc.addPage([a4Width, a4Height])
//     page.drawImage(pngImage, {
//       x,
//       y,
//       width: imageDims.width * scaleRatio,
//       height: imageDims.height * scaleRatio,
//     })
//   }
//
//   // 生成PDF字节数据
//   const pdfBytes = await pdfDoc.save()
//
//   // 创建下载链接并触发下载
//   const blob = new Blob([pdfBytes], { type: 'application/pdf' })
//   const url = URL.createObjectURL(blob)
//   const a = document.createElement('a')
//   a.href = url
//   a.download = filename || `${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.pdf`
//   document.body.appendChild(a)
//   a.click()
//
//   // 清理资源
//   setTimeout(() => {
//     document.body.removeChild(a)
//     URL.revokeObjectURL(url)
//   }, 100)
// }
