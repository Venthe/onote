import * as TextMate from "./types";
import {
  NamedCapture,
  Patterns,
  RegExpMatchArrayWithIndices,
  SingleMatchLanguageRule,
  TokenizationResult
} from "./types";
import {deduplicate, xor} from "./utils/array";
import {DocumentLexer, DocumentTextBuffer} from "./document";
import {GrammarRepository} from "./grammarRepository";
import {Context} from "./context";

type TokenizerParams<T extends TextMate.LanguageRule = TextMate.LanguageRule> = {
  index: number,
  line: string,
  startIndex?: number,
  endIndex?: number,
  pattern: T
};

export class Lexer implements DocumentLexer {
  constructor(private readonly grammarRepository: GrammarRepository,
              private readonly textBuffer: DocumentTextBuffer) {
  }

  /* get documentType(): string {
       // return this.grammarRepository.resolveGrammar({})
     throw new Error("")
   }*/

  /*loadGrammar(...scopes: string[]) {
      scopes.map(scope => {
          console.debug(`Loading grammar for scope: ${scope}`)
          return this.grammarLoader.loadGrammar(scope);
      }).forEach(grammar => this.grammars[grammar.scopeName] = new Grammar(grammar))
  }*/

  parse(scopeName: string): TokenizationResult[] {
    const grammar = this.grammarRepository.resolveGrammar({scope: scopeName})

    if (!grammar) {
      throw new Error("Grammar is not set")
    }

    const context = new Context(grammar.scopeName);
    const result: TokenizationResult[] = []

    for (let lineIndex = 0; lineIndex < this.textBuffer.lineCount; lineIndex++) {
      const line = this.textBuffer.getLine(lineIndex)
      const tokens = this.tokenizeString({
        index: lineIndex,
        line,
        startIndex: 0,
        endIndex: line.length,
        pattern: grammar
      }, context)
      const deduplicatedTokens = this.deduplicateScopes(tokens);
      const mappedTokens = this.mapTokensToContiguous(line, deduplicatedTokens)
      result.push({line, tokens: mappedTokens})
    }

    return result
  }

  private tokenizeString(_params: TokenizerParams, context: Context): TextMate.Token[] {
    const params: TokenizerParams = {
      ..._params,
      startIndex: _params.startIndex ?? 0,
      endIndex: _params.endIndex ?? _params.line.length
    }

    console.debug(`Tokenizing line: [lineNumber:${params.index}][limits:${JSON.stringify([params.startIndex, params.endIndex])}] - "${params.line}"`)

    // If-else due to switch pattern matching not really working with typescript
    //  is-predicate
    if (context.hasOpenScope()) {
      return this.tokenizeString({...params, pattern: context.openScope.pattern}, context)
    } else if (this.isIncludeRule(params.pattern)) {
      return this.tokenizeString({
        ...params,
        pattern: this.resolveInclude(params.pattern.include, context)
      }, context)
    } else if (this.isSingleMatch(params.pattern)) {
      return this.handleSingleMatchRule(params as TokenizerParams<TextMate.SingleMatchLanguageRule>, context);
    } else if (this.isBeginEndRule(params.pattern)) {
      return this.handleBeginEndRule(params as TokenizerParams<TextMate.BeginEndLanguageRule>, context)
    } else if (this.isGrammar(params.pattern)) {
      return this.handleRuleWithPatterns(params as TokenizerParams<TextMate.Grammar>, context)
    }

    throw new Error(`Unknown pattern type ${JSON.stringify(params.pattern)}`);
  }

  private isSingleMatch = (pattern: TextMate.LanguageRule): pattern is TextMate.SingleMatchLanguageRule =>
    (pattern as TextMate.SingleMatchLanguageRule).match !== undefined;

  private handleSingleMatchRule(params: TokenizerParams<SingleMatchLanguageRule>, context: Context): TextMate.Token[] {
    console.debug(`handleSingleMatchRule: [match:${params.pattern.match}] - "${params.line}"`)
    const matchedData = new RegExp(params.pattern.match, "id").exec(params.line) as RegExpMatchArrayWithIndices | null;
    if (!matchedData) {
      return []
    }
    console.debug(`Single rule matched: [match:${params.pattern.match}][limits:${JSON.stringify([matchedData.indices?.[0][0], matchedData.indices?.[0][1]])}] - matchedData:${matchedData[0]}"`)

    const tokens: TextMate.Token[] = matchedData
      .flatMap((match, index) => {
        const startIndex = this.safeGetIndex(matchedData, index)[0];
        const endIndex = this.safeGetIndex(matchedData, index)[1];

        return [{
          scopes: [params.pattern.scopeName, ...context.scopes],
          startIndex: startIndex,
          endIndex: endIndex
        }, ...this.mapPatternCapture(params.line, context, startIndex, endIndex, params.pattern.captures?.[index])];
      });
    return tokens
  }

  private mapPatternCapture(line: string, context: INode, startIndex: number, endIndex: number, capture?: NamedCapture | Patterns): TextMate.Token[] {
    if (!capture) {
      return []
    }

    if (!endIndex) throw new Error("End index should be marked")

    if ((capture as TextMate.NamedCapture).name) {
      return [{
        scopes: [(capture as TextMate.NamedCapture).name, ...context.scopes],
        startIndex: startIndex,
        endIndex: endIndex
      }]
    } else {
      const tokenizedLine = this.tokenizeString(line, context.createChild({
        lineNumber: context.lineNumber,
        limits: [startIndex, endIndex],
        pattern: capture as Patterns
      }));
      return tokenizedLine.tokens
        .map(token => ({
          ...token,
          startIndex: token.startIndex + context.startIndex,
          endIndex: token.endIndex + context.startIndex
        }));
    }
  }

  private safeGetIndex(matchedData: RegExpMatchArrayWithIndices, index: number): [number, number] {
    const indices = matchedData.indices?.[index];

    if (!indices) {
      throw new Error("Index not found, this should not happen. ", indices)
    }

    return indices
  }

  private isBeginEndRule = (pattern: TextMate.LanguageRule): pattern is TextMate.BeginEndLanguageRule => (pattern as TextMate.BeginEndLanguageRule).begin !== undefined && (pattern as TextMate.BeginEndLanguageRule).end !== undefined;

  private handleBeginEndRule(params: TokenizerParams<TextMate.BeginEndLanguageRule>, context: Context): TextMate.Token[] {
    console.debug(`handleBeginEndRule: [pattern:${params.pattern.begin}:${params.pattern.end}] - "${params.line}"`)
    if (!context.isScopeOpen(params.pattern.scopeName)) {
      const matchedData = new RegExp(pattern.begin, "id").exec(line) as RegExpMatchArrayWithIndices | null
      if (!matchedData) {
        return {line, tokens: []}
      }

      const beginIndex = matchedData.indices?.[0]
      if (!beginIndex) {
        throw new Error("This index should never be undefined")
      }

      console.debug(`Begin rule matched: [begin:${pattern.begin}][limits:${JSON.stringify([matchedData.indices?.[0][0], matchedData.indices?.[0][1]])}] - "${matchedData[0]}"`)
      context.markScopeBegin(pattern.scopeName, beginIndex[1], pattern)

      const searchForEnd = this.tokenizeString(line, context.createChild({
        lineNumber: context.lineNumber,
        pattern: pattern,
        limits: [beginIndex[1]]
      }))

      return {
        line,
        tokens: [{
          startIndex: beginIndex[0],
          scopes: [pattern.scopeName],
          endIndex: beginIndex[1]
        }, ...searchForEnd.tokens.map(a => ({
          ...a,
          endIndex: a.endIndex + beginIndex[1],
          startIndex: a.startIndex + beginIndex[1]
        }))]
      }
    } else {
      const matchedData = new RegExp(pattern.end, "id").exec(line) as RegExpMatchArrayWithIndices | null
      if (!matchedData) {
        return {line, tokens: []}
      }

      const endIndex = matchedData.indices?.[0]
      if (!endIndex) {
        throw new Error("This index should never be undefined")
      }

      console.debug(`End rule matched: [end:${pattern.end}][limits:${JSON.stringify([matchedData.indices?.[0][0], matchedData.indices?.[0][1]])}] - "${matchedData[0]}"`)
      context.markScopeEnd(pattern.scopeName, endIndex[0])

      return {
        line,
        tokens: [{
          startIndex: endIndex[0],
          scopes: [pattern.scopeName],
          endIndex: endIndex[1]
        }]
      }
    }
  }

  private isGrammar = (pattern: TextMate.LanguageRule): pattern is TextMate.Grammar =>
    (pattern as TextMate.Patterns).patterns !== undefined;

  private handleRuleWithPatterns(params: TokenizerParams<TextMate.Patterns>, context: Context): TextMate.Token[] {
    console.debug(`handleRuleWithPatterns: - "${params.line}"`)

    for (const pattern of params.pattern.patterns) {
      const result = this.tokenizeString({...params, pattern}, context)
      if (result.length > 0) {
        return result
      }
    }
    return []
  }

  private isIncludeRule(pattern: TextMate.LanguageRule): pattern is TextMate.IncludeRule {
    return (pattern as TextMate.IncludeRule).include !== undefined;
  }

  private resolveInclude(include: string, context: Context): TextMate.LanguageRule {
    switch (true) {
      case include === "$self":
        return this.resolveGrammar(context.grammarScope)
      case include.startsWith("#"):
        return this.resolveFromCurrentGrammarRepository(include.substring(1, include.length), context.grammarScope)
      default:
        return this.resolveGrammar(include)
    }
  }

  private resolveGrammar(scope: string): TextMate.Grammar {
    const grammar = this.grammarRepository.resolveGrammar({scope})
    if (!grammar) {
      throw new Error("Grammar is not set")
    }

    console.debug(`Resolving grammar: "${scope}"`)
    return grammar
  }

  private resolveFromCurrentGrammarRepository(includeKey: string, parentGrammarScope: string): TextMate.LanguageRule {
    const grammar = this.grammarRepository.resolveGrammar({scope: parentGrammarScope})

    if (!grammar) {
      throw new Error("Grammar is not set")
    }

    if (!grammar.repository?.[includeKey]) {
      throw new Error("Key " + includeKey + " not found in the repository")
    }

    console.debug(`Resolving pattern from repository: "${parentGrammarScope}:${includeKey}"`)
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
      .map(token => ({...token, scopes: deduplicate(token.scopes)}))
  }

  private mapTokensToContiguous(line: string, tokens: TextMate.Token[]): TextMate.Token[] {
    const resultObject: Record<string, TextMate.Token> = {}
    let index = 0;
    for (let i = 0; i < line.length; i++) {
      const tokensForIndex = tokens.filter(token => token.startIndex <= i && token.endIndex > i)
      const currentScopes = deduplicate(tokensForIndex.flatMap(token => token.scopes));

      if (resultObject[index] !== undefined && xor(resultObject[index]?.scopes ?? [], currentScopes).length > 0) {
        index++;
      }

      resultObject[index] = resultObject[index] === undefined
        ? {startIndex: i, endIndex: i + 1, scopes: currentScopes}
        : {
          ...resultObject[index],
          endIndex: i + 1,
          scopes: deduplicate([...currentScopes, ...resultObject[index].scopes])
        }
    }

    return Object.keys(resultObject)
      .map(key => resultObject[key])
      .sort((a, b) => a.startIndex - b.startIndex);
  }
}
