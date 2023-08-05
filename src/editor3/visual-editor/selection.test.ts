import {mapRangeToSelection} from "./selection";

describe("Selection", () => {
  describe("Cursor", () => {
    it("1", () => {
      // given
      const element = e(`<div data-id="exampleId" data-type="line" data-element-type="element">Sample text</div>`)
      const rng = new Range()
      rng.setStart(element[0].childNodes[0], 6)
      rng.setEnd(element[0].childNodes[0], 6)

      expect(mapRangeToSelection([rng])).toEqual([{
        start: {id: "exampleId", position: 6},
        end: {id: "exampleId", position: 6}
      }])
    })
  })

  describe("Span", () => {
    describe("same line", () => {
      it("simple text, middle", () => {
        // given
        const element = e(`<div data-id="exampleId" data-type="line" data-element-type="element">Sample text</div>`)
        const rng = new Range()
        rng.setStart(element[0].childNodes[0], 3)
        rng.setEnd(element[0].childNodes[0], 6)

        expect(mapRangeToSelection([rng])).toEqual([{
          start: {id: "exampleId", position: 3},
          end: {id: "exampleId", position: 6}
        }])
      })
      it("simple text, from beginning", () => {
        // given
        const element = e(`<div data-id="exampleId" data-type="line" data-element-type="element">Sample text</div>`)
        const rng = new Range()
        rng.setStart(element[0].childNodes[0], 0)
        rng.setEnd(element[0].childNodes[0], 6)

        expect(mapRangeToSelection([rng])).toEqual([{
          start: {id: "exampleId", position: 0},
          end: {id: "exampleId", position: 6}
        }])
      })

      it("simple text, to end", () => {
        // given
        const element = e(`<div data-id="exampleId" data-type="line" data-element-type="element">Sample text</div>`)
        const rng = new Range()
        rng.setStart(element[0].childNodes[0], 6)
        rng.setEnd(element[0].childNodes[0], 11)

        expect(mapRangeToSelection([rng])).toEqual([{
          start: {id: "exampleId", position: 6},
          end: {id: "exampleId", position: 11}
        }])
      })

      it("simple text, two lines, from middle to middle", () => {
        // given
        const element = e(`<div data-id="exampleId" data-type="line" data-element-type="element">Sample text</div><div data-id="exampleId2" data-type="line" data-element-type="element">Sample text 2</div>`)
        const rng = new Range()
        rng.setStart(element[0].childNodes[0], 6)
        rng.setEnd(element[1].childNodes[0], 6)

        expect(mapRangeToSelection([rng])).toEqual([{
          start: {id: "exampleId", position: 6},
          end: {id: "exampleId2", position: 6}
        }])
      })

      it("simple text, two lines, from start to end", () => {
        // given
        const element = e(`<div data-id="exampleId" data-type="line" data-element-type="element">Sample text</div><div data-id="exampleId2" data-type="line" data-element-type="element">Sample text 2</div>`)
        const rng = new Range()
        rng.setStart(element[0].childNodes[0], 0)
        rng.setEnd(element[1].childNodes[0], 13)

        expect(mapRangeToSelection([rng])).toEqual([{
          start: {id: "exampleId", position: 0},
          end: {id: "exampleId2", position: 13}
        }])
      })

      it("simple text, three lines, from middle to middle", () => {
        // given
        const element = e(`
        <div data-id="exampleId" data-type="line" data-element-type="element">Sample text</div>
        <div data-id="exampleId2" data-type="line" data-element-type="element">Sample text 2</div>
        <div data-id="exampleId3" data-type="line" data-element-type="element">Sample text 3</div>
        `)
        const rng = new Range()
        rng.setStart(element[0].childNodes[0], 6)
        rng.setEnd(element[2].childNodes[0], 6)

        expect(mapRangeToSelection([rng])).toEqual([{
          start: {id: "exampleId", position: 6},
          end: {id: "exampleId3", position: 6}
        }])
      })
    })
  })

})

const e = (html: string) => {
  const parser = new DOMParser()
  return parser.parseFromString(html, "text/html").body.children
}


/*
<span data-type="line" data-element-type="element">
  test 1
  <span data-type="italic" data-element-type="markup">
    <span data-type="bold" data-element-type="markup">test 2</span>
  </span>
  <span data-type="italic" data-element-type="markup">
    test 3
    <span data-type="bold" data-element-type="markup">test 4</span>
    <span data-type="strikethrough" data-element-type="markup">
      <span data-type="underline" data-element-type="markup"> test 5</span>
    </span>
    <span data-type="bold" data-element-type="markup"> test 6</span>
  </span>
</span>

 */
