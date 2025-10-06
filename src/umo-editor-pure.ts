/**
 * @Description: 生成css 纯净点的
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 16/05/25 PM5:01
 */

// 入口
import '@/components/index'
import '@/assets/styles/prosemirror.less'

// 为了方便编译
import '@/components/container/page.vue'
// import '@/components/container/print.vue'
import '@/components/editor/index.vue'
import '@/components/menus/button.vue'

import.meta.glob('@/views/doc-editor/extensions/**/*.vue', { eager: true })
import.meta.glob('@/views/doc-editor/extensions/*.vue', { eager: true })
import.meta.glob('@/composables/**/*.vue', { eager: true })
import.meta.glob('@/composables/*.vue', { eager: true })

export {
  // BackTop,
  Button,
  Checkbox,
  // ColorPickerPanel,
  ConfigProvider,
  DatePickerPanel,
  // Dialog,
  Drawer,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  ImageViewer,
  Form,
  FormItem,
  Input,
  InputNumber,
  // Loading,
  Option,
  OptionGroup,
  // Popup,
  Radio,
  RadioButton,
  RadioGroup,
  Select,
  Space,
  Table,
  Textarea,
  Slider,
  Tooltip,
  // Tree,
  // Watermark,
} from 'tdesign-vue-next/esm/index'
