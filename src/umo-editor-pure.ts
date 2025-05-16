/**
 * @Description: 生成css 纯净点的
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 16/05/25 PM5:01
 */

// 入口
import '@/components/index'

// 为了方便编译
import '@/components/container/page.vue'
import '@/components/container/print.vue'
import '@/components/editor/index.vue'

import.meta.glob('@/examples/extensions/**/*.vue', { eager: true })
import.meta.glob('@/examples/extensions/*.vue', { eager: true })
import.meta.glob('@/composables/**/*.vue', { eager: true })
import.meta.glob('@/composables/*.vue', { eager: true })

export {
  BackTop,
  Button,
  ConfigProvider,
  DatePickerPanel,
  Dialog,
  Dropdown,
  ImageViewer,
  Popup,
  Select,
  Tooltip,
  Tree,
  Watermark,
} from 'tdesign-vue-next'
