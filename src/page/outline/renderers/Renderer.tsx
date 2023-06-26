import React, { useMemo } from "react"
import { EditableRenderer, IEditableRenderer } from "./EditableRenderer"
import { IReadOnlyRenderer, ReadOnlyRenderer } from "./ReadOnlyRenderer"

export type RendererProps = {
  content: string;
  readOnlyRenderers?: IReadOnlyRenderer[];
  editableRenderers?: IEditableRenderer[];
  onDirtyChange?: (content: string) => void;
  editable?: boolean;
  type?: string;
};

export const Renderer = ({ content, editableRenderers = [], onDirtyChange, readOnlyRenderers = [], editable = false, type }: RendererProps) => editable
  ? <EditableRenderer content={content} editableRenderers={editableRenderers} type={type} onDirtyChange={onDirtyChange}/>
  : useMemo(() => <ReadOnlyRenderer content={content} type={type} readOnlyRenderers={readOnlyRenderers} />, [editable, content, type])
