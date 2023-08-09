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

    it("should show text at the end 2", () => {
      const buffer = new TextBuffer("Lorem ipsum dolor sit amet")

      buffer.insert(" dorian", buffer.print().length)
      buffer.insert(" simon", buffer.print().length)

      expect(buffer.print()).toEqual("Lorem ipsum dolor sit amet dorian simon")
    })

    it("should show text at the beginning", () => {
      const buffer = new TextBuffer("Lorem ipsum dolor sit amet")

      buffer.insert("He said: ", 0)

      expect(buffer.print()).toEqual("He said: Lorem ipsum dolor sit amet")
    })

    it("should show text at the beginning 2", () => {
      const buffer = new TextBuffer("Lorem ipsum dolor sit amet")

      buffer.insert("He said: ", 0)
      buffer.insert("She said: ", 0)

      expect(buffer.print()).toEqual("She said: He said: Lorem ipsum dolor sit amet")
    })

    it("should show text at the middle of the line", () => {
      const buffer = new TextBuffer("Big brown fox has jumped over a lazy dog.")

      buffer.insert(", and small,", 9)

      expect(buffer.print()).toEqual("Big brown, and small, fox has jumped over a lazy dog.")
    })

    it("should show text at the middle of the line 2", () => {
      const buffer = new TextBuffer("Big brown fox has jumped over a lazy dog.")

      buffer.insert(", and small,", 9)
      buffer.insert(", and tall", 9)

      expect(buffer.print()).toEqual("Big brown, and tall, and small, fox has jumped over a lazy dog.")
    })
  })

  describe("Undo", () => {
    describe("insert", () => {
      describe("at the end of the piece", () => {
        it("Single character insert", () => expectSameDocument((buffer, document) => {
          buffer.insert(".", buffer.print().length)
          buffer.undo()
        }))

        it("Insert two times, undo manually two times", () => {
          const buffer = new TextBuffer("Lorem ipsum dolor sit amet")

          buffer.insert("dorian", buffer.print().length)
          buffer.insert("simon", buffer.print().length)
          buffer.undo()
          buffer.undo()

          expect(buffer.print()).toEqual("Lorem ipsum dolor sit amet")
        })

        it("Insert two times, bulk undo two times", () => {
          const buffer = new TextBuffer("Lorem ipsum dolor sit amet")

          buffer.insert(".", 26)
          buffer.insert(".", 27)
          buffer.undo(2)

          expect(buffer.print()).toEqual("Lorem ipsum dolor sit amet")
        })
      })
      describe("at the beginning of the piece", () => {
        it("1", () => {
          const buffer = new TextBuffer("Lorem ipsum dolor sit amet")

          buffer.insert(".", 0)
          buffer.undo()

          expect(buffer.print()).toEqual("Lorem ipsum dolor sit amet")
        })

        it("2", () => {
          const buffer = new TextBuffer("Lorem ipsum dolor sit amet")

          buffer.insert(".", 0)
          buffer.insert(".", 0)
          buffer.undo(2)

          expect(buffer.print()).toEqual("Lorem ipsum dolor sit amet")
        })

        it("3", () => {
          const buffer = new TextBuffer("Lorem ipsum dolor sit amet")

          buffer.insert(".", 0)
          buffer.insert(".", 0)
          buffer.undo()
          buffer.undo()

          expect(buffer.print()).toEqual("Lorem ipsum dolor sit amet")
        })
      })
      describe("in the middle of the piece", () => {
        it("1", () => {
          const buffer = new TextBuffer("Lorem ipsum dolor sit amet")

          buffer.insert(".", 1)
          buffer.undo()

          expect(buffer.print()).toEqual("Lorem ipsum dolor sit amet")
        })

        it("2", () => {
          const buffer = new TextBuffer("Lorem ipsum dolor sit amet")

          buffer.insert(".", 1)
          buffer.insert(".", 4)
          buffer.undo(2)

          expect(buffer.print()).toEqual("Lorem ipsum dolor sit amet")
        })

        it("3", () => {
          const buffer = new TextBuffer("Lorem ipsum dolor sit amet")

          buffer.insert(".", 1)
          buffer.insert(".", 4)
          buffer.undo()
          buffer.undo()

          expect(buffer.print()).toEqual("Lorem ipsum dolor sit amet")
        })
      })
    })
    describe("delete", () => {
      describe("at the end of the piece", () => {
        it("Single deletion", () => {
          const buffer = new TextBuffer("Lorem ipsum dolor sit amet")

          buffer.delete(25, 1)
          buffer.undo()

          expect(buffer.print()).toEqual("Lorem ipsum dolor sit amet")
        })

        it("Manual undo two deletions", () => {
          const buffer = new TextBuffer("Lorem ipsum dolor sit amet")

          buffer.delete(25, 1)
          buffer.delete(24, 1)
          buffer.undo()
          buffer.undo()

          expect(buffer.print()).toEqual("Lorem ipsum dolor sit amet")
        })

        it("Bulk undo two deletions", () => {
          const buffer = new TextBuffer("Lorem ipsum dolor sit amet")

          buffer.delete(25, 1)
          buffer.delete(24, 1)
          buffer.undo(2)

          expect(buffer.print()).toEqual("Lorem ipsum dolor sit amet")
        })
      })
      describe("at the beginning of the piece", () => {
        it("Single deletion", () => expectSameDocument((buffer) => {
          buffer.delete(0, 1)
          buffer.undo()
        }))
        it("Manual undo two deletions", () => expectSameDocument((buffer) => {
          buffer.delete(0, 1)
          buffer.delete(0, 1)
          buffer.undo()
          buffer.undo()
        }))
        it("Bulk undo two deletions", () => expectSameDocument((buffer) => {
          buffer.delete(0, 1)
          buffer.delete(0, 1)
          buffer.undo(2)
        }))
      })
      describe("in the middle of the piece", () => {
        it("Single deletion", () => expectSameDocument((buffer) => {
          buffer.delete(1, 1)
          buffer.undo()
        }))
        it("Manual undo two deletions", () => expectSameDocument((buffer) => {
          buffer.delete(1, 1)
          buffer.delete(1, 1)
          buffer.undo()
          buffer.undo()
        }))
        it("Bulk undo two deletions", () => expectSameDocument((buffer) => {
          buffer.delete(1, 1)
          buffer.delete(1, 1)
          buffer.undo(2)
        }))
      })
    })
  })

  describe("Redo", () => {
    describe("Insert", () => {
      describe("At the beginning of text", () => {
        it("Redo single change", () => {
          // given
          const document = "Lorem ipsum dolor sit amet";
          const buffer = new TextBuffer(document)
          buffer.insert("Simon says: ", 0)
          buffer.undo()

          // when
          buffer.redo()

          // then
          expect(buffer.print()).toEqual("Simon says: " + document)
        })
        it("Manual redo of two changes", () => {
          // given
          const document = "Lorem ipsum dolor sit amet";
          const buffer = new TextBuffer(document)
          buffer.insert("Simon says: ", 0)
          buffer.insert("Dorian says: ", 0)
          buffer.undo()
          buffer.undo()

          // when
          buffer.redo()
          buffer.redo()

          // then
          expect(buffer.print()).toEqual("Dorian says: Simon says: " + document)
        })
        it("Bulk redo of two changes", () => {
          // given
          const document = "Lorem ipsum dolor sit amet";
          const buffer = new TextBuffer(document)
          buffer.insert("Simon says: ", 0)
          buffer.insert("Dorian says: ", 0)
          buffer.undo()
          buffer.undo()

          // when
          buffer.redo(2)

          // then
          expect(buffer.print()).toEqual("Dorian says: Simon says: " + document)
        })
        it("Change, undo, change - redo does nothing", () => {
          // given
          const document = "Lorem ipsum dolor sit amet";
          const buffer = new TextBuffer(document)
          buffer.insert("Dorian says: ", 0)
          buffer.undo()
          buffer.insert("Simon says: ", 0)

          // when
          buffer.redo()

          // then
          expect(buffer.print()).toEqual("Simon says: " + document)
        })
      })
      describe("In the middle of text", () => {
        it("Redo single change", () => {
          // given
          const document = "Lorem ipsum dolor sit amet";
          const buffer = new TextBuffer(document)
          buffer.insert("Simon says: ", 1)
          buffer.undo()

          // when
          buffer.redo()

          // then
          expect(buffer.print()).toEqual(document[0] + "Simon says: " + document.substring(1))
        })
        it("Manual redo of two changes", () => {
          // given
          const document = "Lorem ipsum dolor sit amet";
          const buffer = new TextBuffer(document)
          buffer.insert("Simon says: ", 1)
          buffer.insert("Dorian says: ", 1)
          buffer.undo()
          buffer.undo()

          // when
          buffer.redo()
          buffer.redo()

          // then
          expect(buffer.print()).toEqual("LDorian says: Simon says: orem ipsum dolor sit amet")
        })
        it("Bulk redo of two changes", () => {
          // given
          const document = "Lorem ipsum dolor sit amet";
          const buffer = new TextBuffer(document)
          buffer.insert("Simon says: ", 1)
          buffer.insert("Dorian says: ", 1)
          buffer.undo()
          buffer.undo()

          // when
          buffer.redo(2)

          // then
          expect(buffer.print()).toEqual("LDorian says: Simon says: orem ipsum dolor sit amet")
        })
        it("Change, undo, change - redo does nothing", () => {
          // given
          const document = "Lorem ipsum dolor sit amet";
          const buffer = new TextBuffer(document)
          buffer.insert("Dorian says: ", 1)
          buffer.undo()
          buffer.insert("Simon says: ", 1)

          // when
          buffer.redo()

          // then
          expect(buffer.print()).toEqual(document[0] + "Simon says: " + document.substring(1))
        })
      })
      describe("At the end of text", () => {
        it("Redo single change", () => {
          // given
          const document = "Lorem ipsum dolor sit amet";
          const buffer = new TextBuffer(document)
          buffer.insert(", Simon said", buffer.print().length)
          buffer.undo()

          // when
          buffer.redo()

          // then
          expect(buffer.print()).toEqual(document + ", Simon said")
        })
        it("Manual redo of two changes", () => {
          // given
          const document = "Lorem ipsum dolor sit amet";
          const buffer = new TextBuffer(document)
          buffer.insert(", Simon said", buffer.print().length)
          buffer.insert(", Dorian said", buffer.print().length)
          buffer.undo()
          buffer.undo()

          // when
          buffer.redo()
          buffer.redo()

          // then
          expect(buffer.print()).toEqual(document + ", Simon said, Dorian said")
        })
        it("Bulk redo of two changes", () => {
          // given
          const document = "Lorem ipsum dolor sit amet";
          const buffer = new TextBuffer(document)
          buffer.insert(", Simon said", buffer.print().length)
          buffer.insert(", Dorian said", buffer.print().length)
          buffer.undo(2)

          // when
          buffer.redo(2)

          // then
          expect(buffer.print()).toEqual(document + ", Simon said, Dorian said")
        })
        it("Change, undo, change - redo does nothing", () => {
          // given
          const document = "Lorem ipsum dolor sit amet";
          const buffer = new TextBuffer(document)
          buffer.insert(", Dorian said", buffer.print().length)
          buffer.undo()
          buffer.insert(", Simon said", buffer.print().length)

          // when
          buffer.redo()

          // then
          expect(buffer.print()).toEqual(document + ", Simon said")
        })
      })
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

    it("Test 3", () => {
      const buffer = new TextBuffer("Big")

      buffer.insert(" brown", 3)
      buffer.delete(6, 1)

      expect([...buffer]).toEqual(["B", "i", "g", " ", "b", "r", "w", "n"])
    })
  })
  describe("index", () => {
    it("1", () => {
      const buffer = new TextBuffer("Big brown fox")

      expect(buffer.index(0)).toEqual("B")
    })
    it("2", () => {
      const buffer = new TextBuffer("Big brown fox")

      expect(buffer.index(buffer.print().length - 1)).toEqual("x")
    })
    it("3", () => {
      const buffer = new TextBuffer("Big brown fox")

      expect(buffer.index(-1)).toEqual("x")
    })
  })
  describe("getLine", () => {
    describe("original", () => {
      it("OOB on negative index", () => {
        const buffer = new TextBuffer()

        const line = () => buffer.getLine(-1);

        expect(line).toThrow("Index out of bounds")
      })
      it("OOB on index too large", () => {
        const buffer = new TextBuffer()

        const line = () => buffer.getLine(1);

        expect(line).toThrow("Index out of bounds")
      })
      it("Should get first line in single a line document", () => {
        const buffer = new TextBuffer("Big brown fox")

        const line = buffer.getLine(0);

        expect(line).toEqual("Big brown fox")
      })
      it("Should get first line in single a line document with a new line", () => {
        const buffer = new TextBuffer("Big brown fox\n")

        const line = buffer.getLine(0);

        expect(line).toEqual("Big brown fox\n")
      })
      it("Should get first line in a multi line document", () => {
        const buffer = new TextBuffer("Big brown fox\nJumped over a lazy dog")

        const line = buffer.getLine(0);

        expect(line).toEqual("Big brown fox\n")
      })
      it("Should get second line in a multi line document", () => {
        const buffer = new TextBuffer("Big brown fox\nJumped over a lazy dog")

        const line = buffer.getLine(1);

        expect(line).toEqual("Jumped over a lazy dog")
      })
    })
    describe("insertion", () => {
      it("Should get first line in single a line document", () => {
        const buffer = new TextBuffer("Big brown fox")
        buffer.insert(", and tall", 9)

        const line = buffer.getLine(0);

        expect(line).toEqual("Big brown, and tall fox")
      })
      it("Should get first line in single a line document with a newline", () => {
        const buffer = new TextBuffer("Big brown fox\n")
        buffer.insert(", and tall", 9)

        const line = buffer.getLine(0);

        expect(line).toEqual("Big brown, and tall fox\n")
      })
      it("Should get first line in multi line document with a newline", () => {
        const buffer = new TextBuffer("Big brown fox\n")
        buffer.insert("boar\nTall ", 4)

        const line = buffer.getLine(0);

        expect(line).toEqual("Big boar\n")
      })
      it("Should get second line in multi line document with a newline", () => {
        const buffer = new TextBuffer("Big brown fox")
        buffer.insert("boar\nTall ", 4)

        const line = buffer.getLine(1);

        expect(line).toEqual("Tall brown fox")
      })
    })
  })

  describe("lineCount", () => {
    describe("Original", () => {
      it("no line endings", () => {
        expect(new TextBuffer("").lineCount).toEqual(1)
      })
      it("single line ending", () => {
        expect(new TextBuffer("\n").lineCount).toEqual(2)
      })
      it("two line endings", () => {
        expect(new TextBuffer("asdads\nasdadsads\n").lineCount).toEqual(2)
      })
    })
    describe("insert", () => {
      it("no line endings", () => {
        const textBuffer = new TextBuffer("");
        textBuffer.insert("adsasd", 0)
        expect(textBuffer.lineCount).toEqual(1)
      })
      it("single line ending", () => {
        const textBuffer = new TextBuffer("\n");
        textBuffer.insert("adsasd", 0)
        expect(textBuffer.lineCount).toEqual(2)
      })
      it("two line endings", () => {
        const textBuffer = new TextBuffer("\n");
        textBuffer.insert("ads\nasd", 0)
        expect(textBuffer.lineCount).toEqual(3)
      })
    })
  })
})

const expectSameDocument = (actions: (buffer: TextBuffer, document: string) => void) => {
  // given
  const document = "Lorem ipsum dolor sit amet";
  const buffer = new TextBuffer(document)

  // when
  actions(buffer, document)

  // then
  expect(buffer.print()).toEqual(document)
}
