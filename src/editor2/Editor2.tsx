import React, {
    CSSProperties,
    DependencyList,
    MouseEventHandler,
    PropsWithChildren,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react'
import {PieceTreeBase, PieceTreeTextBufferBuilder} from "vscode-textbuffer";
import "./Editor2.scss"
import * as oniguruma from "vscode-oniguruma";
import * as vsctm from "vscode-textmate";

const styles: Record<string, CSSProperties> = {
    button: {
        borderRadius: "0",
        fontSize: "0.8rem",
        maxWidth: "5rem",
        wordBreak: "keep-all",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        padding: "1px"
    },
    container: {
        boxSizing: "border-box",
        padding: "2rem",
        backgroundColor: "darkgrey",
        width: "100vw",
        height: "100vh",
        display: "grid",
        gridTemplateRows: "70% 1fr"
    },
    sources: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridTemplateRows: "100%"
    },
    panel: {
        border: "1px solid rgba(0,0,0,0.5)",
        margin: "0.4rem",
        transition: "all 0.1s ease",
        display: "grid",
        gridTemplateRows: "2rem min-content 1fr",
        overflow: "hidden"
    },
    panelTitle: {
        fontWeight: "bold",
        fontSize: "1.5rem",
        fontFamily: "calibri",
        textTransform: "uppercase",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem",
        background: "rgba(0,0,0,0.3)",
        borderBottom: "1px solid rgba(0,0,0,0.5)",
    },
    panelChildren: {
        backgroundColor: "rgba(0,0,0,0.1)",
        wordBreak: "break-word",
        scrollbarColor: "darkgray gray",

        overflow: "hidden",
        height: "100%",
        whiteSpace: "break-spaces",
        overflowY: "auto",
        scrollbarWidth: "thin",
    },
    panelTaskbar: {
        backgroundColor: "rgba(0,0,0,0.2)",
        borderBottom: "1px solid rgba(0,0,0,0.5)",
        padding: "2px"
    },
    panelHover: {
        backgroundColor: "rgba(0,0,0,0.05)",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)"
    },
    flasher: {
        borderRadius: "0.2rem 0.2rem"
    },
    FileLineContainer: {
        display: "table",
        whiteSpace: "break-spaces"
    },
    FileLine: {
        display: "table-row"
    },
    FileLineContent: {
        paddingLeft: "0.5rem",
        display: "table-cell",
        minHeight: "1rem"
    },
    FileLineNumber: {
        verticalAlign: "top",
        userSelect: "none",
        fontSize: "0.8rem",
        fontFamily: "courier",
        textAlign: "right",
        color: "rgba(255,255,255,0.6)",
        display: "table-cell",
        wordBreak: "keep-all",
        paddingLeft: "0.2rem",
        paddingRight: "0.4rem",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        borderRight: "2px solid rgba(255,255,255,0.6)"
    },
    debugContainer: {
        height: "100%",
        display: "grid",
        gridTemplateRows: "1fr",
        gridTemplateColumns: "60% 1fr",
        overflow: "hidden"
    },
    debugLog: {
        height: "100%",
        whiteSpace: "break-spaces",
        overflow: "hidden",
        overflowY: "auto",
        scrollbarGutter: "stable",
        scrollbarWidth: "thin",

    },
    debugTokenTree: {
        borderLeft: "1px solid black",
        paddingLeft: "0.5rem",
        height: "100%",
        whiteSpace: "break-spaces",
        overflow: "hidden",
        overflowY: "auto",
        scrollbarGutter: "stable",
        scrollbarWidth: "thin",
    }
}

const ORIGINAL_TEXT = `
---
layout: post
title: Blogging Like a Hacker
exampleVariable: test
---
# Header H1 with variable {{ page.exampleVariable }}

An h1 header
============

Paragraphs are separated by a blank line.

2nd paragraph. *Italic*, **bold**, and \`monospace\`. Itemized lists
look like:

* this one
* that one
* the other one

Note that --- not considering the asterisk --- the actual text
content starts at 4-columns in.

> Block quotes are
> written like so.
>
> They can span multiple paragraphs,
> if you like.

Use 3 dashes for an em-dash. Use 2 dashes for ranges (ex., "it's all
in chapters 12--14"). Three dots ... will be converted to an ellipsis.
Unicode is supported. ☺



An h2 header
------------

Here's a numbered list:

1. first item
2. second item
3. third item

Note again how the actual text starts at 4 columns in (4 characters
from the left side). Here's a code sample:

# Let me re-iterate ...
for i in 1 .. 10 { do-something(i) }

As you probably guessed, indented 4 spaces. By the way, instead of
indenting the block, you can use delimited blocks, if you like:

~~~
define foobar() {
print "Welcome to flavor country!";
}
~~~

(which makes copying & pasting easier). You can optionally mark the
delimited block for Pandoc to syntax highlight it:

~~~python
import time
# Quick, count to ten!
for i in range(10):
# (but not *too* quick)
time.sleep(0.5)
print i
~~~



### An h3 header ###

Now a nested list:

1. First, get these ingredients:

* carrots
* celery
* lentils

2. Boil some water.

3. Dump everything in the pot and follow
this algorithm:

find wooden spoon
uncover pot
stir
cover pot
balance wooden spoon precariously on pot handle
wait 10 minutes
goto first step (or shut off burner when done)

Do not bump wooden spoon or it will fall.

Notice again how text always lines up on 4-space indents (including
that last line which continues item 3 above).

Here's a link to [a website](http://foo.bar), to a [local
doc](local-doc.html), and to a [section heading in the current
doc](#an-h2-header). Here's a footnote [^1].

[^1]: Footnote text goes here.

Tables can look like this:

size  material      color
----  ------------  ------------
9     leather       brown
10    hemp canvas   natural
11    glass         transparent

Table: Shoes, their sizes, and what they're made of

(The above is the caption for the table.) Pandoc also supports
multi-line tables:

--------  -----------------------
keyword   text
--------  -----------------------
red       Sunsets, apples, and
  other red or reddish
  things.

green     Leaves, grass, frogs
  and other things it's
  not easy being.
--------  -----------------------

A horizontal rule follows.

***

Here's a definition list:

apples
: Good for making applesauce.
oranges
: Citrus!
tomatoes
: There's no "e" in tomatoe.

Again, text is indented 4 spaces. (Put a blank line between each
term/definition pair to spread things out more.)

Here's a "line block":

| Line one
|   Line too
| Line tree

and images can be specified like so:

![example image](example-image.jpg "An exemplary image")

Inline math equations go in like so: $\\omega = d\\phi / dt$. Display
math should get its own line and be put in in double-dollarsigns:

$$I = \\int \\rho R^{2} dV$$

And note that you can backslash-escape any punctuation characters
which you wish to be displayed literally, ex.: \\\`foo\\\`, \\*bar\\*, etc.
`.trim();

export const Editor2 = () => {
    const debug = DebugReducer()

    const originalFile = OriginalFile({debug});
    const loadedFile = LoadedFile({data: originalFile.originalText.text, debug})
    const grammar = GrammarRegistry()

    const tokens = useRef<any | undefined>(undefined)
    useEffect(() => {
        grammar(loadedFile.document.getLinesContent(), 'text.html.markdown')
            .then(result => tokens.current = result)
    }, [originalFile.originalText, loadedFile.lastModified])

    return <>
        <div style={styles.container}>
            <div style={styles.sources}>
                <Panel title="File" taskbarItems={(<>
                    <Button onClick={() => originalFile.commands.addALine("atEnd")} text={"Add text at the end"}/>
                    <Button onClick={() => originalFile.commands.addALine("atBeginning")}
                            text={"Add text at the beginning"}/>
                    <Button onClick={originalFile.commands.resetText} text={"Reset text"}/>
                    <Button onClick={() => loadedFile.reloadTree()} text={"Load file"}/>
                </>)}>
                    <OriginalFilePresenter originalText={originalFile.originalText}/>
                </Panel>
                <Panel title="Plain text" taskbarItems={
                    <Button onClick={loadedFile.destroyTree} text={"Destroy tree"}/>
                }>
                    <LoadedFilePresenter loadedFile={loadedFile} debug={debug.commands}/>
                </Panel>
                <Panel title="Colorized text">
                    <TokenizedFilePresenter key={loadedFile.lastModified} tokenizer={grammar}
                                            document={loadedFile.document}/>
                </Panel>
                <Panel title="WYSIWYG"></Panel>
            </div>
            <Panel title="Debug">
                <div style={styles.debugContainer}>
                    <ShowLog style={styles.debugLog} log={debug.log}/>
                    <div style={styles.debugTokenTree}>{JSON.stringify(tokens, undefined, 2)}</div>
                </div>
            </Panel>
        </div>
    </>
}

type DocumentData = {
    getLineCount: () => number,
    getLinesContent: () => string[],
    getLineContent: (idx: number) => string
};
const TokenizedFilePresenter = (props: {
    document: DocumentData,
    tokenizer: (text: string[], scope: string) => Promise<{
        line: string,
        lineTokens: vsctm.ITokenizeLineResult
    }[] | null>
}) => {
    const [text, setText] = useState<React.ReactElement | undefined>()

    useEffect(() => {
        props.tokenizer(props.document.getLinesContent(), 'text.html.markdown')
            .then(result => {
                if ((result as []).length > 0) {
                    const html = (result as { line: string, lineTokens: vsctm.ITokenizeLineResult }[])
                        .flatMap(element => element.lineTokens.tokens
                            .map(token => `<span class="${token.scopes.map(a =>
                                a.split(".")
                                    .map(b => b.replaceAll(/^(\d*)$/g, "_$1"))
                                    .join(' ')
                            ).join(' ')}">${element.line.substring(token.startIndex, token.endIndex)}</span>`).join(""));
                    console.log("!!")
                    setText(<PrintLines classNames={"editor2 markdownColorizer"} lines={html}/>)
                } else {
                    console.log("!")
                    setText((result as any).line)
                }
            })
    }, [])
    return <>{text}</>
};

const Button = (props: { onClick?: MouseEventHandler, text: string }) => <button title={props.text}
                                                                                 style={styles.button}
                                                                                 onClick={props.onClick}>{props.text}</button>

const OriginalFilePresenter = (props: { originalText: { text: string, lastEdit: string } }) => {
    return <DivFlasher key={props.originalText.lastEdit}>{props.originalText.text}</DivFlasher>
}

type DebugProps = { commands: { appendLog: AppendLog } };
type OriginalFileProps = { debug: DebugProps };
const OriginalFile = ({debug, ...props}: OriginalFileProps) => {
    const [originalText, setOriginalText] = useState<{ text: string, lastEdit: string }>({
        text: ORIGINAL_TEXT, lastEdit: new Date().toISOString()
    })

    const resetText = () => {
        debug.commands.appendLog("Resetting text", "Original")
        setOriginalText({text: ORIGINAL_TEXT, lastEdit: new Date().toISOString()});
    }
    const addALine = (where: "atEnd" | "atBeginning") => {
        debug.commands.appendLog(`Appending a line to a text: ${where}`, "Original")
        setOriginalText(state => ({
            lastEdit: new Date().toISOString(),
            text: where === "atEnd" ? originalText.text + "\nNew line" : "New line\n" + originalText.text
        }));
    }

    return {originalText, commands: {addALine, resetText}}
}

type LoadedFileProps = { data?: string, debug: DebugProps };
const LoadedFile = (props: LoadedFileProps) => {
    const recreateRef = (st?: string) => {
        if (!st) return
        const pieceTreeTextBufferBuilder = new PieceTreeTextBufferBuilder();
        pieceTreeTextBufferBuilder.acceptChunk(st)
        const pieceTreeTextBufferFactory = pieceTreeTextBufferBuilder.finish()
        return pieceTreeTextBufferFactory.create(1)
    };
    const ref = useRef<PieceTreeBase | undefined>(recreateRef(props.data))
    const [lastModified, setLastModified] = useState<string>(new Date().toISOString())

    return {
        lastModified,
        reloadTree: () => {
            props.debug.commands.appendLog("Reloading tree", "LoadedFile")
            ref.current = recreateRef(props.data)
            setLastModified(new Date().toISOString())
        },
        document: {
            getLineCount: () => ref.current?.getLineCount() ?? 0,
            getLineContent: (idx: number) => ref.current?.getLineContent(idx) ?? "",
            insert: () => {
                props.debug.commands.appendLog("Insert", "LoadedFile")
                setLastModified(new Date().toISOString())
            },
            remove: () => {
                props.debug.commands.appendLog("Remove", "LoadedFile")
                setLastModified(new Date().toISOString())
            },
            getLinesContent: () => ref.current?.getLinesContent() ?? []
        },
        destroyTree: () => {
            props.debug.commands.appendLog("Destroying tree", "LoadedFile")
            ref.current = undefined
            setLastModified(new Date().toISOString())
        }
    }
}

const LoadedFilePresenter = (props: {
    debug: { appendLog: AppendLog },
    loadedFile: { document: DocumentData }
}) => {
    const document = Array.from({length: props.loadedFile.document.getLineCount()})
        .map((el, idx) => idx + 1)
        .map(idx => props.loadedFile.document.getLineContent(idx) ?? "")

    return <PrintLines lines={document}></PrintLines>
}

const PrintLines = (props: { lines: string[], classNames?: string }) => {
    const document = props.lines
        .map((data, idx) => {
            return (
                <>
                    <div key={idx + (data ?? "")} className="fileLine" style={styles.FileLine}>
                        <span style={styles.FileLineNumber}>{idx + 1}</span>
                        <DivFlasher>
                            <span style={styles.FileLineContent} dangerouslySetInnerHTML={{__html: data}}/>
                        </DivFlasher>
                    </div>
                </>
            );
        })
    return <div className={props.classNames} style={styles.FileLineContainer}>{document}</div>
}

const Panel = (props: PropsWithChildren<{ title: string, taskbarItems?: React.ReactElement }>) => {
    const hoverState = HoverState()
    return (
        <div style={{...styles.panel, ...(hoverState.state ? styles.panelHover : {})}}
             onMouseEnter={hoverState.onMouseEnterCallback}
             onMouseLeave={hoverState.onMouseLeaveCallback}>
            <div style={styles.panelTitle}>{props.title}</div>
            <div style={styles.panelTaskbar}>{props.taskbarItems}</div>
            <div style={styles.panelChildren}>{props.children}</div>
        </div>
    )
}

const HoverState = () => {
    const [hover, setHover] = useState(false)

    const onMouseEnterCallback = () => setHover(true)
    const onMouseLeaveCallback = () => setHover(false)

    return {
        state: hover,
        onMouseEnterCallback,
        onMouseLeaveCallback
    }
}

const DivFlasher = (props: PropsWithChildren<{ style?: CSSProperties }>) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (ref.current?.style) {
            ref.current.style.transition = "";
            ref.current.style.backgroundColor = "rgba(52,102,227,0.3)";
        }

        setTimeout(() => {
            if (ref.current?.style) {
                ref.current.style.transition = "background-color 0.1s ease";
                ref.current.style.backgroundColor = "unset"
            }
        }, 50)
    }, [])

    return <div ref={ref} style={{...styles.flasher, ...(props?.style ?? {})}}>{props.children}</div>
}

type LogLine = { data: string, time: string, tags?: string[] }

type AppendLog = (line: string, ...pills: string[]) => void;
const DebugReducer = () => {
    const [log, setLog] = useState<LogLine[]>([])
    const appendLog: AppendLog = (line, ...pills) => setLog(original => [...original, {
        data: line,
        tags: pills,
        time: new Date().toISOString()
    }])
    const commands = useRef({appendLog});

    return {log, commands: commands.current}
}

const ShowLog = (props: { log: LogLine[], style?: CSSProperties }) => {
    const reversedLog = [...props.log].reverse();
    const hashCode = (str: string) => str.split('').reduce((prevHash, currVal) =>
        (((prevHash << 5) - prevHash) + currVal.charCodeAt(0)) | 0, 0);

    const toColor = (str: string) => {
        const hash = hashCode(str)
        const r = (hash % 256) % 200 + 56
        const g = ((hash % Math.pow(256, 2)) / 256) % 200 + 56
        const b = ((hash % Math.pow(256, 3)) / 256 / 256) % 200 + 56
        return `rgba(${r}, ${g}, ${b}, 0.5)`
    }
    const logLine = (el: LogLine, i: number) => {
        const tabs = el.tags?.map(t => (
            <span key={t} style={{
                borderRadius: "0.2rem",
                marginLeft: "0.1rem",
                paddingLeft: "0.2rem",
                paddingRight: "0.2rem",
                marginRight: "0.1rem",
                backgroundColor: toColor(t)
            }}>{t}</span>))
        return <DivFlasher key={i}>[{el.time}]{tabs} {el.data}</DivFlasher>;
    };
    return (<div style={props.style}>
        {reversedLog.map(logLine)}
    </div>)
}

const GrammarRegistry = (deps: DependencyList = []) => {
    const registry = useMemo(() =>
        new vsctm.Registry({
            onigLib: fetch('onig.wasm')
                .then((response) => response.arrayBuffer())
                .then(wasmBin => oniguruma.loadWASM(wasmBin))
                .then(() => ({
                    createOnigScanner: patterns => new oniguruma.OnigScanner(patterns),
                    createOnigString: s => new oniguruma.OnigString(s)
                })),
            loadGrammar: (scopeName) => {
                if (scopeName === 'text.html.markdown') {
                    return fetch('grammars/markdown.tmLanguage')
                        .then(data => data.text())
                        .then(data => vsctm.parseRawGrammar(data.toString()))
                }
                return Promise.resolve(null);
            }
        }), []);

    return useCallback(async (text: string[], scope: string) => {
        console.log("Tokenizing...")
        const grammar = await registry.loadGrammar(scope);
        if (!grammar) {
            console.error("No grammar!");
            return null;
        }
        let ruleStack = vsctm.INITIAL;
        const results: { line: string; lineTokens: vsctm.ITokenizeLineResult | any; }[] = [];
        for (const line of text) {
            const lineTokens = grammar.tokenizeLine(line, ruleStack);
            results.push({line, lineTokens: {...lineTokens, ruleStack: undefined}});
            ruleStack = lineTokens.ruleStack;
        }
        console.log("Tokenization done");
        return results;
    }, deps)
}
