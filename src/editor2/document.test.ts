import {Document, DocumentBuilder} from "./document";
import {TextBuffer} from "../editor3/textBuffer";
import {Lexer} from "./lexer";
import {GrammarRepository} from "./grammarRepository";

describe("Document", () => {
  let document: Document;

  beforeEach(() =>
    document = new DocumentBuilder()
      .setBuffer(data => new TextBuffer(data))
      .setLexer(buffer => new Lexer(mockGrammarLoader, buffer))
      .build())

  describe("document type", () => {
    it("should load empty document", () => {
      // given
      document.loadDocument({data: undefined});

      // when
      const documentType = document.documentType

      // then
      expect(documentType).toEqual(undefined)
    })

    it("should load empty document", () => {
      // given
      document.loadDocument({data: ""});

      // when
      const documentType = document.documentType

      // then
      expect(documentType).toEqual(undefined)
    })

    it("should load empty document", () => {
      // given
      document.loadDocument({data: "", fileType: "md"});

      // when
      const documentType = document.documentType

      // then
      expect(documentType).toEqual("markdown.text")
    })
  })
})

const mockGrammarLoader: GrammarRepository = {
  resolveGrammar: (params) => {
    if (params.fileType === "md") {
      return {
        scopeName: "markdown.text",
        fileTypes: ["md"],
        patterns: []
      }
    }

    return undefined
  },
  resolveScope(params) {
    throw new Error()
  }
}
