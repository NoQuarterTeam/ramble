// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Await<T extends (...args: any) => unknown> = Awaited<ReturnType<T>>
