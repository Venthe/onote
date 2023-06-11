import "./outline.scss";
import { Resizable, ResizableBox, ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { OutlineMetadata, Outline as OutlineType } from '../../types/page';
import { classes } from '../../utilities/utilities';
import { RefObject, createRef, useEffect, useRef, useState } from 'react';
import React from 'react';
import { rendererFactory } from './renderers/factory';

export type NProps = {
    outline: OutlineType;
    debug: boolean;
    id: string
    editable?: boolean
    onEditStart?: () => void;
    onEditStop?: (event: React.FocusEvent<HTMLPreElement, Element>, content: string) => void;
    onMetadataUpdate?: (metadata: OutlineMetadata) => void;
    defaultHeight?: number
    defaultWidth?: number
};

function drawEditableContent(inputReference: any, content: any, onEditStop?: (event: React.FocusEvent<HTMLPreElement, Element>, content: string) => void, onContentChange?: any) {
    const blur = (e: React.KeyboardEvent<HTMLPreElement>): void => { if (e.key === "Escape") { e.currentTarget.blur(); } };

    const stopEdit = (e: React.FocusEvent<HTMLPreElement, Element>): void => {
        onEditStop?.(e, e.target.innerText);
    };
    return <pre ref={inputReference}
        contentEditable={true}
        className='outline__editable-box'
        onBlur={stopEdit}
        onKeyUp={blur}
        onInput={() => onContentChange?.()}
        // Why it's needed?
        suppressContentEditableWarning={true}
    >{content}</pre>;
}

function drawReadOnlyContent(content: string, type: string) {
    return rendererFactory(type)(content)
}

export const Outline = ({ outline, debug, id, editable = false, defaultHeight = 100, defaultWidth = 100, ...rest }: NProps) => {
    const [hover, setHover] = useState(false)
    const [resize, setResize] = useState(false)

    const inputReference = useRef<HTMLPreElement | null>(null);
    const contentContainerReference: RefObject<HTMLDivElement> = createRef()
    const contentReference: RefObject<HTMLDivElement> = createRef()
    const debugInfoReference: RefObject<HTMLDivElement> = createRef()

    const calculateHeight = () => (contentContainerReference?.current?.clientHeight ?? defaultHeight) + (debugInfoReference?.current?.clientHeight ?? 0)

    const [height, setHeight] = useState<number>(calculateHeight())
    const [width, setWidth] = useState<number>(outline.metadata.width ?? defaultWidth)

    const adjustSize = () => {
        setWidth(contentContainerReference?.current?.clientWidth ?? defaultWidth)
    }

    useEffect(() => {
        // console.debug("Outline", "Width changed, calculating height")
        setHeight(calculateHeight())
    })

    useEffect(() => {
        if (inputReference == null || !inputReference.current) return;
        adjustSize()
        if (!editable) return

        console.debug("Outline", "Focusing on outline", id)
        inputReference.current.focus()
    }, [editable]);

    const infoBox = debug ? (
        <div className='outline__debug' ref={debugInfoReference}>
            <div>top: {outline.metadata.top}</div>
            <div>left: {outline.metadata.left}</div>
            <div>width: {width}</div>
            <div>height: {height}</div>
            <div>type: {outline.metadata.type}</div>
            <div>ID: {id}</div>
            <input onBlur={(e) => rest.onMetadataUpdate?.({ ...outline.metadata, type: e.target.value })} type="Text" placeholder="Outline type"></input>
        </div>
    ) : (<></>)

    const notifyNewHeight = () => {
        adjustSize()
        rest.onMetadataUpdate?.({ ...outline.metadata, width })
    };
    const printContent = !editable ?
        drawReadOnlyContent(outline.content, outline.metadata.type) :
        drawEditableContent(inputReference,
            outline.content,
            (e, content) => { rest.onEditStop?.(e, content) },
            () => { setHeight(calculateHeight()) }
        )


    const updateOutlinePosition = (e: DraggableEvent, d: DraggableData): void => { rest.onMetadataUpdate?.({ ...outline.metadata, left: d.x, top: d.y }) };
    const editContent = () => { rest.onEditStart?.() };

    return (
        <Draggable defaultPosition={{ x: outline.metadata.left, y: outline.metadata.top }}
            onStop={updateOutlinePosition}
            handle=".outline__drag-handle">
            <ResizableBox
                className={classes(
                    "outline",
                    hover || resize || editable ? "outline--hover" : undefined
                )}
                minConstraints={[100, 100]}
                width={width}
                height={height}
                onResizeStart={() => setResize(true)}
                onResizeStop={() => { setResize(false); notifyNewHeight(); }}
                onResize={() => adjustSize()}
                axis='x'>
                <div onMouseOver={() => setHover(true)}
                    onMouseOut={() => setHover(false)}
                    ref={contentContainerReference}>
                    <div className={classes(
                        "outline__drag-handle",
                        hover || resize || editable ? "outline__drag-handle--hover" : undefined
                    )}>{"<>"}</div>
                    <div onClick={editContent} className='outline__content-wrapper' >
                        <div className='outline__content'
                            ref={contentReference}>{printContent}</div>
                    </div>
                    {infoBox}
                </div>
            </ResizableBox>
        </Draggable >
    );
}
