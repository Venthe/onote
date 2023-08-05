import React, {forwardRef, useContext, useEffect, useRef, useState} from "react";
import {EditableRenderer, EditableRendererProps} from "../../plugin-types";
import styles from './ReadWriteRenderer.module.scss'
import {TokenizerContext} from "../../../components/context/tokenizerContext";
import {ITokenizeLineResult} from "vscode-textmate";
import * as vsctm from "vscode-textmate";

// FIXME: Remove any
//  In this case, there is an incorrect typing for react components without name (i.e. forwardRef's Exotic Component)
export const DefaultRWRenderer: EditableRenderer<HTMLPreElement> | any = forwardRef<HTMLPreElement, EditableRendererProps>(({
                                                                                                                                content,
                                                                                                                                type,
                                                                                                                                onChange
                                                                                                                            }, ref) => {
    const tokenizer = useContext(TokenizerContext)

    const [_content, setState] = useState<string>(content)
    useEffect(() => {
        if (type === "markdown") {
            tokenizer.tokenize?.(content.split(/\r?\n/), "text.html.markdown")
                .then(result => {
                    if ((result as []).length > 0) {
                        return (result as { line: string, lineTokens: vsctm.ITokenizeLineResult }[])
                            .flatMap(element => element.lineTokens.tokens.map(token => `<span class="${token.scopes.join('.')}">${element.line.substring(token.startIndex, token.endIndex)}</span>`).join(""))
                            .join("\n")
                    }
                    else {
                        return content
                    }
                })
                .then(result => {
                    console.log(result)
                    setState(result);
                })
        } else {
            setState(content)
        }
    }, [content, type])


    return <pre contentEditable={true}
                ref={ref}
                dangerouslySetInnerHTML={{__html: _content}}
                className={styles.readWriteRenderer}
                onChange={(e) => onChange?.((e.target as HTMLPreElement).innerText)}
                onInput={(e) => onChange?.((e.target as HTMLPreElement).innerText)}
                suppressContentEditableWarning={true}
    ></pre>;
})
DefaultRWRenderer.displayName = "DefaultRwRenderer"
