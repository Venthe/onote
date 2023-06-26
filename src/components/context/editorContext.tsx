import React, { PropsWithChildren, createContext } from 'react';
import { DocumentContextProvider } from './documentContext';
import { TranslationContextProvider } from './translationContext';
import { CommandContextProvider, CommandContextProviderProps } from './commandContext';
import { IPage } from '../../page/Page';
import { useMousePosition } from '../hooks/useMousePosition';

export const DebugContext = createContext(false);
export const MousePosition = createContext({ x: 0, y: 0 });

// TODO: Add to context dispatchers for notification
// TODO: Add to context callbacks for AST?
// TODO: Add to context callbacks for translation
export const EditorContext = (props: PropsWithChildren<{ debug: boolean, page?: IPage, onCommit?: (page: IPage) => void } & CommandContextProviderProps>) => {
  const trackMousePosition = useMousePosition();
  return (
    <TranslationContextProvider>
      <DebugContext.Provider value={props.debug}>
        <MousePosition.Provider value={trackMousePosition ?? { x: 0, y: 0 }}>
          <DocumentContextProvider page={props.page} onCommit={props.onCommit}>
            <CommandContextProvider
              notificationCallback={props.notificationCallback}
              commands={props.commands}>
              {props.children}
            </CommandContextProvider>
          </DocumentContextProvider>
        </MousePosition.Provider>
      </DebugContext.Provider>
    </TranslationContextProvider>
  )
}
