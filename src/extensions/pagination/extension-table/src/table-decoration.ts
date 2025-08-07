import { Plugin, PluginKey } from '@tiptap/pm/state'
import { DecorationSet } from 'prosemirror-view'

const pluginKey = new PluginKey<string>('tableDecoration')
export const tableDecorationPluginKey = (
  pluginKey as unknown as { key: string }
).key

/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 05/08/25 PM2:21
 */
export const tableDecorationPlugin = new Plugin({
  key: pluginKey,
  state: {
    init: () => DecorationSet.empty,
    apply(tr, prevDecos) {
      const meta = tr.getMeta(tableDecorationPluginKey)
      if (meta?.action === 'add') return meta.decos // 添加新装饰器
      if (meta?.action === 'remove') return DecorationSet.empty // 移除装饰器
      return prevDecos.map(tr.mapping, tr.doc) // 文档变更时自动重定位
    },
  },
  props: {
    decorations(state) {
      return this.getState(state) // 将装饰器注入视图
    },
  },
})
