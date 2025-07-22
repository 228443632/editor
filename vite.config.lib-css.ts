/**
 * @Description: 打包配置文件
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 16/05/25 AM10:17
 */
/* stylelint-disable */
import Vue from '@vitejs/plugin-vue'
import ReactivityTransform from '@vue-macros/reactivity-transform/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import { defineConfig } from 'vite'
// import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import tsConfigPaths from 'vite-tsconfig-paths'
import UnoCSS from 'unocss/vite'
import pkg from './package.json'
import copyright from './src/utils/copyright'
import fs from 'node:fs'
import path from 'node:path'
// import AutoImport from 'unplugin-auto-import/vite'
// import { TDesignResolver } from 'unplugin-vue-components/resolvers'
// import Components from 'unplugin-vue-components/vite'

export default defineConfig(() => {
  const vuePlugins = {
    VueMacros: VueMacros({
      plugins: {
        vue: Vue(),
      },
    }),
    // AutoImport: AutoImport({
    //   dirs: ['./src/composables'],
    //   imports: ['vue', '@vueuse/core'],
    //   resolvers: [TDesignResolver({ library: 'vue-next', esm: true })],
    //   dts: './types/imports.d.ts',
    // }),
    // Components: Components({
    //   directoryAsNamespace: true,
    //   dirs: ['./src/components'],
    //   resolvers: [TDesignResolver({ library: 'vue-next', esm: true })],
    //   dts: './types/components.d.ts',
    // }),
    // SvgIcons: createSvgIconsPlugin({
    //   iconDirs: [`${process.cwd()}/src/assets/icons`],
    //   symbolId: 'umo-icon-[name]',
    //   customDomId: 'umo-icons',
    // }),
  }

  return {
    base: '/',
    plugins: [
      afterEmitPlugin(),
      tsConfigPaths(),
      ReactivityTransform(),
      UnoCSS(),
      ...Object.values(vuePlugins),
    ],
    css: {
      devSourcemap: false,
      preprocessorOptions: {
        less: {
          modifyVars: { '@prefix': 'umo' },
          javascriptEnabled: true,
        },
      },
    },
    build: {
      lib: {
        entry: `${process.cwd()}/src/umo-editor-pure.ts`,
        name: pkg.name,
        fileName: 'umo-editor-pure',
      },
      outDir: 'src/examples/style',
      copyPublicDir: false,
      minify: 'esbuild' as const,
      cssMinify: true,
      rollupOptions: {
        output: [
          {
            banner: copyright,
            intro: `import './umo-editor-pure.css'`,
            format: 'es' as const,
            assetFileNames: 'umo-editor-pure.css', // 固定输出文件名
          },
        ],
        external: [
          'vue',
          ...Object.keys(pkg.dependencies ?? {}),
          /^@vueuse\/.*/,
          /^sf-utils2\/.*/,
          /^@tiptap\/.*/,
          /^nzh\/.*/,
        ],
        onwarn(warning: any, warn: (warning: any) => void) {
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
          warn(warning)
        },
      },
    },
    resolve: {
      alias: {
        '@': `${process.cwd()}/src`,
        '@root/': `${process.cwd()}/`,
      },
    },
  }
})

function afterEmitPlugin() {
  return {
    name: 'vite-plugin-after-emit-delete-assets',

    writeBundle(options, bundle) {
      console.log('文件已写入磁盘，路径：', options.dir || options.file)
      console.log('写入的文件列表：', Object.keys(bundle))
      fs.unlinkSync(path.join(options.dir, 'umo-editor-pure.js'))
    },
  }
}
