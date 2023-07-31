import { Grammar } from "./grammar";
import * as TextMate from "./types";

export type Document = {
  data: string
  fileType?: string
}


interface TokenizationData<T extends TextMate.LanguageRule = TextMate.LanguageRule> {
  line: string;
  lineNumber: number;
  startIndex: number;
  endIndex?: number;
  pattern: T;
  parentGrammarScope: string;
};

export class Lexer {
  public static INITIAL_CONTEXT: TextMate.Context;

  private grammars: Record<string, Grammar> = {}

  constructor(private readonly grammarLoader: { loadGrammar: (scope: string) => TextMate.Grammar }) {
  }

  loadGrammar(...scopes: string[]) {
    scopes.map(scope => this.grammarLoader.loadGrammar(scope))
      .forEach(grammar => this.grammars[grammar.scopeName] = new Grammar(grammar))
  }

  parse({ data: document, fileType }: Document) {
    const grammar = this.pickGrammarScopeForDocument({ data: document, fileType })

    if (!grammar) {
      throw new Error("Grammar is not set")
    }

    const lines = document.split(/\r?\n/)
    const result: TextMate.ParsingResult[] = []
    const context = Lexer.INITIAL_CONTEXT

    lines.forEach((line, index) => {
      const tokenizationResult = this.tokenizeLine({ line, lineNumber: index, pattern: grammar, startIndex: 0, parentGrammarScope: grammar.scopeName }, context)
      result.push({ ...tokenizationResult })
    })

    return result
  }

  private pickGrammarScopeForDocument(document: Document): TextMate.Grammar | undefined {
    return Object.keys(this.grammars)
      .map(grammarKey => this.grammars[grammarKey])
      .filter(grammar => grammar.isGrammarApplicable(document))
      .map(grammar => grammar.grammar)[0]
  }

  private tokenizeLine(tokenizationData: TokenizationData, context: TextMate.Context): TextMate.TokenizationResult {

    switch (true) {
      case this.isSingleMatch(tokenizationData.pattern):
        return this.handleSingleMatchRule(tokenizationData as TokenizationData<TextMate.SingleMatchLanguageRule>, context);
      case this.isBeginEndRule(tokenizationData.pattern):
        return this.handleBeginEndRule(tokenizationData as TokenizationData<TextMate.BeginEndLanguageRule>, context)
      case this.isRuleWithPatterns(tokenizationData.pattern):
        return this.handleRuleWithPatterns(tokenizationData as TokenizationData<TextMate.Patterns>, context)
      case this.isIncludeRule(tokenizationData.pattern):
        return this.handleIncludeRule(tokenizationData as TokenizationData<TextMate.IncludeRule>, context)
      default:
        console.error(tokenizationData.pattern)
        throw new Error("Method not implemented");
    }
  }

  private isSingleMatch(pattern: TextMate.LanguageRule): boolean {
    return (pattern as TextMate.SingleMatchLanguageRule).match !== undefined
  }

  private handleSingleMatchRule({ line, pattern, ...tokenizationData }: TokenizationData<TextMate.SingleMatchLanguageRule>, context: TextMate.Context): TextMate.TokenizationResult {
    const matchedData = new RegExp(pattern.match, "id").exec(line);
    if (!matchedData) {
      return { line, tokens: [] }
    }

    const tokens: TextMate.Token[] = matchedData
      .map((match, index) => {
        const startIndex = this.safeGetIndex(matchedData, index)[0];
        const endIndex = this.safeGetIndex(matchedData, index)[1];
        return ({
          scopes: [pattern.scopeName, ...this.mapPatternCapture({ ...tokenizationData, line, pattern, startIndex, endIndex }, index, context, pattern.captures)],
          startIndex: startIndex,
          endIndex: endIndex
        });
      }) || [];
    return { line, tokens }
  }

  private mapPatternCapture(tokenizationData: TokenizationData<TextMate.SingleMatchLanguageRule>, index: number, context: TextMate.Context, capture?: TextMate.Capture): string[] {
    const thisCapture = capture?.[index];
    if (!thisCapture) {
      return []
    }

    if ((thisCapture as TextMate.NamedCapture).name) {
      return [(thisCapture as TextMate.NamedCapture).name]
    } else if ((thisCapture as TextMate.Patterns).patterns) {
      const result = this.handleRuleWithPatterns({ ...tokenizationData, pattern: (thisCapture as TextMate.Patterns) }, context);
      // TODO: It properly maps to TextMate.TokenizationResult
      throw new Error("Method not implemented");
    }

    throw new Error("Invalid capture definition. " + capture)
  }

  private safeGetIndex(matchedData: RegExpExecArray, index: number): [number, number] {
    const indices = matchedData.indices?.[index];

    if (!indices) {
      throw new Error("Index not found, this should not happen. ", indices)
    }

    return indices
  }

  private isBeginEndRule(pattern: TextMate.LanguageRule): boolean {
    return (pattern as TextMate.BeginEndLanguageRule).begin !== undefined && (pattern as TextMate.BeginEndLanguageRule).end !== undefined
  }

  private handleBeginEndRule({ line, pattern, ...props }: TokenizationData<TextMate.BeginEndLanguageRule>, context: TextMate.Context): TextMate.TokenizationResult {
    // const matchedData = new RegExp(pattern.begin, "id").exec(line)

    // if (matchedData) {
    //   context.markScopeBegin({ scope: pattern.scopeName, indices: matchedData.indices?.[0], contentScope: pattern.contentScope })
    //   const result = matchedData?.map((match, index) => ({ match, index: matchedData.indices?.[index], additionalScope: pattern.beginCaptures?.[index].name }))
    //     .map(el => ({ startIndex: el.index?.[0], endIndex: el.index?.[1], scopes: [pattern.scopeName, el.additionalScope, context.activeScopes].filter(el => el !== undefined) }))

    //   if (pattern.patterns) {
    //     const recursiveResult = this.tokenizeWithPattern(line, { patterns: pattern.patterns }, context)

    //     return [...result, ...recursiveResult]
    //   } else {
    //     return result
    //   }
    // }

    throw new Error("Method not implemented")
  }

  private isRuleWithPatterns(pattern: TextMate.LanguageRule): boolean {
    return (pattern as TextMate.Patterns).patterns !== undefined;
  }

  private handleRuleWithPatterns(tokenizationData: TokenizationData<TextMate.Patterns>, context: TextMate.Context): TextMate.TokenizationResult {
    switch (true) {
      case tokenizationData.pattern.strategy === undefined:
      case tokenizationData.pattern.strategy === "matchAll":
        return tokenizationData.pattern.patterns
          .map(subPattern => this.tokenizeLine({ ...tokenizationData, pattern: subPattern }, context))
          .reduce((acc, val) => {
            val.tokens.forEach(token => acc.tokens.push(token))
            return acc
          }, { line: tokenizationData.line, tokens: [] })
      case tokenizationData.pattern.strategy === "matchFirst":
        return tokenizationData.pattern.patterns.map(subPattern => this.tokenizeLine({ ...tokenizationData, pattern: subPattern }, context))[0]
      default:
        throw new Error("Unknown pattern strategy " + tokenizationData.pattern.strategy)
    }
  }

  private isIncludeRule(pattern: TextMate.LanguageRule): boolean {
    return (pattern as TextMate.IncludeRule).include !== undefined;
  }

  private handleIncludeRule(tokenizationData: TokenizationData<TextMate.IncludeRule>, context: TextMate.Context): TextMate.TokenizationResult {
    const resolvedPattern = this.resolveInclude((tokenizationData.pattern as TextMate.IncludeRule).include, tokenizationData.parentGrammarScope);
    return this.tokenizeLine({ ...tokenizationData, pattern: resolvedPattern }, context);
  }

  private resolveInclude(include: string, parentGrammarScope: string): TextMate.LanguageRule {
    switch (true) {
      case include === "$self":
        return this.resolveGrammar(parentGrammarScope)
      case include.startsWith("#"):
        return this.resolveFromCurrentGrammarRepository(include.substring(1, include.length), parentGrammarScope)
      default:
        return this.resolveGrammar(include)
    }
  }

  private resolveGrammar(parentGrammarScope: string): TextMate.Grammar {
    if (!this.grammars[parentGrammarScope]) {
      throw new Error("Grammar is not set")
    }

    return this.grammars[parentGrammarScope].grammar
  }

  private resolveFromCurrentGrammarRepository(includeKey: string, parentGrammarScope: string): TextMate.LanguageRule {
    const grammar = this.grammars[parentGrammarScope]?.grammar;

    if (!grammar) {
      throw new Error("Grammar is not set")
    }

    if (!grammar.repository?.[includeKey]) {
      throw new Error("Key " + includeKey + " not found in the repository")
    }

    return grammar.repository[includeKey]
  }
}
