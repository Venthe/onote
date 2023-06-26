import React from "react";

export const emptyPage = (<></>)
export function entries<T = any>(obj: object) {
  return Object.keys(obj)
    .map(key => ({ key, value: (obj as any)[key] as T }))
}
export function classes(...cls: (string | undefined)[]) {
  return cls.filter(i => i != undefined).join(" ")
}

// Poor man's clone
export const clone = (val: object) => JSON.parse(JSON.stringify(val))
