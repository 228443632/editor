import type { UmoEditorOptions } from '@/types'
import 'virtual:uno.css'
import 'virtual:svg-icons-register'

import App from './app.vue'
import { useUmoEditor } from './components'
const app = createApp(App)

// import '@shared/base/setup.ts'
// import '@shared/base/setup.ts'
// import '@shared/base/element-plus-enhancer/index'

const options = {}

app.use(useUmoEditor, options as UmoEditorOptions)

app.mount('#app')
