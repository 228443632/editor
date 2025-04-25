/**
 * @Description: unocss 配置
 * @Author bianpengfei
 * @create 2025/3/30 11:55
 */
// uno.config.ts
import {
  defineConfig,
  presetUno,
  // presetAttributify,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

// import { PACKAGES_PATH } from '@internal/scripts/utils'

// @see https://unocss.dev/presets/legacy-compat
import { presetLegacyCompat } from '@unocss/preset-legacy-compat'

export default defineConfig({
  presets: [
    presetLegacyCompat(),
    presetUno(),
    // 支持css class属性化
    // presetAttributify(),
  ],
  content: {
    pipeline: {
      include: [
        // the default
        /\.(vue|[jt]sx|html)($|\?)/,
        'src/**/*.{jsx,vue,tsx}',
        // `${PACKAGES_PATH}/base/**/*.{jsx,vue,tsx}`,
        // `${PACKAGES_PATH}/hooks/**/*.{jsx,vue,tsx}`,
        // `${PACKAGES_PATH}/utils/**/*.{jsx,vue,tsx}`,
        // `${PACKAGES_PATH}/svg/**/*.{jsx,vue,tsx}`
      ],
      // exclude files
      // exclude: ['node_modules']
    },
  },
  /**
   * 自定义快捷语句
   * @see https://github.com/unocss/unocss#shortcuts
   */
  shortcuts: [],
  transformers: [
    // 启用 @apply 功能
    transformerDirectives({
      enforce: 'pre',
    }),
    // 启用 () 分组功能
    // 支持css class组合，eg: `<div class="hover:(bg-gray-400 font-medium) font-(light mono)">测试 unocss</div>`
    transformerVariantGroup({}),
  ],
  theme: {
    colors: {
      // 个综服主色
      primary: {
        50: '#E9ECFA',
        100: '#CAD1F3',
        200: '#A0ADEA',
        300: '#7688E1',
        400: '#4C64D8',
        500: '#2D49D1',
        DEFAULT: '#2D49D1',
        600: '#2842BC',
        700: '#22379D',
      },
      // 中性色
      gray: {
        50: '#F9F9F9',
        100: '#F2F3F5',
        200: '#E5E5E5',
        300: '#D9D9D9',
        400: '#BFBFBF',
        500: '#999999',
        DEFAULT: '#999999',
        600: '#666666',
        700: '#333333',
      },
      // 蓝色
      blue: {
        50: '#EAF1FC',
        100: '#CBDCF9',
        200: '#A2C0F4',
        300: '#78A4F0',
        400: '#4F89EB',
        500: '#3074E8',
        DEFAULT: '#3074E8',
        600: '#2B68D0',
        700: '#2457AE',
      },
      // 绿色
      green: {
        50: '#E5F6F6',
        100: '#BFE9E9',
        200: '#8CD7D8',
        300: '#59C6C7',
        400: '#26B4B6',
        500: '#00A7A9',
        DEFAULT: '#00A7A9',
        600: '#009698',
        700: '#007D7F',
      },
      // 橙色
      orange: {
        50: '#FDF1E5',
        100: '#FBDDC0',
        200: '#F8C28E',
        300: '#F5A65C',
        400: '#F28B29',
        500: '#F07704',
        DEFAULT: '#F07704',
        600: '#D86B04',
        700: '#B45903',
      },
      // 红色
      red: {
        50: '#FBE5E9',
        100: '#F7C0C9',
        200: '#F18E9E',
        300: '#EB5C72',
        400: '#E42947',
        500: '#E00427',
        DEFAULT: '#E00427',
        600: '#C90423',
        700: '#A8031D',
      },
      // 青色
      cyan: {
        50: '#E9F5FB',
        100: '#C9E8F7',
        200: '#9ED6F0',
        300: '#74C4E9',
        400: '#49B1E3',
        500: '#29A4DE',
        DEFAULT: '#29A4DE',
        600: '#2593C7',
        700: '#1F7BA6',
      },
      // 紫色
      purple: {
        50: '#F2ECFA',
        100: '#E0D0F3',
        200: '#C8AAEA',
        300: '#AF85E0',
        400: '#975FD7',
        500: '#8543D0',
        DEFAULT: '#8543D0',
        600: '#773CBB',
        700: '#64329C',
      },
      // 黄色
      yellow: {
        50: '#FDF7E8',
        100: '#FBEBC7',
        200: '#F7DB9A',
        300: '#F4CB6C',
        400: '#F0BC40',
        500: '#EEB01E',
        DEFAULT: '#EEB01E',
        600: '#D69E1B',
        700: '#B28416',
      },
      // 粉色
      pink: {
        50: '#FBEBF3',
        100: '#F5CFE3',
        200: '#EEA8CC',
        300: '#E681B5',
        400: '#DE5B9F',
        500: '#D93E8E',
        DEFAULT: '#D93E8E',
        600: '#C3387F',
        700: '#A32E6A',
      },
      // 成功色
      success: '#00A7A9',
      // 错误色
      error: '#E00427',
      // 警告色
      warning: '#F07704',
      danger: '#F07704',
      // 信息色
      info: '#3074E8',

      text: {
        primary: '#333333',
        secondary: '#666666',
        tertiary: '#999999',
      },
      // 禁用色
      disabled: '#BFBFBF',
      // 提示色
      placeholder: '#999999',
      // 边框色
      border: '#D9D9D9',
      // 分割线色
      divider: '#E5E5E5',
      // 背景色
      background: '#F3F6FA',

      high: '#333', // 文字强调色
      mid: '#666', // 文字中强调色
      low: '#999', // 文字低强调色

      black: '#000000',
      transparent: 'transparent',
    },
    animationDuration: {
      300: '300ms',
      500: '500ms',
      1000: '1000ms',
      2000: '2000ms',
      3000: '3000ms',
    },
    height: {
      page: 'var(--default-layout-page-view-min-height)',
    },
    minHeight: {
      page: 'var(--default-layout-page-view-min-height)',
    },
    fontFamily: {
      'din-alternate': [
        'DIN Alternate',
        'PingFang SC',
        'Microsoft YaHei',
        'sans-serif',
      ],
    },
  },
  rules: [
    [
      'p-safe',
      {
        padding:
          'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
      },
    ],
    ['pt-safe', { 'padding-top': 'env(safe-area-inset-top)' }],
    ['pb-safe', { 'padding-bottom': 'env(safe-area-inset-bottom)' }],
  ],
})
