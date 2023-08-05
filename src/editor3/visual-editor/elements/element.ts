import {DocumentElementHandler} from "./impl/document";
import {ParagraphElementHandler} from "./impl/paragraph";
import * as Model from "../types"

export interface ElementHandler {
    type: string,
    elementType: "element",
    render: (contentCallback: () => string, properties?: Record<string, string>) => string
    parse: (element: Element, childrenParseCallback: (elements: Element[]) => Model.ElementOrLine[]) => Model.Element
}

export class ElementHandlerRegistry {
    public static DEFAULT_REGISTRY = new ElementHandlerRegistry()

    constructor(private readonly handlers: ElementHandler[] = [DocumentElementHandler, ParagraphElementHandler]) {
    }


    public get(type: string): ElementHandler | undefined {
        return this.handlers.filter(h => h.type === type)[0]
    }
}
