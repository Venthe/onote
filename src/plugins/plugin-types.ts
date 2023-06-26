import { MutableRefObject } from "react";
import { EditorActionCommandDefinition, ReplaceTextActionDefinition } from "../components/context/commandContext"
import { RibbonElement } from "../editor/ribbon/ribbon";

// #region Document
export interface DocumentSupportPlugin {
  documentMapping?: DocumentMapping[]
  renderers?: Renderers
  commands?: (ReplaceTextActionDefinition | EditorActionCommandDefinition)[]
  toolbarElements?: ToolbarElement[]
}

type DocumentMapping = {
  from: string;
  to: string;
};

type Renderers = {
  readOnly?: ReadOnlyRendererDefinition[];
  // FIXME: Why can't I use HTMLElement here for ANY?
  editable?: EditableRendererDefinition<any>[];
};

type ToolbarElement = Omit<RibbonElement, "id">
// #endregion Document

// #region Renderers
type Renderer<T> = {
  supportedDocumentTypes?: string[]
  render: T
}
export type ReadOnlyRenderer = (props: ReadOnlyRendererProps) => JSX.Element;
export type ReadOnlyRendererDefinition = Renderer<ReadOnlyRenderer>

export type ReadOnlyRendererProps = {
  content: string;
};

export type EditableRendererProps = {
  content: string;
  onChange?: (content: string) => void;
};
export type EditableRenderer<T extends HTMLElement> = (props: EditableRendererProps, ref: MutableRefObject<T>) => JSX.Element;
export type EditableRendererDefinition<T extends HTMLElement> = Renderer<EditableRenderer<T>>
// #endregion Renderers
