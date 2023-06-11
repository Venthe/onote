import * as React from 'react';
import * as yaml from 'js-yaml'
import { Outline } from './outline/outline';
import './page.scss'
import { clone, emptyPage, entries } from '../utilities/utilities';
import { Page as PageType, Outline as OutlineType, OutlineMetadata } from './../types/page'
import { Title } from './title';
import * as uuid from 'uuid'


// const updateOutline = (id: string, content: string, metadata): void => {
//     const outlines = [...page.outlines];
//     outlines[index] = { content, left: metadata.left, top: metadata.top, type: metadata.type, width: metadata.width, height: metadata.height };
//     setPage({ ...page, outlines });
// };

// const createNewOutline = (mousePosition: { x: number, y: number },
//     page: PageType,
//     callback: Dispatch<React.SetStateAction<PageType>>): void => {
//     console.debug("Creating new outline", mousePosition)
//     const newPage: PageType = {
//         ...page,
//         outlines: [
//             ...page.outlines,
//             {
//                 type: "markdown",
//                 content: "",
//                 height: 100,
//                 left: mousePosition.x,
//                 top: mousePosition.y
//             }
//         ]
//     };
//     callback(newPage);
// };

// const removeOutline = (index: string) => {
//     console.debug("Removing outline", index)
//     const pg2 = { ...page, outlines: page.outlines.filter((a, i) => i !== index) }
//     setPage(pg2)
// }

export type PageProps = {
    text?: string;
    isProduction?: boolean
    isDebug?: boolean
    onPageChange?: OnPageChange;
};
export type OnPageChange = (page: string) => void

export const Page = ({ text, onPageChange, isDebug = true, isProduction = true }: PageProps) => {
    if (onPageChange === undefined) {
        onPageChange = (page) => text = page
    }

    const parsePage = (text?: string) => text !== undefined ? yaml.load(text) as PageType : undefined;
    const [parsedPage, setParsedPage] = React.useState<PageType | undefined>(parsePage(text))

    React.useEffect(() => { setParsedPage(parsePage(text)) }, [text])

    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
    const updateMousePosition = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => setMousePosition({ x: e.clientX, y: e.clientY });

    const [editState, setEditState] = React.useState<string | undefined>(undefined)

    React.useEffect(() => {
        const dump = yaml.dump(parsedPage);
        if (dump.trim() === (text ?? "").trim()) return

        onPageChange?.(dump)
    }, [parsedPage])

    const createOutline = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
        if (editState !== undefined) return
        if (!parsedPage) return
        if (e.target !== e.currentTarget) return;
        // createNewOutline(mousePosition, page, setPage);
        console.debug("Creating outline at", mousePosition, editState)

        let newPage: PageType = clone(parsedPage)
        const newLocal = uuid.v4();
        newPage.outlines[newLocal] = {
            content: "",
            metadata: {
                left: mousePosition.x,
                top: mousePosition.y,
                type: "markdown"
            }
        }
        setEditState(newLocal)
        setParsedPage(newPage)
    };

    const updatePage = (outline: { content: string, metadata: OutlineMetadata }, id: string) => {
        if (!parsedPage) return
        console.debug("Page", "updatePage", id, outline.content)
        // Poor man's clone
        const newPage: PageType = clone(parsedPage)

        if (outline.content.trim() === "") {
            delete newPage.outlines[id]
        } else {
            newPage.outlines[id] = clone(outline)
        }
        setParsedPage(newPage)
    }

    const displayOutline = entries<OutlineType>(parsedPage?.outlines ?? []).map(({ key, value }: { key: string, value: OutlineType }) =>
        <Outline debug={isDebug}
            key={key}
            id={key}
            onEditStart={() => { setEditState(key); }}
            onEditStop={(event, content) => {
                // Ugly hack. There is a race condition between onBlur inside the outline, and onClick on a page.
                //  onClick "thinks" that we are no longer editing, and as such allows to create a new outline on blur which
                //  also causes issues with stale data on update page
                setTimeout(() => setEditState(undefined), 100);
                updatePage({ content, metadata: value.metadata }, key)
            }}
            onMetadataUpdate={(metadata) => { console.debug("Page", "Metadata updated", metadata); updatePage({ content: value.content, metadata }, key) }}
            editable={editState === key}
            outline={value}
        // onOutlineChange={(content, metadata) => updateOutline(key, content, metadata)}
        />
    )

    const debugMousePosition = isDebug ?
        <div className="page__debug"><pre>X: {mousePosition.x}, Y: {mousePosition.y}</pre><div>Currently editing: {editState}</div></div>
        : <></>

    if (!parsedPage) {
        return emptyPage;
    }

    return (
        <>
            <div className="page"
                onMouseMove={updateMousePosition}
                onClick={createOutline}
            >
                <Title title={parsedPage.metadata.title}
                    created={parsedPage.metadata.created} />
                {displayOutline}
                {debugMousePosition}
            </div>

        </>
    );
};