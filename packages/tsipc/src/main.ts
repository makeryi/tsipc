import type { WebContents } from 'electron'
import { ipcMain } from 'electron'
import crypto from 'node:crypto'

import { tsipc } from './tsipc'
import type {
  RendererHandlers,
  RendererHandlersCaller,
  RouterType
} from './types'

export { tsipc }

export const registerIpcMain = (router: RouterType) => {
  const registerRoute = (prefix: string, route: RouterType) => {
    for (const [name, child] of Object.entries(route)) {
      const fullName = prefix ? `${prefix}.${name}` : name

      if (typeof child === 'object' && 'action' in child) {
        ipcMain.handle(fullName, (e, payload) => {
          return child.action!({
            context: { sender: e.sender },
            input: payload
          })
        })
      } else {
        registerRoute(fullName, child as RouterType)
      }
    }
  }

  registerRoute('', router)
}

export const getRendererHandlers = <T extends RendererHandlers>(
  contents: WebContents
) => {
  return new Proxy<RendererHandlersCaller<T>>({} as any, {
    get: (_, prop) => {
      return {
        send: (...args: any[]) => contents.send(prop.toString(), ...args),

        invoke: async (...args: any[]) => {
          const id = crypto.randomUUID()

          return new Promise((resolve, reject) => {
            ipcMain.once(id, (_, { error, result }) => {
              if (error) {
                reject(error)
              } else {
                resolve(result)
              }
            })
            contents.send(prop.toString(), id, ...args)
          })
        }
      }
    }
  })
}

export * from './types'
