import {parseTag} from "./markup";

describe("Tag parser", () => {
  it("Opening tag", () => {
    const e = expect(parseTag("<a>"));
    e.toHaveProperty("name", "a")
    e.toHaveProperty("closing", false)
    e.toHaveProperty("selfClosing", false)
  })
  it("Closing tag", () => {
    const e = expect(parseTag("</a>"));
    e.toHaveProperty("name", "a")
    e.toHaveProperty("closing", true)
    e.toHaveProperty("selfClosing", false)
  })
  it("Self-closing tag", () => {
    const e = expect(parseTag("<br />"));
    e.toHaveProperty("name", "br")
    e.toHaveProperty("closing", false)
    e.toHaveProperty("selfClosing", true)
  })
  it("Tag with attributes (Single quote)", () => {
    const e = expect(parseTag("<a data-direction='left'>"));
    e.toHaveProperty("name", "a")
    e.toHaveProperty("closing", false)
    e.toHaveProperty("selfClosing", false)
    e.toHaveProperty("attributes", {"data-direction": "left"})
  })
  it("Tag with attributes (Double quote)", () => {
    const e = expect(parseTag("<a data-direction=\"left\">"));
    e.toHaveProperty("name", "a")
    e.toHaveProperty("closing", false)
    e.toHaveProperty("selfClosing", false)
    e.toHaveProperty("attributes", {"data-direction": "left"})
  })
  it("Tag with attributes (empty)", () => {
    const e = expect(parseTag("<a data-direction>"));
    e.toHaveProperty("name", "a")
    e.toHaveProperty("closing", false)
    e.toHaveProperty("selfClosing", false)
    e.toHaveProperty("attributes", {"data-direction": "true"})
  })
  it("Tag with attributes (self-closing)", () => {
    const e = expect(parseTag("<a data-direction='left'/>"));
    e.toHaveProperty("name", "a")
    e.toHaveProperty("closing", false)
    e.toHaveProperty("selfClosing", true)
    e.toHaveProperty("attributes", {"data-direction": "left"})
  })
  it("Tag with two attributes (self-closing)", () => {
    const e = expect(parseTag("<a data-direction='left' data-lost=\"left\"/>"));
    e.toHaveProperty("name", "a")
    e.toHaveProperty("closing", false)
    e.toHaveProperty("selfClosing", true)
    e.toHaveProperty("attributes", {"data-direction": "left"})
  })

})
