import type { UmoEditorOptions } from '@/types'
import 'virtual:uno.css'
import 'virtual:svg-icons-register'

import App from './app.vue'
import { useUmoEditor } from './components'
const app = createApp(App)
import directives from '@/directives'
import router from './router'

// import '@shared/base/setup.ts'
// import '@shared/base/setup.ts'
// import '@shared/base/element-plus-enhancer/index'

const options = {}

app
  .use(directives)
  .use(router)
  .use(useUmoEditor, options as UmoEditorOptions)

app.mount('#app')
