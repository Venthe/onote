import React, { PropsWithChildren, createContext, useCallback, useRef } from 'react';
import translation from './en.json'

export type TranslationFunction = <T extends (string | undefined) = string>(key?: string, defaultValue?: T | any) => T;

export const TranslationContext = createContext<TranslationFunction>((key, defaultValue = "") => key ?? defaultValue);

export const TranslationContextProvider = (props: PropsWithChildren<unknown>) => {
  const translationTable = useRef<Record<string, string>>(translation)
  const translate = useCallback<TranslationFunction>((key, defaultValue) => key ? translationTable.current[key] ?? (defaultValue ?? key) : defaultValue, [])

  return (
    <TranslationContext.Provider value={translate}>
      {props.children}
    </TranslationContext.Provider>
  )
}
