import React, {createContext, PropsWithChildren, useCallback, useMemo, useRef, useState} from "react"
import {DragContextProvider} from "./dragContext"
import * as uuid from 'uuid'
import {IPage} from "../../page/Page"
import {clone} from "../../utilities/utilities"
import {IOutline, IOutlineMetadata} from "../../page/outline/Outline"
import {TokenizerContextProvider} from "./tokenizerContext";

type PartialOutline = Partial<Omit<IOutline, "metadata">> & { metadata?: Partial<IOutlineMetadata> }
export type StartEdit = (id: string) => void
export type CreateOutline = (outline: IOutline) => string | undefined
export type Commit = (id: string) => void
export type DirtyChange = (id: string, outline: PartialOutline) => void

export interface DirtyOutlineCommands {
    startEdit: StartEdit
    createOutline: CreateOutline
    commit: Commit
    dirtyChange: DirtyChange
}

export const PageContext = createContext<IPage | undefined>(undefined)
type Id = {
    id: string
}

export const DirtyOutlineContext = createContext<(PartialOutline & Id) | undefined>(undefined)
const notInitialized = (name: string) => () => {
    throw new Error(`${name} not initialized`)
}
export const DirtyOutlineCommandsContext = createContext<DirtyOutlineCommands>({
    startEdit: notInitialized("startEdit"),
    createOutline: notInitialized("createOutline"),
    commit: notInitialized("commit"),
    dirtyChange: notInitialized("dirtyChange"),
})

export const CurrentlyEditingStateContext = createContext<{
    id: string,
    documentType: string | undefined
} | undefined>(undefined)

// TODO: Undo/redo
export const DocumentContextProvider = (props: PropsWithChildren<{
    page?: IPage,
    onCommit?: (page: IPage) => void
}>) => {
    const [currentlyEditingState, setCurrentlyEditingState] = useState<{
        id: string,
        documentType: string | undefined
    } | undefined>(undefined)
    const dirtyOutlines = useRef<(PartialOutline & Id) | undefined>(undefined)

    // FIXME: Sometimes, blank outline is created while original outline is still editted.
    //  commiting will remove original outline
    const commit = useCallback<Commit>((id) => {
        if (!dirtyOutlines.current) {
            console.warn(`Can't commit outline ${id}. Outline has no changes`)
            return
        }

        const c = dirtyOutlines.current
        console.debug("DocumentContext", "commit", id)

        const pageClone: IPage = clone(props.page as IPage)
        if (!pageClone.outlines[id]) {
            console.debug("DocumentContext", "commit", "create", id,)
            pageClone.outlines[id] = c as IOutline // Assumption: IOutline is complete
        } else if ((c.content !== undefined && c.content.trim().length === 0)) {
            console.debug("DocumentContext", "commit", "delete", id,)
            delete pageClone.outlines[id]
        } else {
            console.debug("DocumentContext", "commit", "modify", id,)
            pageClone.outlines[id] = {
                ...pageClone.outlines[id],
                ...(c.content ? {content: c.content} : {}),
                metadata: {
                    ...pageClone.outlines[id].metadata,
                    ...(c.metadata?.left ? {left: c.metadata?.left} : {}),
                    ...(c.metadata?.top ? {top: c.metadata?.top} : {}),
                    ...(c.metadata?.width ? {width: c.metadata?.width} : {}),
                    ...(c.metadata?.type ? {type: c.metadata?.type} : {})
                }
            }
        }

        props.onCommit?.(pageClone)
        dirtyOutlines.current = undefined
        setCurrentlyEditingState(_ => undefined)
    }, [props.page, props.onCommit])
    const startEdit = useCallback<StartEdit>((id) => {
        console.debug("DocumentContext", "startEdit", id)
        dirtyOutlines.current = {id}
        setCurrentlyEditingState(_ => ({id, documentType: props.page?.outlines[id]?.metadata.type}))
    }, [props.page])
    const dirtyChange = useCallback<DirtyChange>((id, o) => {
        if (!dirtyOutlines.current) {
            startEdit(id)
        }
        const outline = clone(o)
        console.debug("DocumentContext", "dirtyChange", id, outline)

        let outlineCopy = clone(dirtyOutlines.current as object)
        const metadata = {...(outlineCopy.metadata ?? {}), ...(outline.metadata ?? {})}
        outlineCopy = {
            ...outlineCopy,
            ...(outline.content !== undefined ? {content: outline.content} : {}),
            ...(outlineCopy.metadata || outline.metadata ? {metadata} : {})
        }
        dirtyOutlines.current = outlineCopy
    }, [props.page])

    const createOutline = useCallback<CreateOutline>((o) => {
        if (dirtyOutlines.current) return

        const outline = clone(o)
        console.group("createOutline")
        const id = uuid.v4()
        console.debug("DocumentContext", "createOutline", id, outline)
        dirtyOutlines.current = outline
        commit(id)
        dirtyChange(id, outline)
        console.groupEnd()
        return id
    }, [props.page])

    const dirtyOutlineCommands = useMemo(() => ({
        commit,
        dirtyChange,
        startEdit,
        createOutline
    }), [props.page, props.onCommit])

    return (
        <TokenizerContextProvider>
            <DragContextProvider>
                <PageContext.Provider value={props.page}>
                    <DirtyOutlineCommandsContext.Provider value={dirtyOutlineCommands}>
                        <DirtyOutlineContext.Provider value={dirtyOutlines.current}>
                            <CurrentlyEditingStateContext.Provider value={currentlyEditingState}>
                                {props.children}
                            </CurrentlyEditingStateContext.Provider>
                        </DirtyOutlineContext.Provider>
                    </DirtyOutlineCommandsContext.Provider>
                </PageContext.Provider>
            </DragContextProvider>
        </TokenizerContextProvider>
    )
}

