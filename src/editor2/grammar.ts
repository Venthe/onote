import * as TextMate from "./types";
import { Document } from "./lexer"

export class Grammar {
  constructor(private readonly grammar_: TextMate.Grammar) {
  }

  get grammar() {
    return this.grammar_;
  }

  isGrammarApplicable(document: Document): boolean {
    const votes: boolean[] = []

    if (!!this.grammar_.fileTypes && !!document.fileType) {
      votes.push(this.grammar_.fileTypes.includes(document.fileType))
    }

    if (this.grammar_.firstLineMatch) {
      votes.push(!!new RegExp(this.grammar_.firstLineMatch, "i").exec(document.data[0]))
    }

    return votes.includes(true)
  }
}
