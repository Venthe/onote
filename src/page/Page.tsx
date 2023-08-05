import styles from './Page.module.css'
import { Title } from './Title';
import { IOutline, IOutlineMetadata, Outline } from './outline/Outline';
import {
  CSSProperties,
  useEffect,
  useRef,
  useState,
  MouseEventHandler,
  PropsWithChildren,
  LegacyRef,
  KeyboardEventHandler,
  useContext,
  useId
} from 'react';
import React from 'react';
import { entries } from '../utilities/utilities';
import { IReadOnlyRenderer } from './outline/renderers/ReadOnlyRenderer';
import { IEditableRenderer } from './outline/renderers/EditableRenderer';
import { PageContext, DirtyOutlineCommandsContext, CurrentlyEditingStateContext } from '../components/context/documentContext';
import { DebugContext } from '../components/context/editorContext';
import { useAspectRatio } from '../components/hooks/useAspectRatio';
import { useMousePosition } from '../components/hooks/useMousePosition';
import { Button, isButton } from '../utilities/mouse';

export type TextSelectionOptions = "selection" | "caret" | "paragraph"
export type SelectionAfterAction = "caret" | "wrap";
export type Replacer = (content: string, props?: Record<string, string>) => string

// Implement basic AST to allow detection of e.g. is bold
export type ReadOnlyDocumentTree = any;
export type ReplaceText = (type: TextSelectionOptions, selectionAfterAction?: SelectionAfterAction) => (replacer: Replacer) => void;

export interface Commands {
  replaceText: ReplaceText
}

export type OnPageChange = (page: IPage) => void
export type OnEditorMetadata = (data: any) => void
export interface IPage {
  version: 1
  kind: "document/open-note"
  metadata: IPageMetadata
  outlines: { [key: string]: IOutline }
}

export interface IPageMetadata {
  title?: string
  created: string
  lastUpdated: string
}

export type EditorMetadata = {
  scale: number;
  outline?: {
    id: string,
    type?: string
  }
};

export type PageProps = PropsWithChildren<{
  id?: string
  readOnlyRenderers: IReadOnlyRenderer[];
  editableRenderers: IEditableRenderer[];
}>;

export const Page = (props: PageProps) => {
  const page = useContext(PageContext)

  if (page === undefined) {
    return <div className={styles.NoPageContainer}>{props.children}</div>
  }

  const debug = useContext(DebugContext)
  const documentCommands = useContext(DirtyOutlineCommandsContext)
  const outlineRef = useRef<any>({})
  const originRef = useRef<HTMLDivElement | null>(null)
  const mousePosition = useMousePosition(originRef?.current ?? undefined) ?? { x: 0, y: 0 }
  const currentlyEditing = useContext(CurrentlyEditingStateContext)
  const id = useId()
  const finalId = props.id ?? id
  const scale = handleScaling(finalId)

  const commitEscape = (e: React.KeyboardEvent<any>): void => {
    if (e.key === "Escape" && currentlyEditing) {
      documentCommands?.commit(currentlyEditing.id)
    }
  };
  const handleViewportClick: MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target !== e.currentTarget) return;
    if (isButton(e.buttons, Button.AUXILLARY_BUTTON)) {
      console.debug("MMB pressed, stopping")
      return
    }

    if (currentlyEditing) {
      documentCommands?.commit(currentlyEditing.id)
    } else {
      const nl = {
        metadata: {
          left: mousePosition.x,
          // Where 14 is CSS content padding
          top: mousePosition.y - 14 - 14,
          type: "markdown"
        },
        content: ""
      };
      documentCommands?.createOutline(nl);
    }
  };

  const outlines = entries<IOutline>(page.outlines ?? {})
    .map(({ key: outlineId, value }: { key: string, value: IOutline }) => <Outline
      ref={el => outlineRef.current[outlineId] = el}
      editable={currentlyEditing?.id === outlineId}
      key={outlineId}
      onDirtyChange={(data) => documentCommands.dirtyChange(outlineId, { content: data.content, metadata: { left: data.left, top: data.top, width: data.width } })}
      onEditStart={() => documentCommands?.startEdit(outlineId)}
      onCommit={() => documentCommands?.commit(outlineId)}
      editableRenderers={props.editableRenderers}
      readOnlyRenderers={props.readOnlyRenderers}
      outline={value} />
    )

  const calculate = (clc: any, fn: (a: IOutlineMetadata) => any) => clc(...entries<IOutline>(page.outlines).map(a => a.value).map(a => a.metadata).map(fn));
  const topLeft = { x: calculate(Math.min, a => a.left), y: calculate(Math.min, a => a.top) }
  const bottomRight = { x: 0, y: 0 }
  // const bottomRight = { x: calculate(Math.max, a => a.width ?? 0 + a.left), y: 0 }//Math.max(...entries<{getHeight: () => number }>(outlineRef.current ?? {}).map(a => a?.value.getHeight() ??0 + page.outlines[a.key]?.metadata.top ?? 0)) }

  return (
    <ViewRegionContainer id={finalId} onKeyUp={commitEscape}>
      <PageContentContainer id={finalId}
        originRef={originRef}
        onClick={(e) => handleViewportClick(e)}
        isDebug={debug}
        topLeft={topLeft}
        bottomRight={bottomRight}
        scale={scale}>
        <Title {...page.metadata} {/* onChange={data => { updateTitle(data.title) }} */...{}} />
        {outlines}
      </PageContentContainer>
    </ViewRegionContainer>
  );
};

const PageContentContainer = (
  { isDebug = false, scale = 1, ...props }: PropsWithChildren<{
    originRef?: LegacyRef<any>,
    onClick?: MouseEventHandler<HTMLDivElement>,
    id?: string,
    isDebug: boolean,
    scale?: number,
    topLeft: { x: number, y: number },
    bottomRight: { x: number, y: number }
  }>
) => {
  const aspect = useAspectRatio()

  const originStyle: CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: '0% 0% 0px',
    left: Math.abs(props.topLeft.x) + (50 * aspect),
    top: Math.abs(props.topLeft.y) + 50,
    ...(isDebug ? { outline: "3px solid rgba(0,255,0,0.5)" } : {})
  };
  const rightBottomStyle: CSSProperties = {
    width: "1px",
    height: "1px",
    position: "absolute",
    left: `${props.bottomRight.x + (100 * aspect)}px`,
    top: `${props.bottomRight.y + 100}px`,
    ...(isDebug ? { outline: "3px solid rgba(255,0,0,0.5)" } : {})
  };
  return (
    <div id={styles.WACViewPanel} className={styles.WACViewPanel_} onMouseDown={props.onClick}>
      <div style={originStyle} ref={props.originRef} className={styles.PageContentOrigin}>
        <div id={styles.PageContentContainer}>
          {props.children}
        </div>
        {/* TODO: Scroll to moved element */}
        <div style={rightBottomStyle} id="BottomRightPin"></div>
      </div>
    </div>
  );
}

const ViewRegionContainer = (props: PropsWithChildren<{ id?: string, onKeyUp: KeyboardEventHandler<any> }>) => (
  <div id={props.id} onKeyUp={props.onKeyUp}>
    <div id={styles.EditorContainerRegion} className={styles.Region}>
      <div id={styles.CanvasWrap} className={styles.wacFlexBox__wacCanvas}>
        <div id={styles.WacDocumentPanel} className={styles.WacDocumentPanel_}>
          <div id={styles.WACDocumentPanelContent} className={styles.WACDocumentPanelContent}>
            <div id={styles.WACViewPanelContainer} className={styles.WACViewPanelContainer_}>
              {props.children}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// TODO: Add zero-ing of the scale
// TODO: Add scale to mouse/selection
const handleScaling = (id?: string) => {
  const [scale, setScale] = useState(1)
  // To work with firefox (and prevent non-passive window scale)
  //  I use traditional event listener

  const findParent = (ev: any, id: any): boolean => {
    if (!ev) return false
    if (ev.id === id) return true
    if (ev.parentElement === undefined) return false
    return findParent(ev.parentElement, id)
  }

  useEffect(() => {
    const scaleWindow = (e: any) => {
      if (!e.ctrlKey) return;
      if (!findParent(e.target, id)) return;
      e.stopPropagation()
      e.preventDefault();
      const mod = -Math.sign(e.deltaY) * 0.1;
      setScale(scale => scale + mod)
    }

    window.addEventListener("wheel", scaleWindow, { passive: false })

    return () => {
      window.removeEventListener("wheel", scaleWindow)
    }
  }, [id])

  return scale
}
