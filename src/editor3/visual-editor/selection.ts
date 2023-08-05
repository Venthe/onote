import {getAttributeValue} from "./utilities/utilities";

export interface DocumentSelection {
  start: { id: string, position: number }
  end: { id: string, position: number }
}

export const mapRangeToSelection = (ranges: Range[]): DocumentSelection[] => {
  const isElement = (e: Element | Node): e is Element => e.nodeType !== 3;

  const bubbleToModelElement = (element: Node | Element | null): Element => {
    if (!element) {
      throw new Error("!@#%^")
    }

    if (isElement(element) && getAttributeValue(element, "data-element-type") === "element") {
      return element
    } else {
      return bubbleToModelElement(element.parentElement)
    }
  }

  const traverse = (element: Node | Element | null, offset: number, notFirst = true): { id: string, position: number } => {
    if (element === null) {
      throw new Error("!@#%^")
    }

    console.debug(("Traversing"), element)

    if (isElement(element)) {
      console.debug(("Is Element"))
      const elementType = getAttributeValue(element, "data-element-type")
      const type = getAttributeValue(element, "data-type")

      if (elementType === "element" && type === "line") {
        const id = getAttributeValue(element, "data-id")
        if (!id) throw new Error("!@3#%^")
        console.log("Terminating traverse", element, offset)
        return {
          id,
          position: offset
        }
      } else if (elementType === "embed") {
        console.log("Embed, skipping...", element, offset)
        return traverse((element as any).previousSibling, offset)
      } else if (elementType === "markup") {
        console.log("Markup, adding length", element, !notFirst ? offset : (element.textContent?.length ?? 0) + offset)
        return traverse((element as any).previousSibling ?? element.parentElement, !notFirst ? offset : (element.textContent?.length ?? 0) + offset)
      } else {
        throw new Error("DD**#@#")
      }
    } else {
      if ((element as any).previousSibling !== null) {
        console.log("Not element, has sibling", element, !notFirst ? offset : (element.textContent?.length ?? 0) + offset)
        return traverse((element as any).previousSibling, !notFirst ? offset : (element.textContent?.length ?? 0) + offset)
      } else {
        console.log("Not element, no sibling, picking parent", element, !notFirst ? offset : (element.textContent?.length ?? 0) + offset)
        return traverse(element.parentElement, !notFirst ? offset : (element.textContent?.length ?? 0) + offset, false)
      }
    }
  }

  const mapRangeToDocumentSelection = (range: Range): DocumentSelection => {
    if (range.startOffset === range.endOffset && range.startContainer === range.endContainer) {
      console.debug("-----------------")
      const t = traverse(range.startContainer, range.startOffset, false)
      console.debug("-----------------")
      return {
        start: t,
        end: t
      }
    }

    console.debug("-----------------")
    console.debug("--------start---------")
    const start = traverse(range.startContainer, range.startOffset, false);
    console.debug("--------end---------")
    const end = traverse(range.endContainer, range.endOffset, false);
    const newVar = {
      start: start,
      end: end
    };
    console.debug("-----------------")
    return newVar
  }

  return ranges.map(rng => mapRangeToDocumentSelection(rng))
}


/*
        this.selection = Array.from({length: window.getSelection()?.rangeCount ?? 0})
            .map((el, idx) => idx).map(i => window.getSelection()?.getRangeAt(i))
            .filter(el => el !== undefined)
            .map(el => el as Range)
            .map(range => mapRangeToDocumentSelection(range))*!/
*/
