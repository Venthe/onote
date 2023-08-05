export type Document = Element<"document">

export interface Element<T extends string = string> {
    id: ID
    type: T
    elements: Elements
    properties?: Record<string, string>
}

type ElementOrLine = Line | Element;
type Elements = (ElementOrLine)[];

export interface Line {
    id: ID
    content: string
    markups?: Markup[]
    embeds?: Embed[]
}

type ID = string

export interface Markup {
    type: string
    start: number
    end: number
    properties?: Record<string, string>
}

export interface Embed {
    type: string
    id: ID
    position: number
    properties?: Record<string, string>
}
