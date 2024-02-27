// biome-ignore lint/suspicious/noExplicitAny: allow it
export type Await<T extends (...args: any) => unknown> = Awaited<ReturnType<T>>
