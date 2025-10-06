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
    path: '/sign-editor',
    meta: { title: '签名/盖章' },
    component: () => import('@/views/sign-editor/index.vue'),
  },
  {
    path: '/preview-content',
    meta: { title: '预览内容' },
    component: () => import('@/views/preview-content/index.vue'),
  },
]
