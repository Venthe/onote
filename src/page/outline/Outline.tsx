import React, {
  MouseEventHandler,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import './Outline.scss'
import { IEditableRenderer } from './renderers/EditableRenderer';
import { IReadOnlyRenderer } from './renderers/ReadOnlyRenderer';
import { Renderer } from './renderers/Renderer';
import { CurrentlyEditingStateContext, DirtyOutlineCommandsContext } from '../../components/context/documentContext';
import { DragContext } from '../../components/context/dragContext';
import { DebugContext } from '../../components/context/editorContext';
import { FileUpload } from '../../components/components/FileUpload';
import { Button, isButton } from '../../utilities/mouse';

export type IAttachments = {
  [key: string]: string;
};

export interface IOutline {
  content: string
  metadata: IOutlineMetadata
  attachments?: IAttachments
}

export interface IOutlineMetadata {
  left: number
  top: number
  width?: number
  type?: string
}

type OnDirtyChange = (changedData: { width?: number, left?: number, top?: number, content?: string }) => void;
type OnCommit = OnDirtyChange;

export interface IOutlineProps {
  editable?: boolean
  outline: IOutline
  readOnlyRenderers: IReadOnlyRenderer[]
  editableRenderers: IEditableRenderer[]
  onEditStart?: () => void;
  onDirtyChange?: OnDirtyChange;
  onCommit?: OnCommit;
}

export const Outline = forwardRef<{ getHeight: () => number }, IOutlineProps>(({ editable = false, ...props }, ref) => {
  const id = useId();
  const debug = useContext(DebugContext) ?? false
  const [hover, setHover] = useState<boolean>(false)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const { startDrag, startResize, resized, dragged, position, width } = useSizingAndPosition({
    commit: props.onCommit,
    dirtyChange: props.onDirtyChange,
    width: props.outline.metadata.width ?? 100,
    startingPosition: {
      x: props.outline.metadata.left,
      y: props.outline.metadata.top
    },
    id
  })
  const showOutline = showOutlineEffect(hover, dragged, resized);
  const currentlyEditing = useContext(CurrentlyEditingStateContext)
  const dirtyOutlineCommandsContext = useContext(DirtyOutlineCommandsContext)

  useImperativeHandle(ref, () => ({
    getHeight: () => contentRef.current?.getBoundingClientRect().y ?? 100
  }))

  const startEdit: MouseEventHandler<any> = (e) => {
    if (editable) return
    // To allow handling links
    if (e.ctrlKey) return
    if (isButton(e.buttons, Button.AUXILLARY_BUTTON)) {
      console.debug("MMB pressed, stopping")
      return
    }
    e.stopPropagation()
    e.preventDefault()
    if (currentlyEditing) {
      dirtyOutlineCommandsContext.commit(currentlyEditing.id)
    }
    props.onEditStart?.();
  };
  const handleHoverIn = () => setHover(true);
  const handleHoverOut = () => setHover(false);

  return (
    <>
      <div className="outline__position-origin outline" data-v-position={id} style={{ pointerEvents: currentlyEditing && !dragged && !editable && !resized ? "none" : "auto" }}>

        <div onMouseEnter={handleHoverIn} onMouseLeave={handleHoverOut} className={`outline__container ${editable && "outline__container--selected"} ${showOutline && "outline__container--hover"}`}>
          <div onMouseDown={startDrag} className={`outline__title-container ${editable && "outline__title-container--selected"} ${showOutline && "outline__title-container--hover"}`}>
            <span onMouseDown={startResize} className={`outline__resize-handle ${editable && "outline__resize-handle--selected"} ${showOutline && "outline__resize-handle--hover"}`} />
          </div>
          <div onMouseDown={startResize} className={`outline__resize ${debug && "outline__resize--debug"}`}></div>
          <div onMouseDownCapture={startEdit}
            ref={contentRef}
            className="outline__content"
            data-v-width={id}>
            <Renderer content={props.outline.content}
              editableRenderers={props.editableRenderers}
              readOnlyRenderers={props.readOnlyRenderers}
              editable={!dragged && !resized && editable}
              onDirtyChange={content => props.onDirtyChange?.({ content })}
              type={props.outline.metadata.type} />
          </div>
          <FileUpload enabled={editable} handleFiles={(files) => {
            console.log("Upload", files)
            function getBase64(file: File) {
              return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
              });
            }
            const parsed = Array.from(files ?? []).map(file => getBase64(file))
            Promise.all(parsed).then(data => console.log(data))
          }} />
          {(debug && showOutline) && <DebugInfo className="outline__debug-info-container"
            {...{ isDragged: dragged, isResized: resized, editable, box: { ...({ left: position.current.x, top: position.current.y }), width: width.current }, type: props.outline.metadata.type }} />}
        </div>
      </div>
    </>
  );
})
Outline.displayName = "Outline"

const useSizingAndPosition = (props: { commit?: OnCommit, dirtyChange?: OnDirtyChange, width: number, startingPosition: { x: number, y: number }, id: string }) => {
  const dragContext = useContext(DragContext)

  const [dragged, setDragged] = useState(false);
  const [resized, setResized] = useState(false)
  const position = useRef({ x: props.startingPosition.x, y: props.startingPosition.y });
  const width = useRef(props.width);

  useEffect(() => {
    dragContext.setPosition(props.id, props.startingPosition)
    dragContext.setWidth(props.id, width.current)
    return () => dragContext.removeId(props.id)
  }, [])

  useEffect(() => {
    function updatePosition(e: any) {
      if (!dragged) return;
      e.stopPropagation();

      position.current.x = position.current.x + e.movementX;
      position.current.y = position.current.y + e.movementY;

      dragContext.setPosition(props.id, position.current);
      props.dirtyChange?.({ left: position.current.x, top: position.current.y });
    }

    function stopDragging(e: any) {
      if (!dragged) return;
      e.stopPropagation();
      setDragged(false);
      props.commit?.({ left: position.current.x, top: position.current.y });
    }

    if (!dragged) return
    window.addEventListener("mousemove", updatePosition);
    window.addEventListener("mouseup", stopDragging, { capture: true });

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      window.removeEventListener("mouseup", stopDragging, { capture: true });
    };
  }, [dragged])

  useEffect(() => {
    function updateWidth(e: any) {
      if (!resized) return;
      e.stopPropagation();

      width.current = width.current + e.movementX;
      dragContext.setWidth(props.id, width.current);
      props.dirtyChange?.({ width: width.current });
    }

    function onResizeUp(e: any) {
      if (!resized) return;
      e.stopPropagation();
      setResized(false);
      props.commit?.({ width: width.current });
    }

    if (!resized) return
    window.addEventListener("mouseup", onResizeUp, { capture: true });
    window.addEventListener("mousemove", updateWidth);

    return () => {
      window.removeEventListener("mouseup", onResizeUp, { capture: true });
      window.removeEventListener("mousemove", updateWidth);
    };
  }, [resized])

  const startResize: MouseEventHandler<any> = useCallback((e) => { e.stopPropagation(); e.preventDefault(); setResized(true) }, [])
  const startDrag = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => { e.stopPropagation(); e.preventDefault(); setDragged(true); }, []);

  return { startDrag, dragged, startResize, resized, position, width }
}

const DebugInfo = (props: { editable: boolean, isDragged: boolean, isResized: boolean, type?: string, box: { width: number, left: number, top: number }, className?: string }) => <div className={props.className}>
  <table>
    <tbody>
      <tr>
        <td>Left: {props.box.left}</td>
        <td>Top: {props.box.top}</td>
      </tr>
      <tr>
        <td>Width: {props.box.width}</td>
        <td></td>
      </tr>
      <tr>
        <td>Is dragging: {props.isDragged.toString()}</td>
        <td>Is resizing: {props.isResized.toString()}</td>
      </tr>
      <tr>
        <td>Is Editable: {props.editable.toString()}</td>
        <td>Type: {props.type}</td>
      </tr>
    </tbody>
  </table>
</div>;

const showOutlineEffect = (...propositions: boolean[]) => propositions.some(a => a === true)
