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
} as Record<
  keyof typeof COMP_PARAMS_NAME_MAP,
  typeof DEFAULT_STYLE_CONFIG & {
    name: (typeof COMP_PARAMS_NAME_MAP)[keyof typeof COMP_PARAMS_NAME_MAP]
  }
>

// export type COMP_BOLD_PARAMS = {
//   imageParagraph: 'imageParagraph',
// }
