import Vue from '@vitejs/plugin-vue'
import ReactivityTransform from '@vue-macros/reactivity-transform/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { TDesignResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import { defineConfig } from 'vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import tsConfigPaths from 'vite-tsconfig-paths'
import UnoCSS from 'unocss/vite'
import pkg from './package.json'
import copyright from './src/utils/copyright'
import path from 'node:path'
import vueJsx from '@vitejs/plugin-vue-jsx'
// import { visualizer } from 'rollup-plugin-visualizer'
import usePluginImport from 'vite-plugin-importer'

const IS_PRO = process.env.NODE_ENV === 'production'

export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib'

  // Plugin configurations
  const vuePlugins = {
    VueMacros: VueMacros({
      plugins: {
        vue: Vue(),
      },
    }),
    AutoImport: AutoImport({
      dirs: ['./src/composables'],
      imports: ['vue', '@vueuse/core'],
      resolvers: [TDesignResolver({ library: 'vue-next', esm: true })],
      dts: './types/imports.d.ts',
    }),
    Components: Components({
      directoryAsNamespace: true,
      dirs: ['./src/components'],
      resolvers: [TDesignResolver({ library: 'vue-next', esm: true })],
      dts: './types/components.d.ts',
    }),
    SvgIcons: createSvgIconsPlugin({
      iconDirs: [`${process.cwd()}/src/assets/icons`],
      symbolId: 'umo-icon-[name]',
      customDomId: 'umo-icons',
    }),
  }

  // Build configuration
  const buildConfig = {
    lib: {
      entry: `${process.cwd()}/src/components/index.ts`,
      name: pkg.name,
      fileName: 'umo-editor',
    },
    outDir: 'dist',
    copyPublicDir: false,
    minify: 'esbuild' as const,
    cssMinify: true,
    rollupOptions: {
      output: [
        {
          banner: copyright,
          intro: `import './umo-editor.css'`,
          format: 'es' as const,
          assetFileNames: () => 'umo-editor.css',
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
  }

  const cssConfig = {
    devSourcemap: !IS_PRO,
    preprocessorOptions: {
      less: {
        // additionalData: `@import "${path.join(__dirname, 'src/@shared/style/app/vars.less')};`,
        modifyVars: {
          // hack: `true; @import (reference) "${path.join(__dirname, 'src/@shared/style/app/vars.less')}";
          //              @import (reference) "${path.join(__dirname, 'src/@shared/style/app/mixin.less')}";
          //              @import (reference) "${path.join(__dirname, 'src/@shared/style/app/mixin.less')}";`,
          '@prefix': 'umo',
        },
        javascriptEnabled: true,
      },
      // scss: {
      //   additionalData:
      //     '@use "src/@shared/style/element-plus/index.scss" as *;',
      //   warnRuleAsWarning: false,
      // },
    },
  }

  return {
    base: '/lowcode-tp-editor/',
    optimizeDeps: {
      include: [
        // '@shared/base/element-plus-enhancer',
        // '@shared/base/element-plus-enhancer/el-button', // 显式包含子目录
        // '@shared/base/element-plus-enhancer/el-message'
        // /@shared\/base/,       // 处理 @shared/utils 模块
      ],
    },
    plugins: isLib
      ? [
          tsConfigPaths(),
          ReactivityTransform(),
          UnoCSS(),
          ...Object.values(vuePlugins),
        ]
      : [
          // tsConfigPaths(),
          ReactivityTransform(),
          UnoCSS(),
          ...Object.values(vuePlugins),
          vueJsx(),
          // visualizer({
          //   filename: './node_modules/.cache/visualizer/stats.html',
          //   open: true,
          //   gzipSize: true,
          //   brotliSize: true,
          // }),
          usePluginImport({
            // 配置 UI 库的按需导入规则
            libraryName: 'sf-utils',
            libraryDirectory: 'es',
            style: false, // 自动导入样式（true 为 less，'css' 为 css）
          }),
        ],
    css: cssConfig,
    build: isLib
      ? buildConfig
      : {
          cssMinify: true,
        },
    resolve: {
      // conditions: ['node'],
      // preserveSymlinks: true,
      extensions: [
        '.mjs',
        '.js',
        '.ts',
        '.jsx',
        '.tsx',
        '.json',
        '.vue',
        '.scss',
        '.less',
        '.css',
      ],
      alias: {
        '@': `${process.cwd()}/src`,
        '@root/': `${process.cwd()}/`,
        '@shared/base': path.resolve(__dirname, 'node_modules/@shared/base'),
      },
    },
  }
})
