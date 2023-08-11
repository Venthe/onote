import {Grammar} from "./types";

type ResolveGrammarParams = {
  scope?: string;
  fileType?: string;
  content?: string
};

export interface GrammarRepository {
  resolveGrammar(params: ResolveGrammarParams): Grammar | undefined
  resolveScope(params: ResolveGrammarParams): string | undefined
}

export class GrammarRepositoryImpl implements GrammarRepository {
  private readonly grammars: Record<string, Grammar> = {}

  loadGrammar(grammar: Grammar) {
    this.grammars[grammar.scopeName] = grammar
  }

  resolveScope(params: ResolveGrammarParams): string | undefined {
    return this.resolveGrammar(params)?.scopeName
  }

  resolveGrammar(params: ResolveGrammarParams): Grammar | undefined {
    const grammars = Object.keys(this.grammars).map(key => this.grammars[key]);
    for (const grammar of grammars) {
      const votes: boolean[] = []

      if (params.scope) {
        votes.push(grammar.scopeName === params.scope)
      }

      if (grammar.fileTypes && params.fileType) {
        votes.push(grammar.fileTypes.includes(params.fileType))
      }

      if (grammar.firstLineMatch && params.content) {
        votes.push(!!new RegExp(grammar.firstLineMatch, "i").exec(params.content.split(/\r?\n/, 1)[0]))
      }

      if (votes.includes(true)) {
        return grammar
      }
    }

    return undefined
  }
}
