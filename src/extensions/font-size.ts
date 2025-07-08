import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setFontSize: {
      setFontSize: (fontSize: any) => ReturnType
    }
    unsetFontSize: {
      unsetFontSize: () => ReturnType
    }
  }
}
export interface FontSizeOption {
  types: string[]
  defaultFontSize: string
}
export default Extension.create<FontSizeOption>({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
      defaultFontSize: '14px',
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: this.options.defaultFontSize,
            parseHTML: (element) =>
              element.style.fontSize || this.options.defaultFontSize,
            renderHTML: (attributes) => {
              if (attributes.fontSize === this.options.defaultFontSize) {
                return {}
              }
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain, editor }) => {
          const chainResult = chain().focus().setMark('textStyle', { fontSize })
          const { from, to } = editor.state.selection
          editor.state.doc.nodesBetween(from, to, (node) => {
            if (node.type.name === 'compText') {
              chainResult.updateAttributes('compText', {
                cssText: {
                  ...node.attrs.cssText,
                  fontSize,
                },
              })
            }
          })
          return chainResult.run()
        },
      unsetFontSize:
        () =>
        ({ chain, editor }) => {
          const chainResult = chain()
            .focus()
            .setMark('textStyle', { fontSize: null })
          const { from, to } = editor.state.selection
          editor.state.doc.nodesBetween(from, to, (node) => {
            if (node.type.name === 'compText') {
              chainResult.updateAttributes('compText', {
                cssText: {
                  ...node.attrs.cssText,
                  fontSize: null,
                },
              })
            }
          })
          return chainResult.removeEmptyTextStyle().run()
        },
    }
  },
})
