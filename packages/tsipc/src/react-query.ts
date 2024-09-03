import type {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { IpcRenderer } from 'electron'

import type { RouterType } from './types'

export const createClient = <Router extends RouterType>({
  ipcInvoke
}: {
  ipcInvoke: IpcRenderer['invoke']
}) => {
  return new Proxy<QueryClientFromRouter<Router>>({} as any, {
    get: (_, prop) => {
      const invoke = (input: any) => {
        return ipcInvoke(prop.toString(), input)
      }

      if (prop === 'useUtils') {
        return () => {
          const queryClient = useQueryClient()

          return new Proxy(
            {},
            {
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
            }
          )
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
  })
}

export type QueryClientFromRouter<Router extends RouterType> = {
  useUtils: () => UtilsFromRouter<Router>
} & {
  [K in keyof Router]: Router[K]['action'] extends (options: {
    context: any
    input: infer P
  }) => Promise<infer R>
    ? {
        useMutation: (
          mutationOptions?: UseMutationOptions<R, Error, P>
        ) => UseMutationResult<R, Error, P>

        useQuery: (
          variables: P,
          queryOptions?: Omit<UseQueryOptions<R, Error, P>, 'queryKey'>
        ) => UseQueryResult<R, Error>
      }
    : never
}

export type UtilsFromRouter<Router extends RouterType> = {
  [K in keyof Router]: Router[K]['action'] extends (options: {
    context: any
    input: infer P
  }) => Promise<infer R>
    ? {
        setQueryData: (
          variables: P,
          updater: R | ((prev: R | undefined) => R | undefined)
        ) => void

        removeQueryCache: (variables: P) => void
      }
    : never
}
