import React from "react";
import * as VisualEditorDocument from "./document"
import "./editor.scss"
import {getAttributeValue} from "./utilities/utilities";

export const Editor = (props: { debug: { commands: { appendLog: (line: string, ...pills: string[]) => void } }, document: VisualEditorDocument.Document, refreshCallback?: () => void }) => {
    return <>
        Lines: {props.document.getLines()}
        Selection: {JSON.stringify(props.document.getCursor())}
        <div className="visual-editor"
             // onSelectCapture={e => {
             //     props.document.updateCursor()
             //     props.refreshCallback?.()
             //     e.stopPropagation()
             //     e.preventDefault()
             // }}
             // onClick={e => {
             // }}
             // onMouseUp={e=>{
             //
             //     props.refreshCallback?.()
             //     props.document.restoreCursor()
             // }}
            // onKeyDown={e => {
            //     e.stopPropagation()
            //     e.preventDefault()
            // }}
            // onInputCapture={e => {
            //     e.stopPropagation()
            //     e.preventDefault()
            // }}
             onInputCapture={e => {
                 props.document.parse(e.currentTarget.innerHTML);
                 props.refreshCallback?.()
             }}
             contentEditable={true}
             dangerouslySetInnerHTML={{__html: props.document.toDOM()}}/>
    </>
}
