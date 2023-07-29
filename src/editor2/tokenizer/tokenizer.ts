// @ts-nocheck

import * as TextMate from "./types";
import { RuleStack, TokenizationResult } from "./types";

export class Tokenizer {
  public static INITIAL_STACK: unknown;

  private grammar: TextMate.Grammar

  constructor(private readonly grammarLoader: { loadGrammar: (scope: string) => TextMate.Grammar }) {

  }

  loadGrammar(scope: TextMate.Grammar) {
    this.grammar = this.grammarLoader.loadGrammar(scope)
  }

  tokenizeLine(line: string, ruleStack: RuleStack = Tokenizer.INITIAL_STACK): TokenizationResult {
    // console.log({ line, grammar: this.grammar, ruleStack })

    const result = this.grammar.patterns.map(this.tokenizeWithPattern(line))

    console.log(JSON.stringify(result))

    return result
  }

  private tokenizeWithPattern(line) {
    return pattern => {
      switch (true) {
        case pattern.include !== undefined:
          return [this.resolveInclude(pattern.include)]
        case pattern.alternatives !== undefined:
          return pattern.alternatives.map(this.tokenizeWithPattern(line))
        default:
          console.error(pattern)
          throw new Error("Method not implemented");
      }
    }
  }

  private resolveInclude(include: string) {
    switch (true) {
      case include === "$self":
        return this.resolveThisGrammar()
      case include.startsWith("#"):
        return this.resolveFromCurrentGrammarRepository(include.substring(1, include.length))
      default:
        return this.resolveLanguage(include)
    }
  }

  private resolveThisGrammar() {
    throw new Error("Method not implemented.");
  }

  private resolveFromCurrentGrammarRepository(includeKey: string) {
    return this.grammar.repository[includeKey]
  }

  private resolveLanguage(languageScope: string) {
    throw new Error("Method not implemented.");
  }
}
