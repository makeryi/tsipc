import { tsipc } from 'tsipc/main'

const t = tsipc.create()

const routerA = {
  sumA: t.procedure
    .input<{ a: number; b: number }>()
    .action(async ({ input }) => {
      return input.a + input.b
    })
}

const routerB = {
  sumB: t.procedure
    .input<{ a: number; b: number }>()
    .action(async ({ input }) => {
      return input.a + input.b
    })
}

const routerC = {
  sumC: t.procedure.action(async ({ input }) => {
    return 1
  }),
  routerB
}

export const rootRouter = {
  routerA,
  routerC
}

export type Router = typeof rootRouter
