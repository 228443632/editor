<template>
  <div class="umo-ribbon-menu">
    <!-- 分类   -->
    <div v-if="menus.length > 1" class="umo-ribbon-tabs">
      <div
        v-for="item in menus"
        :key="item.value"
        class="umo-ribbon-tabs-item"
        :class="{ active: currentMenu === item.value }"
        @click="changeMenu(item.value)"
      >
        {{ item.label }}
      </div>
    </div>
    <!-- 图标按钮   -->
    <toolbar-scrollable ref="scrollableRef" class="umo-scrollable-container">
      <div class="umo-ribbon-container">
        <!-- 开始  -->
        <template v-if="currentMenu === 'base'">
          <div class="umo-virtual-group">
            <div class="umo-virtual-group-row">
              <!--  撤回 -->
              <menus-toolbar-base-undo />
              <!--  重做 -->
              <menus-toolbar-base-redo />
            </div>
            <div class="umo-virtual-group-row">
              <!--  格式化刷 -->
              <menus-toolbar-base-format-painter />
              <!--  清除格式 -->
              <menus-toolbar-base-clear-format />
            </div>
          </div>
          <div class="umo-virtual-group">
            <div class="umo-virtual-group-row">
              <!--  字体 -->
              <menus-toolbar-base-font-family />
              <!--  字大小 -->
              <menus-toolbar-base-font-size />
            </div>
            <div class="umo-virtual-group-row">
              <!--  加粗 -->
              <menus-toolbar-base-bold />
              <!--  斜体 -->
              <menus-toolbar-base-italic />
              <!--  下划线 -->
              <menus-toolbar-base-underline />
              <!-- 中滑线 -->
              <menus-toolbar-base-strike />
              <!--  下标 -->
              <menus-toolbar-base-subscript />
              <!--  上标 -->
              <menus-toolbar-base-superscript />
              <!--  颜色 -->
              <menus-toolbar-base-color />
              <!--  背景色 -->
              <menus-toolbar-base-background-color />
              <!--  填充色 -->
              <menus-toolbar-base-highlight v-if="!disableItem('highlight')" />
            </div>
          </div>
          <div class="umo-virtual-group">
            <div class="umo-virtual-group-row">
              <!--  有序列表 -->
              <menus-toolbar-base-ordered-list
                v-if="!disableItem('ordered-list')"
              />
              <!--  无序列表 -->
              <menus-toolbar-base-bullet-list
                v-if="!disableItem('bullet-list')"
              />
              <!--  任务列表 -->
              <menus-toolbar-base-task-list v-if="!disableItem('task-list')" />
              <!--  增加缩进 -->
              <menus-toolbar-base-indent />
              <!--  减少缩进 -->
              <menus-toolbar-base-outdent />
              <!--  行高 -->
              <menus-toolbar-base-line-height
                v-if="!disableItem('line-height')"
              />
              <!-- 上下间距 -->
              <menus-toolbar-base-margin v-if="!disableItem('margin')" />
            </div>
            <div class="umo-virtual-group-row">
              <!-- 左对齐 -->
              <menus-toolbar-base-align-left />
              <!-- 居中对齐 -->
              <menus-toolbar-base-align-center />
              <!-- 右对齐 -->
              <menus-toolbar-base-align-right />
              <!-- 两端对齐 -->
              <menus-toolbar-base-align-justify />
              <!-- 分散对齐 -->
              <menus-toolbar-base-align-distributed />
              <!-- 引用 -->
              <menus-toolbar-base-quote v-if="!disableItem('quote')" />
              <!-- 代码块 -->
              <menus-toolbar-base-code v-if="!disableItem('code')" />
              <!-- 全选 -->
              <menus-toolbar-base-select-all
                v-if="!disableItem('select-all')"
              />
            </div>
          </div>
          <div class="umo-virtual-group">
            <!-- 标题 -->
            <menus-toolbar-base-heading />
          </div>
          <div class="umo-virtual-group">
            <!-- 导入 word -->
            <menus-toolbar-base-import-word />
            <!-- markdown--隐藏 -->
            <!--  <menus-toolbar-base-markdown v-if="!disableItem('markdown')" />-->
            <!-- 查找替换 -->
            <menus-toolbar-base-search-replace />
            <!-- 打印--隐藏 -->
            <!--  <menus-toolbar-base-print v-if="!disableItem('print')" />-->
          </div>
          <div class="virtual-group is-slot umo-virtual-group">
            <!-- 插槽 -->
            <slot name="toolbar_base" toolbar-mode="ribbon" />
          </div>
        </template>

        <!-- 插入  -->
        <template v-if="currentMenu === 'insert'">
          <div class="umo-virtual-group">
            <!--  链接-隐藏 -->
            <!-- <menus-toolbar-insert-link v-if="!disableItem('link')" />-->
            <!--  图片 -->
            <menus-toolbar-insert-image v-if="!disableItem('image')" />
            <!--  视频-隐藏 -->
            <menus-toolbar-insert-video v-if="!disableItem('video')" />
            <!--  音频 -->
            <menus-toolbar-insert-audio v-if="!disableItem('audio')" />
            <!--  文件 -->
            <menus-toolbar-insert-file v-if="!disableItem('file')" />
            <!--  代码块-隐藏 -->
            <!--            <menus-toolbar-insert-code-block-->
            <!--              v-if="!disableItem('code-block')"-->
            <!--            />-->
            <!--  特殊字符 -->
            <menus-toolbar-insert-symbol v-if="!disableItem('symbol')" />
            <!--  日期 -->
            <menus-toolbar-insert-chinese-date
              v-if="!disableItem('chineseDate')"
            />
            <!--  表情 -->
            <menus-toolbar-insert-emoji v-if="!disableItem('emoji')" />
            <!--  数学/公式 -->
            <menus-toolbar-insert-math v-if="!disableItem('math')" />
          </div>
          <div class="umo-virtual-group">
            <!--  标签 -->
            <menus-toolbar-insert-tag v-if="!disableItem('tag')" />
            <!--  分栏 -->
            <menus-toolbar-insert-columns v-if="!disableItem('columns')" />
            <!--  高亮块 -->
            <menus-toolbar-insert-callout v-if="!disableItem('callout')" />
            <!--  提及某人 -->
            <!--            <menus-toolbar-insert-mention v-if="!disableItem('mention')" />-->
            <!--  书签 -->
            <menus-toolbar-insert-bookmark v-if="!disableItem('bookmark')" />
          </div>
          <div class="umo-virtual-group">
            <!--  换行符 -->
            <menus-toolbar-insert-hard-break
              v-if="!disableItem('hard-break')"
            />
            <!--  分割线 -->
            <menus-toolbar-insert-hr v-if="!disableItem('hr')" />
            <!--  页面大纲 -->
            <menus-toolbar-insert-toc v-if="!disableItem('toc')" />
            <!--  文本框 -->
            <menus-toolbar-insert-text-box v-if="!disableItem('textBox')" />
          </div>
          <div class="umo-virtual-group">
            <!--  模版 -->
            <menus-toolbar-insert-template v-if="!disableItem('template')" />
            <!--  网页 -->
            <menus-toolbar-insert-web-page v-if="!disableItem('webPage')" />
          </div>

          <!--  插槽 -->
          <div class="virtual-group is-slot">
            <slot name="toolbar_insert" toolbar-mode="ribbon" />
          </div>
        </template>

        <!-- 表格  -->
        <template v-if="currentMenu === 'table'">
          <div class="umo-virtual-group">
            <menus-toolbar-table-insert />
            <menus-toolbar-table-fix />
          </div>
          <div class="umo-virtual-group">
            <menus-toolbar-table-cells-align />
            <menus-toolbar-table-cells-background />
            <!-- <menus-toolbar-table-border-color /> -->
          </div>
          <div class="umo-virtual-group">
            <div class="umo-virtual-group-row">
              <menus-toolbar-table-add-row-before />
              <menus-toolbar-table-add-row-after />
              <menus-toolbar-table-delete-row />
            </div>
            <div class="umo-virtual-group-row">
              <menus-toolbar-table-add-column-before />
              <menus-toolbar-table-add-column-after />
              <menus-toolbar-table-delete-column />
            </div>
          </div>
          <div class="umo-virtual-group">
            <div class="umo-virtual-group-row">
              <menus-toolbar-table-merge-cells />
            </div>
            <div class="umo-virtual-group-row">
              <menus-toolbar-table-split-cell />
            </div>
          </div>
          <div class="umo-virtual-group">
            <div class="umo-virtual-group-row">
              <menus-toolbar-table-toggle-header-row />
              <menus-toolbar-table-toggle-header-column />
            </div>
            <div class="umo-virtual-group-row">
              <menus-toolbar-table-toggle-header-cell />
            </div>
          </div>
          <div class="umo-virtual-group">
            <div class="umo-virtual-group-row">
              <menus-toolbar-table-next-cell />
            </div>
            <div class="umo-virtual-group-row">
              <menus-toolbar-table-previous-cell />
            </div>
          </div>
          <div class="umo-virtual-group">
            <menus-toolbar-table-delete />
          </div>
          <div class="virtual-group is-slot">
            <slot name="toolbar_table" toolbar-mode="ribbon" />
          </div>
        </template>

        <!-- 工具  -->
        <template v-if="currentMenu === 'tools'">
          <div class="umo-virtual-group">
            <!--  二维码 -->
            <menus-toolbar-tools-qrcode v-if="!disableItem('qrcode')" />
            <!--  条形码 -->
            <menus-toolbar-tools-barcode v-if="!disableItem('barcode')" />
          </div>
          <div class="umo-virtual-group">
            <!--  电子签名 -->
            <menus-toolbar-tools-signature v-if="!disableItem('signature')" />
            <!--  电子签章 -->
            <menus-toolbar-tools-seal v-if="!disableItem('seal')" />
          </div>
          <div class="umo-virtual-group">
            <!--  流程图 -->
            <menus-toolbar-tools-diagrams v-if="!disableItem('diagrams')" />
            <!--  图表 -->
            <menus-toolbar-tools-echarts v-if="!disableItem('echarts')" />
            <!--  Mermaid -->
            <!-- <menus-toolbar-tools-mind-map v-if="!disableItem('mind-map')" /> -->
<!--            <menus-toolbar-tools-mermaid v-if="!disableItem('mermaid')" />-->
          </div>
          <div class="umo-virtual-group !border-l-0">
            <!--  中文大小写 -->
            <menus-toolbar-tools-chinese-case
              v-if="!disableItem('chineseCase')"
            />
          </div>
          <div class="umo-virtual-group">
            <slot name="toolbar_tools" toolbar-mode="ribbon" />
          </div>
        </template>

        <!-- 页面  -->
        <template v-if="currentMenu === 'page'">
          <!-- 目录  -->
          <div class="umo-virtual-group">
            <menus-toolbar-page-toggle-toc />
          </div>
          <!-- 页边距  -->
          <!--          <div class="umo-virtual-group">-->
          <!--            <div class="umo-virtual-group-row">-->
          <!--              &lt;!&ndash;  页边距 &ndash;&gt;-->
          <!--              <menus-toolbar-page-margin />-->
          <!--              <div>-->
          <!--                <div class="umo-virtual-group-row">-->
          <!--                  <menus-toolbar-page-size />-->
          <!--                </div>-->
          <!--                <div class="umo-virtual-group-row">-->
          <!--                  <menus-toolbar-page-orientation />-->
          <!--                </div>-->
          <!--              </div>-->
          <!--            </div>-->
          <!--          </div>-->
          <div class="umo-virtual-group">
            <!--  分隔符 -->
            <menus-toolbar-page-break v-if="!disableItem('pageBreakSymbol')"/>
            <!--  显示换行 -->
            <menus-toolbar-page-break-marks />
            <!--  显示行号 -->
            <menus-toolbar-page-line-number />
            <!--  页面水印 -->
            <menus-toolbar-page-watermark v-if="!disableItem('watermark')" />
            <!--  页面背景 -->
            <menus-toolbar-page-background v-if="!disableItem('background')" />
          </div>
          <div class="umo-virtual-group">
            <!--  演示模式 -->
            <menus-toolbar-page-preview v-if="!disableItem('preview')" />
          </div>

          <!--  插槽 -->
          <div class="virtual-group is-slot">
            <slot name="toolbar_page" toolbar-mode="ribbon" />
          </div>
        </template>

        <!-- 导出  -->
        <template v-if="currentMenu === 'export'">
          <div class="umo-virtual-group">
            <!-- 图片 -->
            <menus-toolbar-export-image v-if="!disableItem('exportImage')" />
            <!-- PDF -->
            <menus-toolbar-export-pdf v-if="!disableItem('exportPDF')" />
            <!-- 文本文档 -->
            <menus-toolbar-export-text v-if="!disableItem('exportText')" />
          </div>
          <div class="umo-virtual-group">
            <!-- 分享文档 -->
            <menus-toolbar-export-share v-if="!disableItem('share')" />
            <!-- embed iframe嵌入 -->
            <menus-toolbar-export-embed v-if="!disableItem('embed')" />
          </div>
          <!--  插槽 -->
          <div class="virtual-group is-slot">
            <slot name="toolbar_export" toolbar-mode="ribbon" />
          </div>
        </template>
      </div>
    </toolbar-scrollable>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  menus: {
    value: string
    label: string
  }[]
  currentMenu: string
}>()
const emits = defineEmits(['menu-change'])

const options = inject('options')
const disableItem = (name: string) => {
  return options.value.toolbar?.disableMenuItems.includes(name)
}

const scrollableRef = $ref<{ update: () => void }>()
const changeMenu = async (menu: string) => {
  emits('menu-change', menu)
  await nextTick()
  scrollableRef?.update()
}
</script>

<style lang="less" scoped>
.umo-ribbon-menu {
  width: 100%;
}
.umo-ribbon-tabs {
  padding: 10px 10px 0;
  display: flex;
  justify-content: center;
  &-item {
    font-size: var(--umo-font-size-small);
    margin-right: 25px;
    cursor: pointer;
    display: flex;
    align-items: center;
    flex-direction: column;
    &:hover {
      font-weight: 600;
      &::after {
        display: block;
        content: '';
        height: 3px;
        width: 100%;
        margin-top: 5px;
        background-color: var(--umo-border-color);
      }
    }
    &.active {
      color: var(--umo-primary-color);
      font-weight: 600;
      &::after {
        display: block;
        content: '';
        height: 3px;
        width: 100%;
        margin-top: 5px;
        background-color: var(--umo-primary-color);
        transition: width 0.3s;
      }
      &:hover::after {
        width: 120%;
      }
    }
    @media screen and (max-width: 640px) {
      margin-right: 10px;
    }
  }
}
.umo-scrollable-container {
  width: 100%;
  padding: 8px 12px 10px;
  box-sizing: border-box;
}
.umo-ribbon-container {
  display: flex;
  height: 56px;
  width: fit-content;
  margin: 0 auto;
  flex-shrink: 0;
  .umo-virtual-group {
    padding: 0 16px;
    border-left: solid 1px var(--umo-border-color-light);
    flex-shrink: 0;
    &:empty {
      display: none;
    }
    &:first-child {
      padding-left: 0;
    }
    &:first-child,
    &.is-slot:empty {
      border-left: none;
    }
    &-row {
      display: flex;
      align-items: center;
      :deep(> *:not(:last-child)) {
        margin-right: 5px;
      }
      &:not(:last-child) {
        margin-bottom: 5px;
      }
    }
  }
}
</style>
