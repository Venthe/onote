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
  grammarScope: string;
  scopes: string[];
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

  parse({ data: document, fileType }: Document): TextMate.TokenizationResult[] {
    const grammar = this.pickGrammarScopeForDocument({ data: document, fileType })

    if (!grammar) {
      throw new Error("Grammar is not set")
    }

    const lines = document.split(/\r?\n/)
    const result: TextMate.ParsingResult[] = []
    const context = Lexer.INITIAL_CONTEXT

    lines.forEach((line, index) => {
      const tokenizationResult = this.tokenizeLine({ line, lineNumber: index, pattern: grammar, startIndex: 0, grammarScope: grammar.scopeName, scopes: [grammar.scopeName] }, context)
      const deduplicatedTokens = this.deduplicateScopes(tokenizationResult.tokens);
      const mappedTokens = this.mapTokensToContiguous(line, deduplicatedTokens)
      // TODO: Simplify scopes to be non-overlapping
      result.push({ line, tokens: mappedTokens })
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
      .flatMap((match, index) => {
        const startIndex = this.safeGetIndex(matchedData, index)[0];
        const endIndex = this.safeGetIndex(matchedData, index)[1];
        const patternCapture = this.mapPatternCapture({ ...tokenizationData, line: line.substring(startIndex, endIndex), pattern, startIndex, endIndex }, index, context, pattern.captures);
        return ([{
          scopes: [pattern.scopeName, ...tokenizationData.scopes],
          startIndex: startIndex,
          endIndex: endIndex
        }, ...patternCapture]);
      }) || [];
    return { line, tokens }
  }

  private mapPatternCapture(tokenizationData: TokenizationData<TextMate.SingleMatchLanguageRule>, index: number, context: TextMate.Context, capture?: TextMate.Capture): TextMate.Token[] {
    const thisCapture = capture?.[index];
    if (!thisCapture) {
      return []
    }

    if (!tokenizationData.endIndex) throw new Error("End index should be marked")

    if ((thisCapture as TextMate.NamedCapture).name) {
      return [{ scopes: [(thisCapture as TextMate.NamedCapture).name], startIndex: tokenizationData.startIndex, endIndex: tokenizationData.endIndex }]
    } else {
      const tokenizedLine = this.tokenizeLine({ ...tokenizationData, pattern: (thisCapture as TextMate.LanguageRule) }, context);
      return tokenizedLine.tokens
        .map(token => ({
          ...token,
          startIndex: token.startIndex + tokenizationData.startIndex,
          endIndex: token.endIndex + tokenizationData.startIndex
        }));
    }
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

  // TODO: Implement
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
    const resolvedPattern = this.resolveInclude((tokenizationData.pattern as TextMate.IncludeRule).include, tokenizationData.grammarScope);
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

  private deduplicateScopes(tokens: TextMate.Token[]): TextMate.Token[] {
    const dedupedTokens: Record<string, TextMate.Token> = {}

    tokens.forEach(token => {
      const tokenKey = `${token.startIndex}-${token.endIndex}`

      if (!dedupedTokens[tokenKey]) {
        dedupedTokens[tokenKey] = token
      } else {
        token.scopes.forEach(scope => dedupedTokens[tokenKey].scopes.push(scope))
      }
    })

    return Object.keys(dedupedTokens)
      .flatMap(key => dedupedTokens[key])
      .map(token => ({ ...token, scopes: this.deduplicate(token.scopes) }))
  }

  private mapTokensToContiguous(line: string, tokens: TextMate.Token[]): TextMate.Token[] {
    const resultObject: Record<string, TextMate.Token> = {}
    let index = 0;
    for (let i = 0; i < line.length; i++) {
      const tokensForIndex = tokens.filter(token => token.startIndex <= i && token.endIndex > i)
      const currentScopes = this.deduplicate(tokensForIndex.flatMap(token => token.scopes));

      if (resultObject[index] !== undefined && this.xor(resultObject[index]?.scopes ?? [], currentScopes).length > 0) {
        index++;
      }

      resultObject[index] = resultObject[index] === undefined
        ? { startIndex: i, endIndex: i + 1, scopes: currentScopes }
        : { ...resultObject[index], endIndex: i + 1, scopes: this.deduplicate([...currentScopes, ...resultObject[index].scopes]) }
    }

    const result = Object.keys(resultObject)
      .map(key => resultObject[key])
      .sort((a, b) => a.startIndex - b.startIndex);
    return result;
  }

  private deduplicate<T>(array: T[]): T[] {
    return [...new Set(array)]
  }

  private xor<T>(array1: T[], array2: T[]): T[] {
    let a = this.deduplicate(array1);
    let b = this.deduplicate(array2);
    return this.deduplicate([...a.filter(a_ => !b.includes(a_)), ...b.filter(b_ => !a.includes(b_))]);
  }
}
