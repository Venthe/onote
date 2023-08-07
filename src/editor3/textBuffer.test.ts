import {TextBuffer} from "./textBuffer";

describe("TextBuffer", () => {
  describe("insert", () => {
    it("should show original text on no edits", () => {
      const buffer = new TextBuffer("Lorem ipsum dolor sit amet")

      expect(buffer.print()).toEqual("Lorem ipsum dolor sit amet")
    })

    it("should show text at the end", () => {
      const buffer = new TextBuffer("Lorem ipsum dolor sit amet")

      buffer.insert(".", 26)

      expect(buffer.print()).toEqual("Lorem ipsum dolor sit amet.")
    })

    it("should show text at the beginning", () => {
      const buffer = new TextBuffer("Lorem ipsum dolor sit amet")

      buffer.insert("He said: ", 0)

      expect(buffer.print()).toEqual("He said: Lorem ipsum dolor sit amet")
    })

    it("should show text at the middle of the line", () => {
      const buffer = new TextBuffer("Big brown fox has jumped over a lazy dog.")

      buffer.insert(", and small,", 9)

      expect(buffer.print()).toEqual("Big brown, and small, fox has jumped over a lazy dog.")
    })
  })

  describe("delete", () => {
    it("should delete at the beginning", () => {
      const buffer = new TextBuffer("Big brown fox has jumped over a lazy dog.")

      buffer.delete(0, 1)

      expect(buffer.print()).toEqual("ig brown fox has jumped over a lazy dog.")
    })

    it("should delete at the end", () => {
      const buffer = new TextBuffer("Big brown fox has jumped over a lazy dog.")

      buffer.delete(40, 1)

      expect(buffer.print()).toEqual("Big brown fox has jumped over a lazy dog")
    })

    it("should delete in the middle", () => {
      const buffer = new TextBuffer("Big brown fox has jumped over a lazy dog.")

      buffer.delete(3, 6)

      expect(buffer.print()).toEqual("Big fox has jumped over a lazy dog.")
    })
  })

  describe("stringAt", () => {
    it("Test 0", () => {
      const buffer = new TextBuffer("B")

      expect(buffer.stringAt(0, 1)).toEqual("B")
    })

    it("Test 1", () => {
      const buffer = new TextBuffer("Big")

      expect(buffer.stringAt(0, 3)).toEqual("Big")
    })

    it("Test 2", () => {
      const buffer = new TextBuffer("156")

      buffer.insert("234", 1)

      expect(buffer.stringAt(0, 3)).toEqual("123")
    })
  })


  describe("iterator", () => {
    it("Test 1", () => {
      const buffer = new TextBuffer("Big")

      expect([...buffer]).toEqual(["B", "i", "g"])
    })

    it("Test 2", () => {
      const buffer = new TextBuffer("Big")

      buffer.insert(" brown", 3)

      expect([...buffer]).toEqual(["B", "i", "g", " ", "b", "r", "o", "w", "n"])
    })

    it("Test 2", () => {
      const buffer = new TextBuffer("Big")

      buffer.insert(" brown", 3)
      buffer.delete(6, 1)

      expect([...buffer]).toEqual(["B", "i", "g", " ", "b", "r", "w", "n"])
    })
  })
})
