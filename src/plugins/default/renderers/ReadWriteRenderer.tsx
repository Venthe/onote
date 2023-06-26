import React, { forwardRef } from "react";
import { EditableRenderer, EditableRendererProps } from "../../plugin-types";
import styles from './ReadWriteRenderer.module.scss'

// FIXME: Remove any
//  In this case, there is an incorrect typing for react components without name (i.e. forwardRef's Exotic Component)
export const DefaultRWRenderer: EditableRenderer<HTMLPreElement> | any = forwardRef<HTMLPreElement, EditableRendererProps>(({ content, onChange }, ref) => {
  return <pre contentEditable={true}
    ref={ref}
    className={styles.readWriteRenderer}
    onChange={(e) => onChange?.((e.target as HTMLPreElement).innerText)}
    onInput={(e) => onChange?.((e.target as HTMLPreElement).innerText)}
    suppressContentEditableWarning={true}
  >{content}</pre>;
})
DefaultRWRenderer.displayName = "DefaultRwRenderer"
