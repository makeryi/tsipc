import type { IpcRenderer, IpcRendererEvent } from 'electron'

import type {
  ClientFromRouter,
  RendererHandlers,
  RendererHandlersListener,
  RouterNode,
  RouterType
} from './types'

export const createClient = <Router extends RouterType>({
  ipcInvoke
}: {
  ipcInvoke: IpcRenderer['invoke']
}) => {
  return new Proxy<ClientFromRouter<Router>>({} as any, {
    get: (_, prop) => {
      const invoke = (input: any) => {
        return ipcInvoke(prop.toString(), input)
      }

      if (typeof prop === 'string') {
        return new Proxy(
          {},
          {
            get: (_, nestedProp) => {
              const route = ({} as Router)[prop as keyof Router]

              if (route && 'action' in route) {
                return {
                  invoke
                }
              }

              const nestedRoute = ({} as Router)[prop as keyof Router]
              if (nestedRoute) {
                return createClient({ ipcInvoke })
              }

              return undefined
            }
          }
        )
      }

      return undefined
    }
  })
}

export const createEventHandlers = <T extends RendererHandlers>({
  on,
  send
}: {
  on: (
    channel: string,
    handler: (event: IpcRendererEvent, ...args: any[]) => void
  ) => () => void
  send: IpcRenderer['send']
}) =>
  new Proxy<RendererHandlersListener<T>>({} as any, {
    get: (_, prop) => {
      if (typeof prop === 'string' && Object.hasOwn({} as T, prop)) {
        return {
          listen: (handler: any) =>
            on(prop.toString(), (_, ...args) => handler(...args)),

          handle: (handler: any) => {
            return on(prop.toString(), async (_, id: string, ...args) => {
              try {
                const result = await handler(...args)
                send(id, { result })
              } catch (error) {
                send(id, { error })
              }
            })
          }
        }
      }

      return undefined
    }
  })
