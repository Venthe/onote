import { DocumentSupportPlugin } from "./plugin-types";
import { EditorActionCommandDefinition, ReplaceTextActionDefinition } from "../components/context/commandContext";
import * as uuid from 'uuid'
import { IEditableRenderer } from "../page/outline/renderers/EditableRenderer";
import { IReadOnlyRenderer } from "../page/outline/renderers/ReadOnlyRenderer";
import { CommonRibbonElementProps } from "../editor/ribbon/elements/types";

export class PluginManager {
  readonly commands: (ReplaceTextActionDefinition | EditorActionCommandDefinition)[]
  readonly readOnlyRenderers: IReadOnlyRenderer[]
  readonly editableRenderers: IEditableRenderer[]
  readonly tabs: any[]

  constructor(private readonly plugins: DocumentSupportPlugin[]) {
    this.commands = this.plugins.flatMap(p => p.commands ?? [])

    this.readOnlyRenderers = this.plugins.map(plugin => plugin.renderers)
      .flatMap(renderers => renderers?.readOnly ?? [])
      .flatMap(renderer => renderer.supportedDocumentTypes
        ? renderer.supportedDocumentTypes?.flatMap(type => ({ type: type, render: renderer.render }) ?? [])
        : [{ render: renderer.render }]
      )

    this.editableRenderers = this.plugins.map(plugin => plugin.renderers)
      .flatMap(renderers => renderers?.editable ?? [])
      .flatMap(renderer => renderer.supportedDocumentTypes
        ? renderer.supportedDocumentTypes?.flatMap(type => ({ type: type, render: renderer.render }) ?? [])
        : [{ render: renderer.render }]
      )
    this.tabs = this.plugins.flatMap(plugin => plugin.toolbarElements ?? [])
      .map(toolbarElement => ({ id: uuid.v4(), ...toolbarElement }))
  }
}

export const toCommonRibbonElement = (props: CommonRibbonElementProps) => ({
  actionCallback: props.actionCallback,
  translate: props.translate,
  debug: props.debug,
  isApplicable: props.isApplicable,
  isEnabled: props.isEnabled
})
