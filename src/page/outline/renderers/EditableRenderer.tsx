import React, { useRef, MutableRefObject, useContext, useLayoutEffect, useCallback, useMemo } from "react"
import { ReplaceText, Replacer, TextSelectionOptions } from "../../Page"
import { CommandRegistryContext } from "../../../components/context/commandContext";
import { MousePosition } from "../../../components/context/editorContext";

export type EditableRendererProps = {
  content: string;
  type?: string, editableRenderers?: IEditableRenderer[]
  onDirtyChange?: (c: string) => void
};

export type IEditableRenderer_<T extends HTMLElement = HTMLElement> = (props: EditableRendererProps, ref: MutableRefObject<T>) => JSX.Element;
export type IEditableRenderer = {
  type?: string
  render: IEditableRenderer_
}

export const EditableRenderer = (props: EditableRendererProps) => {
  const inputRef = useRef<HTMLElement>(null);
  const initialContent = useRef(props.content);
  const commandRegistry = useContext(CommandRegistryContext)

  const initialSelectionDone = useRef(false)
  const mousePosition = useContext(MousePosition);
  useLayoutEffect(() => {
    if (!inputRef.current || initialSelectionDone) return
    inputRef.current?.focus()
    usePlaceCaretNearCursor(initialSelectionDone, mousePosition, inputRef);
  })

  const handleChange = (data: string) => {
    // console.debug("EditableRenderer", "handleChange");
    props.onDirtyChange?.(data);
  }

  const replaceText: ReplaceText = useCallback((type, selectionAfterAction): (replacer: Replacer) => void => (replacer) => {
    console.debug("EditableRenderer", "replaceText", type, selectionAfterAction);
    const selection = window.getSelection();
    if (selection == null || !inputRef || !inputRef.current || !inputRef.current.textContent) {
      return;
    }
    const { content: content_, selection: { start, end } } = updateText({ type, replacer, selection, content: inputRef.current.textContent });
    inputRef.current.textContent = content_;
    selectText(inputRef.current, start, end);
    handleChange(content_);
  }, []);

  useMemo(() => commandRegistry.registerReplaceTextCallback?.(replaceText), [])

  const Renderer = pickRenderer(props)
  if (!Renderer) return <>No editable renderer avialable for type {props.type}</>
  return <Renderer {...{ ref: inputRef, onChange: handleChange, content: initialContent.current }}></Renderer>
}

const pickRenderer = (props: EditableRendererProps & { type?: string | undefined; editableRenderers?: IEditableRenderer[] | undefined; onDirtyChange?: ((c: string) => void) | undefined; onEditStop?: (() => void) | undefined; }) =>
  (props.editableRenderers ?? [])
    .filter(r => r.type === props.type || r.type === undefined)
    .map(r => r.render)[0]

type UpdateTextProps = {
  content: string;
  type: TextSelectionOptions;
  replacer: Replacer;
  selection: Selection;
};

const updateText = ({ type, selection, content, replacer }: UpdateTextProps): { content: string, selection: { start: number, end: number } } => {
  switch (type) {
    case "selection":
      return updateSelectionText(selection, replacer, content);
    case "caret":
      return updateCaretText(selection, replacer, content);
    case "paragraph":
      return updateParagraphText(selection, content, replacer);
    default:
      throw new Error("Invalid selection type! " + type)
  }
}

function usePlaceCaretNearCursor(initialSelectionDone: any, mousePosition: any, inputRef: React.RefObject<HTMLElement>) {
  // TODO: Use binary search to speed things up :)
  if (!initialSelectionDone.current) {
    if (inputRef.current && mousePosition) {
      const textNode = inputRef.current.childNodes[0];
      if (textNode) {
        const range = document.createRange();
        range.selectNode(textNode);

        const dist = (ax: number, ay: number, bx: number, by: number) => Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
        let bestMatch: { dist: number; index: number; } | undefined = undefined;
        for (let i = 0; i < inputRef.current.innerText.length - 1; i++) {
          const rng = document.createRange();
          rng.setStart(textNode, i);
          rng.setEnd(textNode, Math.min(i + 1));
          const charRect = rng.getBoundingClientRect();
          const dist_ = dist(mousePosition.x, mousePosition.y, charRect.left, charRect.top);
          if (!bestMatch || dist_ < bestMatch.dist) {
            bestMatch = { dist: dist_, index: i };
          }
        }

        if (bestMatch) {
          const rng = document.createRange();
          rng.setStart(textNode, bestMatch.index);
          rng.setEnd(textNode, bestMatch.index);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(rng);
        }

        initialSelectionDone.current = true;
      }
    }
  }
}

function updateSelectionText(selection: Selection, replacer: Replacer, content: string) {
  const [min, max] = [selection.anchorOffset, selection.focusOffset].sort((a, b) => a <= b ? -1 : 1);
  const modifiedText = replacer(content.substring(min, max));
  return {
    content: content.substring(0, min) + modifiedText + content.substring(max), selection: { start: min, end: min + modifiedText.length - 1 }
  };
}

function updateCaretText(selection: Selection, replacer: Replacer, content: string) {
  const min = Math.min(selection.anchorOffset, selection.focusOffset);
  const modifiedText = replacer("");
  return { content: content.substring(0, min) + modifiedText + content.substring(min), selection: { start: min, end: min + modifiedText.length } };
}

function updateParagraphText(selection: Selection, content: string, replacer: Replacer) {
  const [min, max] = [selection.anchorOffset, selection.focusOffset].sort((a, b) => a <= b ? -1 : 1);
  const findChar = (i: number, search: RegExp, next: (b: number) => number, u?: number): number => {
    if (i <= 0) return 0;
    if (i >= content.length) return content.length;
    return content.charAt(i).search(search) < 0 ? (u ? u : i) : findChar((() => { u = i; return next(i); })(), search, next, u);
  };
  const start = findChar(min, /^./mg, (n) => n - 1);
  const stop = findChar(max, /.$/mg, (n) => n + 1) + 1;
  const modifiedText = replacer(content.substring(start, stop));
  return {
    content: content.substring(0, start) + modifiedText + content.substring(stop), selection: { start: start, end: min + modifiedText.length }
  };
}

function selectText(obj: HTMLElement, start: number, stop: number) {
  const textNode = obj.childNodes[0]

  const range = document.createRange();
  range.setStart(textNode, start);
  range.setEnd(textNode, stop + 1);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}
