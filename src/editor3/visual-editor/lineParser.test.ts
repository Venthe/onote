import {elementToLineModel} from "./lineParser";
import {EmbedHandlerRegistry} from "./embeds/embed";
import {MarkupHandler, MarkupHandlerRegistry} from "./markups/markup";
import {BoldMarkupHandler} from "./markups/impl/bold";
import {ItalicMarkupHandler} from "./markups/impl/italic";

describe("Line parser", () => {
  it("No element is not parseable", () => {
    expect(() => elementToLineModel(undefined, mockConfiguration)).toThrow("Element is not present, and thus cannot be parsed")
  });

  it("Simple text is not parsable", () => {
    expect(() => elementToLineModel(e("sample text"), mockConfiguration)).toThrow("Element must be an ELEMENT_NODE(1) to be parsed")
  });

  it("Element must have an ID", () => {
    expect(() => elementToLineModel(e("<div>sample text</div>"), mockConfiguration)).toThrow("To be parsed, element must have an ID")
  })

  it("Simple text must be parsed", () => {
    const result = elementToLineModel(e("<div data-id='sampleId'>sample text</div>"), mockConfiguration);

    expect(result).toEqual({
      content: "sample text",
      id: "sampleId"
    })
  })

  describe("invalid tags", () => {
    it("Unclosed tag", () => {
      expect(() => elementToLineModel(e("<div data-id='sampleId'><span></div>"), mockConfiguration)).toThrow("Unparsed tag is unclosed, cannot get properties")
    })

  })

  describe("Markups", () => {
    const configurationWithHandler = (...markups: MarkupHandler[]) => ({
      ...mockConfiguration,
      markupHandlerRegistry: new MarkupHandlerRegistry(markups)
    });

    it("Simple text with markup", () => {
      const configuration: Configuration = configurationWithHandler(BoldMarkupHandler)
      const element = e("<div data-id='sampleId'>sample <span data-type='bold' data-element-type='markup'>text</span></div>");
      const result = elementToLineModel(element, configuration);

      expect(result).toEqual({
        content: "sample text",
        id: "sampleId",
        markups: [
          {start: 7, end: 11, type: "bold"}
        ]
      })
    })

    it("Markup of length 0 is collapsed", () => {
      const configuration: Configuration = configurationWithHandler(BoldMarkupHandler)
      const element = e("<div data-id='sampleId'>sample <span data-type='bold' data-element-type='markup'></span></div>");
      const result = elementToLineModel(element, configuration);

      expect(result).toEqual({
        content: "sample ",
        id: "sampleId"
      })
    })

    it("Overlapping markup is correctly saved", () => {
      const configuration: Configuration = configurationWithHandler(BoldMarkupHandler, ItalicMarkupHandler)
      const element = e("<div data-id='sampleId'><span data-type='bold' data-element-type='markup'>bold <span data-type='italic' data-element-type='markup'>and</span> italic</span></div>");
      const result = elementToLineModel(element, configuration);

      expect(result).toEqual({
        content: "bold and italic",
        id: "sampleId",
        markups: [
          {start: 0, end: 8, type: "bold"},
          {start: 5, end: 15, type: "italic"}
        ]
      })
    })

    it("Same markup end to end is joined", () => {
      const configuration: Configuration = configurationWithHandler(BoldMarkupHandler)
      const element = e("<div data-id='sampleId'><span data-type='bold' data-element-type='markup'>sample </span><span data-type='bold' data-element-type='markup'>text</span></div>");
      const result = elementToLineModel(element, configuration);

      expect(result).toEqual({
        content: "sample text",
        id: "sampleId",
        markups: [
          {start: 0, end: 11, type: "bold"}
        ]
      })
    })

    it("Disjointed markups are marked separately", () => {
      const configuration: Configuration = configurationWithHandler(BoldMarkupHandler);
      const element = e("<div data-id='sampleId'><span data-type='bold' data-element-type='markup'>sample</span> <span data-type='bold' data-element-type='markup'>text</span></div>");
      const result = elementToLineModel(element, configuration);

      expect(result).toEqual({
        content: "sample text",
        id: "sampleId",
        markups: [
          {start: 0, end: 6, type: "bold"},
          {start: 7, end: 11, type: "bold"}
        ]
      })
    })
  })
})

type Configuration = {
  embedHandlerRegistry: EmbedHandlerRegistry,
  markupHandlerRegistry: MarkupHandlerRegistry
};

const mockConfiguration = {
  embedHandlerRegistry: undefined,
  markupHandlerRegistry: undefined
} as unknown as Configuration

const e = (html: string) => {
  const parser = new DOMParser()
  return parser.parseFromString(html, "text/html").body.childNodes[0]
}
