/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 20/07/25 AM1:23
 */

const DEFAULT_STYLE_CONFIG = {
  /** 加粗*/
  bold: true,
  /** 斜体*/
  italic: true,
  /** 下划线*/
  underline: true,
  /** 删除线*/
  strike: true,
  /** 下标*/
  subscript: true,
  /** 上标*/
  superscript: true,
  /** 对其*/
  align: true,
  /** 字大小*/
  fontSize: true,
  /** 字体*/
  fontFamily: true,
  /** 字颜色*/
  color: true,
  /** 背景颜色 */
  backgroundColor: true,
}

/**
 * 组件参数节点
 */
export const COMP_PARAMS_NAME_MAP = {
  compText: 'compText',
  compTextDrag: 'compTextDrag',
  imageParagraph: 'imageParagraph',
  compInvisibleBlock: 'compInvisibleBlock',
  compTextareaDrag: 'compTextareaDrag',
  compSign: 'compSign',
  compSeal: 'compSeal',
} as const

/**
 * 组件参数节点配置
 */
export const COMP_PARAMS_CONFIG_MAP = {
  compText: {
    name: 'compText',
    ...DEFAULT_STYLE_CONFIG,
    // link: true,
  },
  compTextDrag: {
    name: 'compTextDrag',
    ...DEFAULT_STYLE_CONFIG,
  },
  imageParagraph: {
    name: 'imageParagraph',
    ...DEFAULT_STYLE_CONFIG,
  },
  compInvisibleBlock: {
    name: 'compInvisibleBlock',
    ...DEFAULT_STYLE_CONFIG,
  },
  compTextareaDrag: {
    name: 'compTextareaDrag',
    ...DEFAULT_STYLE_CONFIG,
  },
} as Record<
  keyof typeof COMP_PARAMS_NAME_MAP,
  typeof DEFAULT_STYLE_CONFIG & {
    name: (typeof COMP_PARAMS_NAME_MAP)[keyof typeof COMP_PARAMS_NAME_MAP]
  }
>

/**
 * 悬浮框内容类名
 */
export const FLOAT_REAL_CONTENT_CLASS_NAME = 'float-real-content'

/**
 * 悬浮框内容类名
 */
export const FLOAT_NODE_TYPE_MAP = {
  [COMP_PARAMS_NAME_MAP.compSeal]: 1,
  [COMP_PARAMS_NAME_MAP.compSign]: 1,
}

/**
 * 电子签章样式
 */
export const COMP_SEAL_STYLE = {
  width: 140,
  height: 140,
}

/**
 * 签名样式
 */
export const COMP_SIGN_STYLE = {
  width: 105,
  height: 28,
}

// export type COMP_BOLD_PARAMS = {
//   imageParagraph: 'imageParagraph',
// }
