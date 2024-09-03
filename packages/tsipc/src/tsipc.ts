import type { ActionFunction } from './types'

const createChainFns = <TInput>() => {
  return {
    input<TInput>() {
      return createChainFns<TInput>()
    },

    action: <TResult>(action: ActionFunction<TInput, TResult>) => {
      return {
        action
      }
    }
  }
}

const tsipc = {
  create() {
    return {
      procedure: createChainFns<void>()
    }
  }
}

export { tsipc }
