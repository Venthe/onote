import {TokenizationResult} from "./types";

export interface DocumentLexer {
  parse(scopeName: string): TokenizationResult[]
}

export interface DocumentTextBuffer {
  getLine(soughtLineIndex: number): string
  lineCount: number
}

export interface File {
    data?: string
    fileType?: string
}

export type DocumentLexerProvider = (buffer: DocumentTextBuffer, fileType?: string) => DocumentLexer
export type DocumentTextBufferProvider = (data?: string) => DocumentTextBuffer

export class DocumentBuilder {
    private lexer?: DocumentLexerProvider
    private buffer?: DocumentTextBufferProvider

    setLexer(lexer: DocumentLexerProvider): this {
        this.lexer = lexer;
        return this
    }

    setBuffer(buffer: DocumentTextBufferProvider): this {
        this.buffer = buffer;
        return this
    }

    build() {
        if (!this.lexer || !this.buffer) throw new Error("Can't construct a document")
        return new Document(this.lexer, this.buffer)
    }
}

export class Document {
    private textBuffer?: DocumentTextBuffer
    private lexer?: DocumentLexer

    constructor(private readonly lexerProvider: DocumentLexerProvider,
                private readonly textBufferProvider: DocumentTextBufferProvider) {
    }

    loadDocument(file?: File) {
        this.textBuffer = this.textBufferProvider(file?.data)
        this.lexer = this.lexerProvider(this.textBuffer, file?.fileType)
    }

    get documentType(): string | undefined {
        throw new Error("")
    }
}
