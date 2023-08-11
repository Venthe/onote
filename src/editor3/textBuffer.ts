import {RegExpMatchArrayWithIndices} from "../editor2/types";
import {DocumentTextBuffer} from "../editor2/document";

/**
 * In computing, a piece table is a data structure typically used to represent a text document while it is edited in a text editor. Initially a reference (or 'span') to the whole of the original file is created, which represents the as yet unchanged file. Subsequent inserts and deletes replace a span by combinations of one, two, or three references to sections of either the original document or to a buffer holding inserted text.[1]
 *
 * Typically the text of the original document is held in one immutable block, and the text of each subsequent insert is stored in new immutable blocks. Because even deleted text is still included in the piece table, this makes multi-level or unlimited undo easier to implement with a piece table than with alternative data structures such as a gap buffer.
 */
// TODO: Implement history limit
// TODO: AppendHistory and AppendPieces should be merged
// TODO: Normalize when history limit is reached
// TODO: Handle files > 256mb
// TODO: Boost line lookup by using a balanced binary tree
// PieceTable
//  Some implementations: https://github.com/sparkeditor/piece-table
//  Abstract: https://code.visualstudio.com/blogs/2018/03/23/text-buffer-reimplementation
//            https://github.com/rebornix/PieceTree/tree/master
export class TextBuffer implements Iterable<string | undefined>, DocumentTextBuffer {
  private readonly original: string
  private added = ""
  private readonly pieces: BufferPiece[] = [];
  private readonly history: HistoryElement[] = []
  private undoCount = 0

  private static readonly outOfBoundsError = () => new Error("Index out of bounds");

  constructor(original?: string) {
    this.original = original ?? ""
    this.pieces.push(({
      bufferType: BufferType.Original,
      offset: 0,
      length: this.original.length,
      lineStarts: getLineStarts(this.original)
    }))
  }

  getBuffer = (type: BufferType) => type === BufferType.Original ? this.original : this.added;

  [Symbol.iterator]() {
    let index = 0;
    let offset = 0;

    return {
      next: () => {
        // move to next piece
        if (offset > this.pieces[index].length - 1) {
          index++;
          offset = 0;
        }

        // No more pieces
        if (index > this.pieces.length - 1) {
          return {done: true, value: undefined};
        }

        const piece = this.pieces[index];
        const val = this.getBuffer(piece.bufferType).substring(piece.offset + offset, piece.offset + 1 + offset)
        offset++;
        return {value: val, done: false};
      }
    };
  }

  getPieceText = (type: BufferType, offset: number, length: number): string => this.getBuffer(type).substring(offset, length);

  insert(text: string, offset: number): void {
    if (text.length === 0) {
      return
    }

    const textLength = text.length
    const addedOffset = this.added.length
    this.added += text

    const {
      index: pieceIndex,
      offset: bufferOffset
    } = this.pickPieceIndexAndOffset(offset)
    const originalPiece = this.pieces[pieceIndex]

    if (originalPiece.length === bufferOffset) {
      const piece = ({
        bufferType: BufferType.Added,
        offset: addedOffset,
        length: textLength,
        lineStarts: getLineStarts(text)
      });
      this.pieces.splice(pieceIndex + 1, 0, piece)
      this.appendHistory({
        change: {
          pieces: [],
          pieceStartIndex: this.pieces.length - 1,
          count: 1
        },
        compensation: {
          pieces: [{...piece}],
          count: 0,
          pieceStartIndex: pieceIndex + 1
        }
      })
      return;
    }

    const replacedPieces: BufferPiece[] = [
      {
        bufferType: originalPiece.bufferType,
        offset: originalPiece.offset,
        length: bufferOffset - originalPiece.offset,
        lineStarts: getLineStarts(this.getPieceText(originalPiece.bufferType, originalPiece.offset, bufferOffset - originalPiece.offset))
      },
      {
        bufferType: BufferType.Added,
        offset: addedOffset,
        length: textLength,
        lineStarts: getLineStarts(text)
      },
      {
        bufferType: originalPiece.bufferType,
        offset: bufferOffset,
        length: originalPiece.length - (bufferOffset - originalPiece.offset),
        lineStarts: getLineStarts(this.getPieceText(originalPiece.bufferType, bufferOffset, originalPiece.length - (bufferOffset - originalPiece.offset)))
      }
    ].filter(piece => piece.length > 0)
    this.appendHistory({
      change: {
        pieces: [{...originalPiece}],
        count: replacedPieces.length,
        pieceStartIndex: pieceIndex
      },
      compensation: {
        pieces: [...replacedPieces.map(el => ({...el}))],
        pieceStartIndex: pieceIndex,
        count: 1
      }
    })
    this.pieces.splice(pieceIndex, 1, ...replacedPieces);
  }

  delete(offset: number, length: number): void {
    if (length === 0) {
      return;
    }
    if (length < 0) {
      return this.delete(offset + length, -length);
    }
    if (offset < 0) {
      throw TextBuffer.outOfBoundsError();
    }

    // First, find the affected pieces, since a delete can span multiple pieces
    const {
      index: initialAffectedPieceIndex,
      offset: initialBufferOffset
    } = this.pickPieceIndexAndOffset(offset)
    const {
      index: finalAffectedPieceIndex,
      offset: finalBufferOffset
    } = this.pickPieceIndexAndOffset(offset + length)

    // If the delete occurs at the end or the beginning of a single piece, simply adjust the window
    const initialAffectedPiece = this.pieces[initialAffectedPieceIndex];
    if (initialAffectedPieceIndex === finalAffectedPieceIndex) {
      const piece = initialAffectedPiece;
      // Is the delete at the beginning of the piece?
      if (initialBufferOffset === piece.offset) {
        this.appendHistory({
          change: {
            pieces: [{...piece}],
            count: 1,
            pieceStartIndex: initialAffectedPieceIndex
          },
          compensation: {
            pieces: [{...piece}],
            pieceStartIndex: initialBufferOffset,
            count: 1
          }
        })
        piece.offset += length;
        piece.length -= length;
        return;
      }
      // Or at the end of the piece?
      else if (finalBufferOffset === piece.offset + piece.length) {
        this.appendHistory({
          change: {
            pieces: [{...piece}],
            count: 1,
            pieceStartIndex: initialAffectedPieceIndex
          },
          compensation: {
            pieces: [{...piece}],
            pieceStartIndex: initialBufferOffset,
            count: 1
          }
        })
        piece.length -= length;
        return;
      }
    }

    const finalAffectedPiece = this.pieces[finalAffectedPieceIndex];
    const deletePieces: BufferPiece[] = [
      {
        bufferType: initialAffectedPiece.bufferType,
        offset: initialAffectedPiece.offset,
        length: initialBufferOffset - initialAffectedPiece.offset,
        lineStarts: getLineStarts(this.getPieceText(initialAffectedPiece.bufferType, initialAffectedPiece.offset, initialBufferOffset - initialAffectedPiece.offset))
      },
      {
        bufferType: finalAffectedPiece.bufferType,
        offset: finalBufferOffset,
        length: finalAffectedPiece.length - (finalBufferOffset - finalAffectedPiece.offset),
        lineStarts: getLineStarts(this.getPieceText(finalAffectedPiece.bufferType, finalBufferOffset, finalAffectedPiece.length - (finalBufferOffset - finalAffectedPiece.offset)))
      }].filter(piece => piece.length > 0);

    this.appendHistory({
      change: {
        pieces: this.pieces.filter((e, i) => initialAffectedPieceIndex <= i && finalAffectedPieceIndex >= i).map(el => ({...el})),
        pieceStartIndex: initialAffectedPieceIndex,
        count: deletePieces.length
      },
      compensation: {
        count: finalAffectedPieceIndex - initialAffectedPieceIndex + 1,
        pieceStartIndex: initialAffectedPieceIndex,
        pieces: [...deletePieces.map(el => ({...el}))]
      }
    })
    this.pieces.splice(initialAffectedPieceIndex, finalAffectedPieceIndex - initialAffectedPieceIndex + 1, ...deletePieces);
  }

  print = (): string => this.pieces
    .map(piece =>
      this.getBuffer(piece.bufferType).substring(piece.offset, piece.offset + piece.length)
    )
    .join("");

  private pickPieceIndexAndOffset(offset: number) {
    if (offset < 0) {
      throw TextBuffer.outOfBoundsError()
    }

    let remainingOffset = offset
    for (const [pieceIndex, piece] of this.pieces.entries()) {
      if (remainingOffset <= piece.length) {
        return {index: pieceIndex, offset: piece.offset + remainingOffset}
      }

      remainingOffset -= piece.length
    }

    throw TextBuffer.outOfBoundsError()
  }

  public stringAt(offset: number, length: number): string | undefined {
    if (length < 0) {
      return this.stringAt(offset + length, -length);
    }
    let str = "";
    const {
      index: initialPieceIndex,
      offset: initialBufferOffset
    } = this.pickPieceIndexAndOffset(offset);
    const {
      index: finalPieceIndex,
      offset: finalBufferOffset
    } = this.pickPieceIndexAndOffset(offset + length);
    let piece = this.pieces[initialPieceIndex];
    const buf = piece.bufferType === BufferType.Added ? this.added : this.original;
    const remainingPieceLength = initialBufferOffset - piece.offset;
    if (length < piece.length - (remainingPieceLength)) {
      str = buf.substring(initialBufferOffset, length + initialBufferOffset);
    } else {
      str += buf.substring(initialBufferOffset, remainingPieceLength + initialBufferOffset);
      // Iterate through remaining pieces
      for (let i = initialPieceIndex; i <= finalPieceIndex; i++) {
        piece = this.pieces[i];
        const buf2 = piece.bufferType === BufferType.Added ? this.added : this.original;
        // If this is the final piece, only add the remaining length to the string
        if (i === finalPieceIndex) {
          str += buf2.substring(piece.offset, finalBufferOffset);
        }
        // Otherwise, add the whole piece to the string
        else {
          str += buf2.substring(piece.offset, piece.offset + piece.length);
        }
      }
    }
    return str === "" ? undefined : str;
  }

  index(i: number): string {
    if (i < 0) {
      return this.index(this.pieces.map(p => p.length - p.offset - 1)
        .reduce((acc, val) => acc + val, 0) - i - 1)
    }

    let currentLengthTotal = 0
    for (const element of this.pieces) {
      const bufferPiece = element;
      currentLengthTotal += bufferPiece.length
      if (i < currentLengthTotal) {
        return (bufferPiece.bufferType === BufferType.Original ? this.original : this.added)[Math.abs(i - (currentLengthTotal - bufferPiece.length))]
      }
    }

    throw TextBuffer.outOfBoundsError()
  }

  undo(number = 1) {
    if (number <= 0) return

    const historyElement = this.history[this.undoCount - 1]
    if (historyElement === undefined) throw new Error("!");

    this.pieces.splice(historyElement.change.pieceStartIndex, historyElement.change.count, ...historyElement.change.pieces)

    this.undoCount--
    this.undo(number - 1)
  }

  redo(number = 1) {
    if (number <= 0) return

    const historyElement = this.history[this.undoCount]
    if (historyElement === undefined) {
      return;
    }

    this.pieces.splice(historyElement.compensation.pieceStartIndex, historyElement.compensation.count, ...historyElement.compensation.pieces)

    this.undoCount++
    this.redo(number - 1)
  }

  private appendHistory(change: HistoryElement) {
    this.history.splice(this.undoCount)
    this.history.push(change)
    this.undoCount = this.history.length
  }

  // What an ugly, ugly code
  getLine(soughtLineIndex: number): string {
    if (soughtLineIndex < 0) throw TextBuffer.outOfBoundsError()

    let totalLineIndex = 0;
    let start: { pieceIndex: number, lineStart: number } | undefined = undefined
    let end: { pieceIndex: number, lineStart: number } | undefined = undefined
    for (const [pieceIndex, piece] of this.pieces.entries()) {
      if (!start && totalLineIndex === soughtLineIndex) {
        start = {pieceIndex, lineStart: 0}
      }

      for (const lineStart of piece.lineStarts) {
        totalLineIndex++
        if (start && totalLineIndex === soughtLineIndex + 1) {
          end = {pieceIndex, lineStart}
          break
        }
        if (!start && totalLineIndex === soughtLineIndex) {
          start = {pieceIndex, lineStart}
        }
      }

      if (end && start) break
    }

    if (start) {
      return [...this.pieces.entries()]
        .filter(([pieceIndex, piece]) => (start ? pieceIndex >= start.pieceIndex : false) && (end ? pieceIndex <= end.pieceIndex : true))
        .map(([pieceIndex, piece]) => {
            if (pieceIndex === start?.pieceIndex) {
              if (pieceIndex === end?.pieceIndex) return this.getBuffer(piece.bufferType).substring(piece.offset + start.lineStart, piece.offset + end.lineStart)
              else return this.getBuffer(piece.bufferType).substring(piece.offset + start.lineStart, piece.offset + piece.length)
            } else if (pieceIndex === end?.pieceIndex) return this.getBuffer(piece.bufferType).substring(piece.offset, piece.offset + end.lineStart)
            else return this.getBuffer(piece.bufferType).substring(piece.offset, piece.offset + piece.length)
          }
        )
        .join("");
    }

    // match out of bounds
    throw TextBuffer.outOfBoundsError()
  }

  get lineCount() {
    return this.pieces.map(piece => piece.lineStarts.length).reduce((a, val) => a + val, 1)
  }
}

type BufferPiece = {
  bufferType: BufferType;
  offset: number;
  length: number;
  lineStarts: number[]
}

function getLineStarts(text: string) {
  return (new RegExp(/\r?\n/, "md")
    .exec(text) as RegExpMatchArrayWithIndices | null)?.indices.map(i => i[1]) ?? [];
}

enum BufferType {
  /**
   * Represents original document
   */
  Original,
  Added
}

type Change = {
  pieces: BufferPiece[]
  pieceStartIndex: number
  count: number
}
type HistoryElement = {
  change: Change
  compensation: Change
}
