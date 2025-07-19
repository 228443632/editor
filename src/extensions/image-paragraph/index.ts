import { nodeInputRule, nodePasteRule } from '@tiptap/core'
import Image from '@tiptap/extension-image'
import { type CommandProps, VueNodeViewRenderer } from '@tiptap/vue-3'

import NodeView from './node-view.vue'
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setImageParagraph: {
      setImageParagraph: (options?: any, replace?: any) => ReturnType
    }
  }
}

const NAME = 'imageParagraph'

export default Image.extend({
  atom: true,
  name: NAME,
  addAttributes() {
    return {
      compName: {
        default: NAME,
      },
      vnode: {
        default: true,
      },
      type: {
        default: 'image',
      },
      size: {
        default: null,
      },
      id: {
        default: null,
      },
      src: {
        default: null,
      },
      content: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: 'auto',
      },
      left: {
        default: 0,
      },
      top: {
        default: 0,
      },
      angle: {
        default: null,
      },
      draggable: {
        default: false,
      },
      rotatable: {
        default: false,
      },
      equalProportion: {
        default: true,
      },
      flipX: {
        default: false,
      },
      flipY: {
        default: false,
      },
      uploaded: {
        default: false,
      },
      error: {
        default: false,
      },
      previewType: {
        default: 'image',
      },
    }
  },
  parseHTML() {
    return [{ tag: `img[compname="${NAME}"]` }]
  },
  addNodeView() {
    return VueNodeViewRenderer(NodeView)
  },
  addCommands() {
    return {
      setImageParagraph:
        (
          options?: { src: string; alt?: string; title?: string; id?: string },
          replace?: boolean,
        ) =>
        ({ commands, editor }: CommandProps) => {
          return commands.insertContentAt(0, {
            type: this.name,
            attrs: options,
          })
        },
    }
  },
  addPasteRules() {
    return [
      ...(this.parent?.() ?? []),
      nodePasteRule({
        find: /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)"?)?\)/g,
        type: this.type,
        getAttributes: (match) => {
          const [, alt, src, title] = match
          return { src, alt, title }
        },
      }),
    ]
  },
  addInputRules() {
    return [
      ...(this.parent?.() ?? []),
      nodeInputRule({
        find: /!\[([\S]+)\]\(([^)\s]+)(?:\s+"([\S]+)"?)?\)/g,
        type: this.type,
        getAttributes: (match) => {
          const [, alt, src, title] = match
          return { src, alt, title }
        },
      }),
    ]
  },
})
