import React, { PropsWithChildren, createContext, useCallback, useEffect, useRef } from "react";

export type SetPosition = (id: string, position: { x: number, y: number }) => void
export type SetWidth = (id: string, width: number) => void
export type RemoveId = (id: string) => void

export const DragContext = createContext<{ setWidth: SetWidth, setPosition: SetPosition, removeId: RemoveId }>(null as any);

export const DragContextProvider = (props: PropsWithChildren<any>) => {
  const dragStyleElement = useRef<HTMLStyleElement>(document.createElement('style'))
  const settings = useRef<Record<string, { x?: number, width?: number, y?: number }>>({})

  const updateStyle = () => {
    dragStyleElement.current.innerHTML = Object.keys(settings.current ?? [])
      .map(key => ({ key, value: settings.current?.[key] }))
      .reduce((acc, { key, value }) => {
        const { x, y, width } = value
        const data = `[data-v-position="${key}"] {
        ${(x && `left: ${x}px;`) ?? ""}
        ${(y && `top: ${y}px;`) ?? ""}
      }`
        const data2 = `[data-v-width="${key}"] {
        ${(width && `width: ${width}px;`) ?? ""}
      }`


        return [acc, data, data2].join("")
      }, "")
  }

  const setPosition: SetPosition = useCallback((id, position) => {
    settings.current[id] = { ...(settings.current[id] ?? {}), ...position }
    updateStyle()
  }, [])

  const setWidth: SetWidth = useCallback((id, width) => {
    settings.current[id] = { ...(settings.current[id] ?? {}), width }
    updateStyle()
  }, [])

  const removeId: RemoveId = useCallback((id) => {
    delete settings.current[id]
    updateStyle()
  }, [])

  useEffect(() => {
    const head = document.querySelector('head');
    head?.appendChild(dragStyleElement.current);

    return () => {
      dragStyleElement.current.parentElement?.removeChild(dragStyleElement.current)
    }
  }, [])

  return (
    <DragContext.Provider value={{ setPosition, setWidth, removeId }}>
      {props.children}
    </DragContext.Provider>
  )
}
