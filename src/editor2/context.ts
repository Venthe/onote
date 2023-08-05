import {LanguageRule} from "./types";

type CreateChildParams = {
  pattern: LanguageRule;
  lineNumber: number,
  limits?: [number, number | undefined]
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

  markScopeBegin(scopeNamescopeName: string, beginIndex: number, pattern: LanguageRule): boolean;

  markScopeEnd(scopeName: string, endIndex: number): boolean;
}

export class ContextRoot implements ICommon {
  depth = 0

  createChild(params: CreateChildParams): INode {
    return new Node(this, params)
  }
}

class Node implements INode {
  constructor(private readonly parent: INode | ContextRoot, private readonly params: CreateChildParams) {
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
    return this.params.pattern
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

  createChild(params: CreateChildParams): INode {
    return new Node(this, params)
  }

  isScopeOpen(scopeName: string): boolean {
    throw new Error("Method not implemented")
  }

  markScopeBegin(scopeName: string, beginIndex: number, pattern: LanguageRule): boolean {
    throw new Error("Method not implemented")
  }

  markScopeEnd(scopeName: string, endIndex: number): boolean {
    throw new Error("Method not implemented")
  }
}

// const result: TextMate.ParsingResult[] = []
// lineNumber: number;
// startIndex: number;
// endIndex?: number;
// pattern: T;
// grammarScope: string;
// scopes: string[];
