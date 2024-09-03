import { createClient } from 'tsipc/react-query'

import type { Router } from '../../main/tsipc'

export const tsipc = createClient<Router>({
  ipcInvoke: window.electron.ipcRenderer.invoke
})
