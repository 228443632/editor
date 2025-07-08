/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 06/07/25 AM9:15
 */
import type { Editor } from '@tiptap/core'

class TiptapHelperBase {
  /** Editor 实例 */
  editor: Editor

  /** Editor 状态 */
  state: Editor['state']

  /** Editor view*/
  view: Editor['view']
  constructor(editor: Editor) {
    this.editor = editor
  }

  get tr() {
    return this.editor.state.tr
  }

  get ranges() {
    return this.editor.state.selection.ranges
  }

  get selection(): Editor['state']['selection'] {
    return this.editor.state.selection
  }
}

/**
 * tiptap helper
 */
export class TiptapHelper extends TiptapHelperBase {
  constructor(editor: Editor) {
    super(editor)
  }
}
