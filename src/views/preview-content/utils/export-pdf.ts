/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 06/10/25 PM3:13
 */
import dayjs from 'dayjs'

/**
 * 导出pdf
 * @param pagesDomList
 * @param filename
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
  const pdf = new jsPDF('p', 'mm', 'a4')

  const scale = window.devicePixelRatio

  const { default: modernScreenshot } = await import('modern-screenshot')

  // 2. 循环处理每个页面，单独生成图片并添加到PDF
  for (let i = 0; i < pagesDomList.length; i++) {
    const pageDom = pagesDomList[i]
    // 确保当前页元素可见（避免隐藏元素渲染异常）
    pageDom.style.width = `${a4Width - margin * 2}mm` // 匹配A4宽度

    // 3. 为当前页生成高清图片（单独渲染）
    const dataUrl = await modernScreenshot.domToPng(pageDom, {
      type: 'image/png', // 优先用PNG保证文字清晰度
      quality: 0.95, // 高质量参数（PNG接近无损）
      scale, // 应用设备像素比缩放
      backgroundColor: '#ffffff',
      workerNumber: 2, // 多线程加速渲染
      debug: false, // 生产环境关闭调试
    })

    // 4. 计算当前页尺寸映射（px → mm）
    const contentWidth = pageDom.offsetWidth // 当前页宽度(px)
    const contentHeight = pageDom.offsetHeight // 当前页高度(px)
    const scaledWidth = contentWidth * scale // 缩放后宽度(px)
    const scaleToPdf = (a4Width - margin * 2) / scaledWidth // px转mm系数
    const pageHeightMm = contentHeight * scale * scaleToPdf // 当前页高度(mm)

    // 5. 添加新页面（第一页无需添加）
    if (i > 0) pdf.addPage()

    // 6. 精准添加当前页到PDF（位置居中对齐）
    pdf.addImage(
      dataUrl,
      'PNG', // 明确指定格式
      margin, // x坐标（左对齐，留边距）
      margin, // y坐标（上对齐，留边距）
      a4Width - margin * 2, // 宽度严格匹配A4
      pageHeightMm, // 高度自适应当前页内容
      undefined,
      'FAST', // 快速渲染模式（保证质量的同时提升速度）
    )
  }
  pdf.save(filename || `${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.pdf`)
}
