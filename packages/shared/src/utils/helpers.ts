// https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects#answer-64489535
export const groupBy = <T>(array: T[], predicate: (value: T, index: number, array: T[]) => string) =>
  array.reduce(
    (acc, value, index, array) => {
      // biome-ignore lint/suspicious/noAssignInExpressions: onion
      ;(acc[predicate(value, index, array)] ||= []).push(value)
      return acc
    },
    {} as { [key: string]: T[] },
  )

export function uniq<T extends string | number>(a: T[]) {
  return Array.from(new Set(a))
}
