import React, {createContext, PropsWithChildren, useEffect, useState} from "react";
import * as oniguruma from 'vscode-oniguruma'
import * as vsctm from 'vscode-textmate'
import {IOnigLib} from "vscode-textmate/release/onigLib";

export const TokenizerContext = createContext<TokenizerFunctions>({});

type TokenizerFunctions = { tokenize?: (lines: string[], scope: string) => Promise<{ line: string, lineTokens: vsctm.ITokenizeLineResult }[] | null | void> };

export const TokenizerContextProvider = (props: PropsWithChildren<any>) => {
    const [state, setState] = useState<TokenizerFunctions>({})
    useEffect(() => {
        const vscodeOnigurumaLib: Promise<IOnigLib> = fetch('onig.wasm')
            .then((response) => response.arrayBuffer())
            .then(wasmBin => oniguruma.loadWASM(wasmBin))
            .then(() => ({
                createOnigScanner: patterns => new oniguruma.OnigScanner(patterns),
                createOnigString: s => new oniguruma.OnigString(s)
            }));

        const registry = new vsctm.Registry({
            onigLib: vscodeOnigurumaLib,
            loadGrammar: (scopeName) => {
                if (scopeName === 'text.html.markdown') {
                    return fetch('grammars/markdown.tmLanguage')
                        .then(data => data.text())
                        .then(data => vsctm.parseRawGrammar(data.toString()))
                }
                // console.debug(`Unknown scope name: ${scopeName}`);
                return Promise.resolve(null);
            }
        });

        setState({
            tokenize: (text, scope) => registry.loadGrammar(scope)
                .then(grammar => {
                    if (!grammar) {
                        console.error("No grammar!")
                        return null
                    }

                    let ruleStack = vsctm.INITIAL;
                    const results: { line: string, lineTokens: vsctm.ITokenizeLineResult }[] = []
                    for (const line of text) {
                        const lineTokens = grammar.tokenizeLine(line, ruleStack);
                        results.push({line, lineTokens})
                        ruleStack = lineTokens.ruleStack;
                    }
                    return results
                })
                .catch(e => {
                    console.error(e)
                })
        })
    }, [])


    return (
        <TokenizerContext.Provider value={state}>
            {props.children}
        </TokenizerContext.Provider>
    )
}
