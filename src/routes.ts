/**
 * @Description:
 * @Author 卞鹏飞 <228443632@qq.com>
 * @create 05/10/25 PM1:43
 */

export const routes = [
  {
    path: '/',
    meta: { title: '' },
    redirect: '/doc-editor',
  },
  {
    path: '/doc-editor',
    meta: { title: '编辑器' },
    component: () => import('@/views/doc-editor/index.vue'),
  },
  {
    path: '/preview-editor',
    meta: { title: '预览编辑器' },
    component: () => import('@/views/doc-editor/index.vue'),
  },
  {
    path: '/preview-result',
    meta: { title: '预览结果' },
    component: () => import('@/views/preview-result/index.vue'),
  },
]
