export type ActionContext = {
  sender: Electron.WebContents
}

export type ActionFunction<TInput = any, TResult = any> = (args: {
  context: ActionContext
  input: TInput
}) => Promise<TResult>

export type RouterNode = {
  action?: ActionFunction
} & {
  [key: string]: RouterNode | ActionFunction
}

export type RouterType = {
  [key: string]: RouterNode
}

export type ClientFromRouter<Router extends RouterType> = {
  [K in keyof Router]: Router[K] extends {
    action: ActionFunction<infer P, infer R>
  }
    ? (input: P) => Promise<R>
    : {
        [SK in keyof Router[K]]: SK extends string
          ? Router[K][SK] extends RouterType
            ? ClientFromRouter<Router[K][SK]>
            : Router[K][SK] extends ActionFunction
              ? (
                  input: Parameters<Router[K][SK]>[0]['input']
                ) => ReturnType<Router[K][SK]>
              : never
          : never
      }
}

export type RendererHandlers = Record<string, (...args: any[]) => any>

export type RendererHandlersListener<T extends RendererHandlers> = {
  [K in keyof T]: {
    listen: (handler: (...args: Parameters<T[K]>) => void) => () => void

    handle: (handler: T[K]) => () => void
  }
}

export type RendererHandlersCaller<T extends RendererHandlers> = {
  [K in keyof T]: {
    send: (...args: Parameters<T[K]>) => void

    invoke: (...args: Parameters<T[K]>) => Promise<Awaited<ReturnType<T[K]>>>
  }
}
