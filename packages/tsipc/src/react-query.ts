import type {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { IpcRenderer } from 'electron'

import type {
  ActionFunction,
  ClientFromRouter,
  RouterNode,
  RouterType
} from './types'

export const createClient = <Router extends RouterType>({
  ipcInvoke
}: {
  ipcInvoke: IpcRenderer['invoke']
}) => {
  const createHandler = (parent: Object, prop: string) => {
    const invoke = (input: any) => {
      return ipcInvoke(prop.toString(), input)
    }

    if (prop === 'useUtils') {
      return () => {
        const queryClient = useQueryClient()

        return new Proxy(parent, {
          get: (_, prop) => {
            return {
              setQueryData: (variables: unknown, updater: unknown) => {
                return queryClient.setQueryData(
                  [prop.toString(), variables],
                  updater
                )
              }
            }
          }
        })
      }
    }

    return {
      useMutation: (mutationOptions?: any) => {
        return useMutation({
          ...mutationOptions,
          mutationFn: invoke
        })
      },

      useQuery: (variables: any, queryOptions?: any) => {
        return useQuery({
          ...queryOptions,
          queryKey: [prop.toString(), variables],
          queryFn: () => invoke(variables)
        })
      }
    }
  }

  return new Proxy({} as ClientFromRouter<Router>, {
    get: (parent, prop) => {
      if (typeof prop === 'string') {
        const currentRoute = {} as Router

        const route = currentRoute[prop as keyof Router]

        if (route && 'action' in route) {
          return createHandler(parent, prop.toString())
        } else {
          return new Proxy(parent, {
            get: (parent, nestedProp) => {
              const nestedRoute = route?.[nestedProp as keyof RouterNode]
              if (nestedRoute) {
                return createHandler(parent, nestedProp.toString())
              }
              return undefined
            }
          })
        }
      }

      return undefined
    }
  })
}

export type QueryClientFromRouter<Router extends RouterType> = {
  useUtils: () => UtilsFromRouter<Router>
} & {
  [K in keyof Router]: Router[K] extends {
    action: ActionFunction<infer P, infer R>
  }
    ? {
        useMutation: (
          mutationOptions?: UseMutationOptions<R, Error, P>
        ) => UseMutationResult<R, Error, P>
        useQuery: (
          variables?: P,
          queryOptions?: Omit<UseQueryOptions<R, Error, P>, 'queryKey'>
        ) => UseQueryResult<R, Error>
      }
    : Router[K] extends RouterNode
      ? QueryClientFromRouter<Router[K] & RouterType>
      : never
}

export type UtilsFromRouter<Router extends RouterType> = {
  [K in keyof Router]: Router[K] extends {
    action: ActionFunction<infer P, infer R>
  }
    ? {
        setQueryData: (
          variables: P,
          updater: R | ((prev: R | undefined) => R | undefined)
        ) => void
        removeQueryCache: (variables: P) => void
      }
    : never
}
