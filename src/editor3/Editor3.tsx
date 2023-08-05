import React, {CSSProperties, PropsWithChildren, useEffect, useMemo, useRef, useState} from 'react'
import * as yaml from 'js-yaml'
import ReactDOMServer from 'react-dom/server';
import * as uuid from 'uuid'
import './Editor3.scss'
import {Document} from "./visual-editor/types";
import * as VisualEditorDocument from './visual-editor/document'
import * as VisualEditor from './visual-editor/editor'

const styles: Record<string, CSSProperties> = {
    editorToolbar: {
        backgroundColor: "white"
    },
    editorContainer: {
        display: "grid",
        gridTemplateColumns: "1fr",
        gridTemplateRows: "2rem 1fr 1.5rem",
        height: "100%"
    },
    editorStatusBar: {
        backgroundColor: "lightgray"
    },
    editorCanvas: {
        backgroundColor: "wheat",
        whiteSpace: "break-spaces",
        overflow: "hidden",
        overflowY: "scroll",
        scrollbarGutter: "stable",
        scrollbarWidth: "thin",
        padding: '10px',
        boxSizing: "border-box"
    },
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
        gridTemplateColumns: "repeat(3, 1fr)",
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
    debugLog: {
        height: "100%",
        whiteSpace: "break-spaces",
        overflow: "hidden",
        overflowY: "auto",
        scrollbarGutter: "stable",
        scrollbarWidth: "thin",

    }
}

export const Editor3 = () => {
    const debug = DebugReducer()

    const doc = useRef((() => {
        const originalModel: Document = {
                type: "document",
                id: uuid.v4().toString(),
                elements: [
                    {
                        type: "paragraph",
                        id: uuid.v4().toString(),
                        elements: [
                            {
                                content: "The hobbit was a very well-to-do-hobbit, and his name was baggins",
                                id: uuid.v4().toString(),
                                markups: [
                                    {
                                        type: "link",
                                        start: 4,
                                        end: 10,
                                        properties: {
                                            url: "http://en.wikipedia.org/wiki/The_Hobbit"
                                        }
                                    },
                                    {
                                        type: "bold",
                                        start: 58,
                                        end: 63
                                    },
                                    {
                                        type: "italic",
                                        start: 59,
                                        end: 65
                                    }
                                ]
                            },
                            {
                                content: "The image:  ",
                                id: uuid.v4().toString(),
                                embeds: [
                                    {
                                        id: "1",
                                        position: 11,
                                        type: "image",
                                        properties: {
                                            source: "https://picsum.photos/200/300"
                                        }
                                    },
                                    {
                                        id: "2",
                                        position: 12,
                                        type: "image",
                                        properties: {
                                            source: "https://picsum.photos/150/300"
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ;

        return new VisualEditorDocument.Document(originalModel);
    })());

    const document = doc.current

    const [id, setId] = useState(uuid.v4())
    return <>
        <div style={styles.container}
             key={id}>
            <div style={styles.sources}>
                <Panel title="Plain text">
                    <pre>{document.dump(yaml.dump)}</pre>
                </Panel>
                <Panel title="Generated DOM">
                    <pre
                        style={{wordBreak: "break-word", width: "100%", overflow: "scroll", height: "100%", boxSizing: "border-box"}}>{document.toDOM()}</pre>
                </Panel>
                {/*<Panel title="REACT DOM"><ElementToString><VisualEditor.Editor*/}
                {/*    document={document}/></ElementToString></Panel>*/}
                <Panel title="WYSIWYG"><VisualEditor.Editor debug={debug} refreshCallback={() => setId(uuid.v4())}
                                                            document={document}/></Panel>
            </div>
            <Panel title="Debug">
                <ShowLog style={styles.debugLog} log={debug.log}/>
            </Panel>
        </div>
    </>
}


const ElementToString = (props: PropsWithChildren) => <>{ReactDOMServer.renderToStaticMarkup(<>{props.children}</>)}</>

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

export const WysiwygEditor = () => {
    const actions = useMemo(() => ({
        bold: (input: string) => (<strong>input</strong>)
    }), [])

    return (
        <div style={styles.editorContainer}>
            <div style={styles.editorToolbar}></div>
            <div style={styles.editorCanvas} contentEditable={true}></div>
            <div style={styles.editorStatusBar}></div>
        </div>
    )
}
