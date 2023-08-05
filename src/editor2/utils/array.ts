export type ReducerFunction<T, U>= (acc:T, val:U) => T
export type Reducer <T, U>= [ReducerFunction<T, U>, T]

export const sumNumbers: Reducer<number, number> =
  [(acc, val) => acc + val, 0]

export const deduplicate = <T>(array: T[]): T[] => {
  return [...new Set(array)]
}

export const xor = <T>(array1: T[], array2: T[]): T[] => {
  const deduplicatedArray1 = deduplicate(array1);
  const deduplicatedArray2 = deduplicate(array2);
  return deduplicate([
    ...deduplicatedArray1.filter(element => !deduplicatedArray2.includes(element)),
    ...deduplicatedArray2.filter(element => !deduplicatedArray1.includes(element))]);
}
