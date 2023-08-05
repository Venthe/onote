import * as Model from "./types"
import {ElementHandlerRegistry} from "./elements/element";
import {MarkupHandlerRegistry} from "./markups/markup";
import {EmbedHandlerRegistry} from "./embeds/embed";
import {DocumentElementHandler} from "./elements/impl/document";
import {getAttributeValue} from "./utilities/utilities";
import {LineElementHandler} from "./elements/impl/line";
import {elementToLineModel} from "./lineParser";
import {DocumentSelection} from "./selection";

interface DocumentMetadata {
  lines: number
}

export class Document {
  private selection: DocumentSelection[] = []
  private metadata: DocumentMetadata | undefined

  constructor(private model: Model.Document,
              private readonly configuration: {
                elementHandlerRegistry: ElementHandlerRegistry,
                markupHandlerRegistry: MarkupHandlerRegistry,
                embedHandlerRegistry: EmbedHandlerRegistry
              } = {
                elementHandlerRegistry: ElementHandlerRegistry.DEFAULT_REGISTRY,
                markupHandlerRegistry: MarkupHandlerRegistry.DEFAULT_REGISTRY,
                embedHandlerRegistry: EmbedHandlerRegistry.DEFAULT_REGISTRY
              }) {
  }

  eject() {
    return this.model
  }

  dump(parser?: (el: object) => string): string {
    if (!parser) parser = (e) => JSON.stringify(e, undefined, 2)

    return parser(this.model)
  }

  toDOM() {
    this.metadata = {lines: 0}
    return this.renderElementOrLine(this.model)
  }

  private renderElementOrLine(node: Model.ElementOrLine): string {
    if (this.isElement(node)) {
      return this.mapElement(node)
    } else if (this.isLine(node)) {
      if (!this.metadata) throw new Error("*@))$)@")
      this.metadata.lines++
      return LineElementHandler.render(() => this.mapLine(node), {
        "data-id": node.id,
        "data-element-type": "element",
        "data-type": "line"
      });
    } else {
      throw new Error("Unsupported node type " + JSON.stringify(node))
    }

  }

  private isElement(node: Model.ElementOrLine): node is Model.Element {
    return !!(node as Model.Element).elements
  }

  private isLine(node: Model.ElementOrLine): node is Model.Line {
    return !!(node as Model.Line).content
  }

  private mapElement(node: Model.Element) {
    const elementHandler = this.configuration.elementHandlerRegistry.get(node.type);

    if (!elementHandler) {
      throw new Error("Element handler not found " + JSON.stringify({
        id: node.id,
        type: node.type
      }))
    }

    return elementHandler
      .render(() =>
        node.elements.map(e => this.renderElementOrLine(e)).join("\n"), {id: node.id, ...node.properties}
      )
  }

  private mapLine(node: Model.Line) {
    const lettersInLine = node.content.split("")

    const markups = [...node.markups ?? []]

    this.selection.forEach(s => {
      if (node.id === s.start.id && node.id === s.end.id && s.start.position === s.end.position) {
        return
      }

      if (node.id === s.start.id && node.id === s.end.id && s.start.position !== s.end.position) {
        markups?.push({
          type: "debug-selection",
          properties: {},
          start: s.start.position,
          end: s.end.position
        })
      } else if (this.lineBetween(s.start.id, s.end.id).includes(node.id)) {
        markups?.push({
          type: "debug-selection",
          properties: {},
          start: 0,
          end: node.content.length
        })
      } else if (node.id === s.start.id) {
        markups?.push({
          type: "debug-selection",
          properties: {},
          start: s.start.position,
          end: node.content.length
        })
      } else if (node.id === s.end.id) {
        markups?.push({
          type: "debug-selection",
          properties: {},
          start: 0,
          end: s.end.position
        })
      }
    })

    // TODO: Sort markups
    //  A, STRONG, EM
    markups?.forEach(markup => {
      const markupHandler = this.configuration.markupHandlerRegistry.get(markup.type);

      if (!markupHandler) {
        throw new Error("Element handler not found " + JSON.stringify({
          id: node.id,
          type: markup.type
        }))
      }

      const {
        start: renderStart,
        end: renderEnd
      } = markupHandler.render(markup.properties);

      lettersInLine[markup.start] = renderStart(lettersInLine[markup.start])
      lettersInLine[markup.end - 1] = renderEnd(lettersInLine[markup.end - 1])
    })

    node.embeds?.forEach(embed => {
      const handler = this.configuration.embedHandlerRegistry.get(embed.type);
      if (!handler) throw new Error("!@#%%#@#")
      const index = embed.position;
      const renderedEmbed = handler.render({...{"data-id": embed.id}, ...embed.properties});

      if (index >= 0 && index < lettersInLine.length) {
        lettersInLine[index] = renderedEmbed + lettersInLine[index]
      } else if (index === lettersInLine.length) {
        lettersInLine[index - 1] = lettersInLine[index - 1] + renderedEmbed
      } else {
        throw new Error("#*&*^&^$")
      }
    })

    return lettersInLine.join("");
  }

  parse(innerHTML: string) {
    this.model = this.parseDOM(innerHTML)
    return this
  }

  private parseDOM(innerHTML: string): Model.Document {
    const parser = new DOMParser()
    const doc = parser.parseFromString(innerHTML, "text/html").body.children[0]
    const model = this.parseElementRoot(doc)
    return model as Model.Document
  }

  private parseElementRoot(doc: Element): Model.Element {
    return DocumentElementHandler.parse(doc, elements => this.parseElementOrLine_(elements));
  }

  private parseElementOrLine_(elements: Element[]): Model.ElementOrLine[] {
    return elements.map(element => {
      if (this.isTextLine(element)) {
        return elementToLineModel(element, {
          embedHandlerRegistry: this.configuration.embedHandlerRegistry,
          markupHandlerRegistry: this.configuration.markupHandlerRegistry
        })
      } else {
        return this.parseElements(element)
      }
    })
  }

  private isTextLine(el: Element) {
    const elementType = getAttributeValue(el, "data-element-type");
    const type = getAttributeValue(el, "data-type");
    return elementType === "element" && type === "line";
  }

  private parseElements(el: Element): Model.ElementOrLine {
    const elementType = getAttributeValue(el, "data-element-type")
    if (!elementType) {
      console.error(el)
      throw new Error("Element is lacking the information about element type")
    }
    const type = getAttributeValue(el, "data-type")
    if (!type) {
      console.error(el)
      throw new Error("Element is lacking the information about type ")
    }

    const handler = this.configuration.elementHandlerRegistry.get(type);
    if (!handler) {
      throw new Error("Unhandled element 'type' " + type)
    }

    return handler.parse(el, element => this.parseElementOrLine_(element))
  }

  getLines() {
    return this.metadata?.lines
  }

  getCursor() {
    return this.selection
  }


  // FIXME: What a mess...
  updateCursor() {
    /*
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
            }*/

    const mapRangeToDocumentSelection = (range: Range) => {
      // if text node
      //   add length
      // if has previous siblings
      //
    }
    /*
            this.selection = Array.from({length: window.getSelection()?.rangeCount ?? 0})
                .map((el, idx) => idx).map(i => window.getSelection()?.getRangeAt(i))
                .filter(el => el !== undefined)
                .map(el => el as Range)
                .map(range => mapRangeToDocumentSelection(range))*/
  }

  restoreCursor() {
    //
    // this.getCursor().map(cursor => {
    //     if (cursor.start.id === cursor.end.id) {
    //         const node = document.querySelector(`*[data-id='${cursor.start.id}']`);
    //         if (!node) throw new Error("!!!!")
    //
    //         let range = new Range();
    //     } else {
    //         const start = document.querySelector(`*[data-id='${cursor.start.id}']`);
    //         const end = document.querySelector(`*[data-id='${cursor.end.id}']`);
    //         if (!start) throw new Error("!!!!")
    //         if (!end) throw new Error("!!!!")
    //
    //     }
    // });
  }

  private lineBetween(id: string, id2: string): string[] {
    if (id === id2) return []

    const lines = this.getLines_(this.model.elements);

    const result: string[] = []
    let shouldAdd = false
    for (const element of lines) {
      if (element.id === id || result.length > 0) {
        shouldAdd = true
        continue
      } else if (element.id === id2) {
        break;
      }

      if (shouldAdd) result.push(element.id)
    }

    return result
  }

  private getLines_(elements: Model.ElementOrLine[]): Model.Line[] {

    return elements.flatMap(node => {
      if (this.isElement(node)) {
        return this.getLines_(node.elements)
      } else if (this.isLine(node)) {
        return [node]
      } else {
        throw new Error("!!$$@#@#!#!")
      }
    })
  }
}
