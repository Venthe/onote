export interface Outline {
    content: string
    metadata: OutlineMetadata
}

export interface OutlineMetadata {
    left: number
    top: number
    width?: number
    type: string
}

export interface Page {
    version: 1
    kind: "document/open-note"
    metadata: PageMetadata
    outlines: { [key: string]: Outline }
}

export interface PageMetadata {
    title?: string
    created: string
    lastUpdated: string
}