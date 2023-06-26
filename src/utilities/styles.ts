import { CSSProperties } from "react";

export const hide = (isHidden: boolean): CSSProperties => !isHidden ? {} : { display: "none", visibility: "hidden" }

export const joinStyles = (...styles: (string | string[] | undefined | false)[]) => {
  const result: string[] = []
  for (const style of styles) {
    if (style === undefined || style === false) {
      continue;
    } else if (typeof style === 'string') {
      result.push(style)
    } else {
      (style as string[]).forEach(st => result.push(st))
    }
  }
  return result.join(" ")
}

export const conditionalStyle: (style: string, b?: boolean) => string | undefined = (style, b) => (b ?? true) ? style : undefined;
