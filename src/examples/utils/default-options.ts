import { defaultDict } from './default-dict'

/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 21/04/25 AM9:44
 */
export const defaultOptions = {
  /** 编辑器Key，用于区分不同的编辑器实例。 */
  editorKey: 'default',
  /** 显示语言，默认为中文。v2.0.0 新增 */
  locale: 'zh-CN',
  /** 主题设置，默认为浅色主题。v2.1.0 新增 */
  theme: 'light',
  /** 编辑器高度。 */
  height: '100%',
  /** 全屏时容器的 z-index，用于防止被其他元素遮挡，例如在弹出层中使用。v6.0.0 新增 */
  fullscreenZIndex: 2 << 12,
  /** 字典配置，详见字典配置。 */
  dicts: defaultDict,
  /** 工具栏配置，详见工具栏配置。 */
  toolbar: {
    defaultMode: 'ribbon',
    menus: ['base', 'insert', 'table', 'tools', 'page', 'export'],
    disableMenuItems: [],
    importWord: {
      enabled: true,
      options: {},
      useCustomMethod: false,
      // v6.0.0 调整
      async onCustomImportMethod() {},
    },
  },
  /** 页面配置，详见页面配置。 */
  page: {
    defaultMargin: {
      left: 3.18,
      right: 3.18,
      top: 2.54,
      bottom: 2.54,
    },
    defaultOrientation: 'portrait',
    defaultBackground: '#fff',
    showBreakMarks: true,
    showBookmark: true,
    showToc: true,
    showRightSlot: false, // 是否展示右侧
    tocTabsOptions: [], // toc选项
    watermark: {
      type: 'compact',
      alpha: 0.2,
      fontColor: '#000',
      fontSize: 16,
      fontFamily: 'SimSun',
      fontWeight: 'normal',
      text: '',
    },
  },
  /** 文档配置，详见文档配置。 */
  document: {
    title: '',
    content: '',
    placeholder: {
      en_US: 'Please enter the document content...',
      zh_CN: '请输入文档内容...',
      ru_RU: 'Пожалуйста, введите содержимое документа...',
    },
    enableSpellcheck: true,
    enableMarkdown: true,
    enableBubbleMenu: true,
    enableBlockMenu: true,
    readOnly: false,
    autofocus: true,
    characterLimit: -1,
    typographyRules: {},
    // https://prosemirror.net/docs/ref/#view.EditorProps
    editorProps: {},
    // https://prosemirror.net/docs/ref/#model.ParseOptions
    parseOptions: {
      preserveWhitespace: 'full',
    },
    autoSave: {
      enabled: true,
      interval: 300000,
    },
  },
  /** AI 文档助手配置，详见AI 文档助手。v3.0.0 新增 */
  ai: {},
}
