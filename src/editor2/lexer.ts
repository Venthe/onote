import {ContextRoot, INode} from "./context";
import {Grammar} from "./grammar";
import * as TextMate from "./types";
import {
  BeginEndLanguageRule, Capture,
  IncludeRule, NamedCapture,
  Patterns,
  RegExpMatchArrayWithIndices,
  SingleMatchLanguageRule,
  TokenizationResult
} from "./types";
import {deduplicate, xor} from "./utils/array";

export type Document = {
  data: string
  fileType?: string
}

interface TokenizationData {
  line: string;
}

export class Lexer {
  private grammars: Record<string, Grammar> = {}

  constructor(private readonly grammarLoader: {
    loadGrammar: (scope: string) => TextMate.Grammar
  }) {
  }

  loadGrammar(...scopes: string[]) {
    scopes.map(scope => {
      console.debug(`Loading grammar for scope: ${scope}`)
      return this.grammarLoader.loadGrammar(scope);
    })
      .forEach(grammar => this.grammars[grammar.scopeName] = new Grammar(grammar))
  }

  parse({data: document, fileType}: Document): TokenizationResult[] {
    const grammar = this.pickGrammarScopeForDocument({data: document, fileType})

    if (!grammar) {
      throw new Error("Grammar is not set")
    }

    const lines = document.split(/\r?\n/)
    const contextRoot = new ContextRoot();
    const result: TokenizationResult[] = []

    // , lineNumber: index, pattern: grammar, startIndex: 0, grammarScope: grammar.scopeName, scopes: [grammar.scopeName]
    lines.forEach((line, lineNumber) => {
      const context = contextRoot.createChild({lineNumber, pattern: grammar})
      const tokenizationResult = this.tokenizeLine(line, context)
      const deduplicatedTokens = this.deduplicateScopes(tokenizationResult.tokens);
      const mappedTokens = this.mapTokensToContiguous(line, deduplicatedTokens)
      result.push({line, tokens: mappedTokens})
    })

    return result
  }

  private pickGrammarScopeForDocument(document: Document): TextMate.Grammar | undefined {
    return Object.keys(this.grammars)
      .map(grammarKey => this.grammars[grammarKey])
      .filter(grammar => grammar.isGrammarApplicable(document))
      .map(grammar => grammar.grammar)[0]
  }

  private tokenizeLine(line: string, context: INode): TokenizationResult {
    console.debug(`${Array.from(new Array(context.depth)).map(() => " ").join("")}Tokenizing line: (${context.lineNumber})[${JSON.stringify([context.startIndex, context.endIndex])}] "${line}"`)
    switch (true) {
      case this.isSingleMatch(context.pattern):
        return this.handleSingleMatchRule(line, context);
      case this.isBeginEndRule(context.pattern):
        return this.handleBeginEndRule(line, context)
      case this.isGrammar(context.pattern):
        return this.handleRuleWithPatterns(line, context)
      case this.isIncludeRule(context.pattern):
        return this.handleIncludeRule(line, context)
      default:
        console.error(context.pattern)
        throw new Error("Method not implemented");
    }
  }

  private isSingleMatch(pattern: TextMate.LanguageRule): boolean {
    return (pattern as TextMate.SingleMatchLanguageRule).match !== undefined
  }

  private handleSingleMatchRule(line: string, context: INode): TokenizationResult {
    console.debug(`handleSingleMatchRule: [${line}] "${context.pattern}"`)
    const pattern = context.pattern as SingleMatchLanguageRule
    const matchedData = new RegExp(pattern.match, "id").exec(line) as RegExpMatchArrayWithIndices | null;
    if (!matchedData) {
      return {line, tokens: []}
    }
    console.debug(`Single rule matched: [${pattern.match}][${JSON.stringify([matchedData.indices?.[0][0], matchedData.indices?.[0][1]])}] "${matchedData[0]}"`)

    const tokens: TextMate.Token[] = matchedData
      .flatMap((match, index) => {
        const startIndex = this.safeGetIndex(matchedData, index)[0];
        const endIndex = this.safeGetIndex(matchedData, index)[1];

        return [{
          scopes: [pattern.scopeName, ...context.scopes],
          startIndex: startIndex,
          endIndex: endIndex
        }, ...this.mapPatternCapture(line, context, startIndex, endIndex, pattern.captures?.[index])];
      });
    return {line, tokens}
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
      const tokenizedLine = this.tokenizeLine(line, context.createChild({lineNumber: context.lineNumber, limits: [startIndex, endIndex], pattern: capture as Patterns}));
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

  private isBeginEndRule(pattern: TextMate.LanguageRule): boolean {
    return (pattern as TextMate.BeginEndLanguageRule).begin !== undefined && (pattern as TextMate.BeginEndLanguageRule).end !== undefined
  }

  // TODO: Implement
  private handleBeginEndRule(line: string, context: INode): TokenizationResult {
    const pattern = context.pattern as BeginEndLanguageRule
    console.debug(`handleBeginEndRule: [${line}] "${pattern}"`)
    if (!context.isScopeOpen(pattern.scopeName)) {
      const matchedData = new RegExp(pattern.begin, "id").exec(line) as RegExpMatchArrayWithIndices | null
      if (!matchedData) {
        return {line, tokens: []}
      }

      const beginIndex = matchedData.indices?.[0]
      if (!beginIndex) {
        throw new Error("This index should never be undefined")
      }

      console.debug(`Begin rule matched: [${pattern.begin}][${JSON.stringify([matchedData.indices?.[0][0], matchedData.indices?.[0][1]])}] "${matchedData[0]}"`)
      context.markScopeBegin(pattern.scopeName, beginIndex[1], pattern)

      return {
        line,
        tokens: [{
          startIndex: beginIndex[0],
          scopes: [pattern.scopeName],
          endIndex: beginIndex[1]
        }]
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

      console.debug(`End rule matched: [${pattern.end}][${JSON.stringify([matchedData.indices?.[0][0], matchedData.indices?.[0][1]])}] "${matchedData[0]}"`)
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

  private isGrammar(pattern: TextMate.LanguageRule): boolean {
    return (pattern as TextMate.Patterns).patterns !== undefined;
  }

  private handleRuleWithPatterns(line: string, context: INode): TokenizationResult {
    const pattern = context.pattern as Patterns
    console.debug(`handleRuleWithPatterns: [${line}][${pattern.strategy}]`)
    switch (true) {
      case pattern.strategy === undefined:
      case pattern.strategy === "matchAll":
        return pattern.patterns
          .map(subPattern => this.tokenizeLine(line, context.createChild({lineNumber: context.lineNumber, pattern: subPattern, limits: [context.startIndex, context.endIndex]})))
          .reduce((acc, val) => {
            val.tokens.forEach(token => acc.tokens.push(token))
            return acc
          }, {line: line, tokens: []})
      case pattern.strategy === "matchFirst":
        // eslint-disable-next-line no-case-declarations
        let result = undefined
        for(const p of pattern.patterns) {
          const r = this.tokenizeLine(line, context.createChild({lineNumber: context.lineNumber, pattern: p, limits: [context.startIndex, context.endIndex]}))
          if(r.tokens.length > 0) {
            result = r;
            break;
          }
        }
        return result ?? {line, tokens: []}
      default:
        throw new Error("Unknown pattern strategy " + pattern.strategy)
    }
  }

  private isIncludeRule(pattern: TextMate.LanguageRule): boolean {
    return (pattern as TextMate.IncludeRule).include !== undefined;
  }

  private handleIncludeRule(line: string, context: INode): TokenizationResult {
    const pattern = context.pattern as IncludeRule
    console.debug(`handleIncludeRule: [${line}] "${pattern}"`)
    const resolvedPattern = this.resolveInclude((pattern as TextMate.IncludeRule).include, context.grammarScope);
    return this.tokenizeLine(line, context.createChild({lineNumber: context.lineNumber, pattern: resolvedPattern, limits: [context.startIndex, context.endIndex]}));
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

  private resolveGrammar(scope: string): TextMate.Grammar {
    if (!this.grammars[scope]) {
      throw new Error("Grammar is not set")
    }

    console.debug(`Resolving grammar: "${scope}"`)
    return this.grammars[scope].grammar
  }

  private resolveFromCurrentGrammarRepository(includeKey: string, parentGrammarScope: string): TextMate.LanguageRule {
    const grammar = this.grammars[parentGrammarScope]?.grammar;

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

    const result = Object.keys(resultObject)
      .map(key => resultObject[key])
      .sort((a, b) => a.startIndex - b.startIndex);
    return result;
  }
}
