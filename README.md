# tsIPC

Typesafe IPC for Electron.

> This project is a fork of [@egoist/tipc](https://github.com/egoist/tipc) and offers additional features. For basic usage, you can refer to the README of [@egoist/tipc](https://github.com/egoist/tipc).

# Usage

I have added a new feature called "Merging Routers" or "Chaining Routers", which allows you to split your routers into multiple files or route objects. Here's how to use it:

```ts
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
  sumC: t.procedure
    .input<{ a: number; b: number }>()
    .action(async ({ input }) => {
      return input.a + input.b
    }),
  routerB
}

export const rootRouter = {
  routerA,
  routerC
}
```

Then you can use it:

```ts
const sumQuery = tsipc.routerC.routerB.useQuery({ a: 1, b: 2 })
```

# Acknowledgments

- Thanks to [@egoist/tipc](https://github.com/egoist/tipc) for the basic features.
- Thanks to [tRPC](https://github.com/trpc/trpc) for the inspiration behind "Merging Routers."
