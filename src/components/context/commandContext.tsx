import React, { PropsWithChildren, createContext, useCallback, useContext, useRef } from "react";
import { CurrentlyEditingStateContext } from "./documentContext";
import { ReplaceText, TextSelectionOptions } from "../../page/Page";

const undefinedCallback = (name: string) => () => {
  throw new Error(name + " callback not defined")
}

export interface CommandContextProviderProps {
  notificationCallback?: NotificationCallback
  commands?: (EditorActionCommandDefinition | ReplaceTextActionDefinition)[]
}

type RegisterCommand = (key: string, action: EditorAction) => void;
export type ActionCallback = (actionKey: string, data?: any) => void;
type NotificationCallback = (actionKey: string, data?: any) => void;

export const CommandContext = createContext<{
  notificationCallback: NotificationCallback,
  actionCallback: ActionCallback,
}>({
  actionCallback: undefinedCallback("Action"),
  notificationCallback: undefinedCallback("Notification")
})

export const CommandRegistryContext = createContext<{
  registerCommand: RegisterCommand,
  registerReplaceTextCallback: (callback: ReplaceText) => void
  isApplicable: (actionKey: string) => boolean
  isEnabled: (actionKey: string) => boolean
}>({
  registerCommand: undefinedCallback("Register command"),
  registerReplaceTextCallback: undefinedCallback("Register replace text"),
  isApplicable: undefinedCallback("Is applicable"),
  isEnabled: undefinedCallback("Is editable")
})

export const CommandContextProvider = (props: PropsWithChildren<CommandContextProviderProps>) => {
  const replaceTextCallback = useRef<ReplaceText | undefined>(undefined)
  const additionalCommands = useRef<Record<string, EditorActionCommandDefinition>>({})
  const currentlyEditing = useContext(CurrentlyEditingStateContext)

  const additionalEditorActions: EditorActionCommandDefinition[] = Object.keys(additionalCommands.current).map(key => additionalCommands.current[key]);
  const commands: (EditorActionCommandDefinition | ReplaceTextActionDefinition)[] = [
    ...additionalEditorActions,
    ...(props.commands ?? [])
  ];

  const provideApplicableProps = useCallback<() => IsApplicableProps>(() => ({
    isEditing: !!currentlyEditing,
    documentType: currentlyEditing?.documentType,
    selection: window.getSelection() ?? undefined
  }), [currentlyEditing])

  const registerCommand: RegisterCommand = useCallback((key, action) => additionalCommands.current[key] = editorAction(key, action), [])
  const actionCallback: ActionCallback = useCallback((key, data) => {
    props.notificationCallback?.(key, data);
    const command = commands.filter(command => command.commandKey === key)
      .filter(command => command.isApplicable?.(provideApplicableProps()) ?? true)[0]

    if (!command) return

    if (command.type === "editorAction") {
      const cmd = command as EditorActionCommandDefinition
      cmd.action();
    } else if (command.type === "replaceText") {
      const cmd = command as ReplaceTextActionDefinition
      replaceTextCallback.current?.(cmd.selection ?? 'selection')(cmd.action)
    } else {
      throw new Error("Unknown action")
    }
  }, [commands, currentlyEditing, props.notificationCallback])

  const registerReplaceTextCallback = (callback: ReplaceText) => {
    return replaceTextCallback.current = callback;
  }

  const isApplicable = useCallback((commandKey: string) => {
    const command = commands.filter(command => command.commandKey === commandKey)
      .filter(command => command.isApplicable?.(provideApplicableProps()) ?? true)[0]
    return !!command
  }, [commands, currentlyEditing])

  const isEnabled = useCallback((commandKey: string) => {
    const command = commands.filter(command => command.commandKey === commandKey)
      .filter(command => command.isEnabled?.(provideApplicableProps()) ?? false)[0]
    return !!command
  }, [commands, currentlyEditing])

  return (
    <CommandRegistryContext.Provider value={{
      isApplicable,
      registerCommand,
      registerReplaceTextCallback,
      isEnabled
    }}>
      <CommandContext.Provider value={{
        notificationCallback: props.notificationCallback ?? undefinedCallback("Notification"),
        actionCallback
      }}>
        {props.children}
      </CommandContext.Provider>
    </CommandRegistryContext.Provider>
  )
}

const editorAction: (commandKey: string, action: () => void) => EditorActionCommandDefinition = (commandKey, action) => ({ type: 'editorAction', commandKey, action })

// TODO: Add commands with AST
export type OnoteDocument = { a?: string }

type IsApplicableProps = {
  document?: OnoteDocument;
  selection?: Selection;
  documentType?: string;
  isEditing: boolean;
};

export type IsApplicable = (props: IsApplicableProps) => boolean;
export type CommandType = "replaceText" | "editorAction"
export type ReplaceTextAction = (text: string | undefined, props?: Record<string, string>) => string
export type EditorAction = () => void
export type CommandDefinition<T extends CommandType, U extends object = object, PROPS = unknown> = {
  commandKey: string
  type: T
  action: U,
  isApplicable?: IsApplicable,
  isEnabled?: IsApplicable
} & PROPS

export type EditorActionCommandDefinition = CommandDefinition<"editorAction", EditorAction>
export type ReplaceTextActionDefinition = CommandDefinition<"replaceText", ReplaceTextAction, {
  selection?: TextSelectionOptions
  isEnabled?: IsApplicable
}>

export type CallCommandProps = {
  commandKey: string
  props?: Record<string, string>
}
