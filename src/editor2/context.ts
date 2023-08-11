import {LanguageRule} from "./types";

type CreateChildParams = {
  pattern: LanguageRule;
  lineNumber: number,
  limits?: [number, number | undefined] | [number, number] | [number],
  scopes?: string[]
};

interface ICommon {
  createChild(params: CreateChildParams): INode
  depth: number
}

export interface INode extends ICommon {
  grammarScope: string;
  scopes: string[];
  lineNumber: number
  startIndex: number
  endIndex?: number
  pattern: LanguageRule
  isScopeOpen(scopeName: string): boolean;
  markScopeBegin(scopeName: string, beginIndex: number, pattern: LanguageRule): void;
  markScopeEnd(scopeName: string, endIndex: number): void;
  swapPattern(resolveInclude: LanguageRule): void;
}

export class ContextRoot implements ICommon {
  depth = 0
  private scopes: {
    scopeName: string,
    pattern: LanguageRule,
    startIndex: number,
    lineNumber: number,
    endIndex?: number
  }[] = []

  createChild = (params: CreateChildParams): INode => new Node(this, params);

  isScopeOpen(scopeName: string): boolean {
    return !!this.scopes
      .filter(sc => sc.scopeName === scopeName)
      .filter(sc => !sc.endIndex)[0];
  }

  markScopeBegin(scopeName: string, startIndex: number, pattern: LanguageRule, lineNumber: number): void {
    this.scopes.push({
      scopeName,
      startIndex,
      pattern,
      lineNumber
    });
  }

  markScopeEnd(scopeName: string, endIndex: number): void {
    this.scopes
      .filter(s => s.scopeName === scopeName)
      .filter(s => !s.endIndex)[0]
      .endIndex = endIndex
  }
}

class Node implements INode {
  private subPattern?: LanguageRule

  constructor(private readonly parent: INode | ContextRoot,
              private readonly params: CreateChildParams) {
  }

  get grammarScope() {
    return (this.parent as any)?.grammarScope ?? (this.params.pattern as any).scopeName ?? "UNKNOWN"
  }

  get lineNumber(): number {
    return this.params.lineNumber
  }

  get depth() {
    return 1 + this.parent.depth
  }

  get pattern() {
    return this.subPattern ?? this.params.pattern
  }

  get startIndex() {
    return this.params.limits?.[0] ?? 0
  }

  get endIndex() {
    return this.params.limits?.[1]
  }

  get scopes() {
    return [(this.params.pattern as any).scopeName, ...((this.parent as any)?.scopes ?? [])].filter(e => !!e) as string[]
  }

  createChild = (params: CreateChildParams): INode => new Node(this, params);

  isScopeOpen = (scopeName: string): boolean => this.parent.isScopeOpen(scopeName);

  markScopeBegin(scopeName: string, beginIndex: number, pattern: LanguageRule, lineNumber?: number): void {
    this.parent.markScopeBegin(scopeName, beginIndex, pattern, lineNumber ?? this.params.lineNumber)
  }

  markScopeEnd(scopeName: string, endIndex: number): void {
    this.parent.markScopeEnd(scopeName, endIndex)
  }

  swapPattern(resolveInclude: LanguageRule): void {
    this.subPattern = resolveInclude
  }
}
