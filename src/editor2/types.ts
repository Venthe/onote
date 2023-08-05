
/** Language grammars are used to assign names to document elements such as keywords, comments, strings or similar. The purpose of this is to allow styling (syntax highlighting) and to make the text editor “smart” about which context the caret is in. For example you may want a key stroke or tab trigger to act differently depending on the context, or you may want to disable spell check as you type those portions of your text document which are not prose (e.g. HTML tags).

The language grammar is used only to parse the document and assign names to subsets of this document. Then scope selectors can be used for styling, preferences and deciding how keys and tab triggers should expand. */
export type Grammar = {
  /** This should be a unique name for the grammar, following the convention of being a dot-separated name where each new (left-most) part specializes the name. Normally it would be a two-part name where the first is either text or source and the second is the name of the language or document type. But if you are specializing an existing type, you probably want to derive the name from the type you are specializing. For example Markdown is text.html.markdown and Ruby on Rails (rhtml files) is text.html.rails. The advantage of deriving it from (in this case) text.html is that everything which works in the text.html scope will also work in the text.html.«something» scope (but with a lower precedence than something specifically targeting text.html.«something»). */
  scopeName: string

  /** This is an array of file type extensions that the grammar should (by default) be used with. This is referenced when TextMate does not know what grammar to use for a file the user opens. If however the user selects a grammar from the language pop-up in the status bar, TextMate will remember that choice. */
  fileTypes: string[]

  /** a regular expression which is matched against the first line of the document (when it is first loaded). If it matches, the grammar is used for the document (unless there is a user override). Example: ^#!/.*\bruby\b. */
  firstLineMatch?: PlainTextRegexp

  /** a dictionary (i.e. key/value pairs) of rules which can be included from other places in the grammar. The key is the name of the rule and the value is the actual rule. Further explanation (and example) follow with the description of the include rule key. */
  repository?: Record<string, LanguageRule>

  // FIXME: Why this key exists?
  /** Unknown purpose, from https://github.com/microsoft/vscode-markdown-tm-grammar/blob/main/markdown.tmLanguage.base.yaml */
  /** ^~M */
  keyEquivalent?: unknown

  // FIXME: Why this key exists?
  /** Unknown purpose, from https://github.com/microsoft/vscode-markdown-tm-grammar/blob/main/markdown.tmLanguage.base.yaml */
  name?: string

  // FIXME: Why this key exists?
  /** Unknown purpose, from https://github.com/microsoft/vscode-markdown-tm-grammar/blob/main/markdown.tmLanguage.base.yaml */
  uuid?: string
} & FoldingMarkers & Patterns

/** these are regular expressions that lines (in the document) are matched against. If a line matches one of the patterns (but not both), it becomes a folding marker (see the foldings section for more info). */
type FoldingMarkers = {
  foldingStartMarker: PlainTextRegexp
  foldingEndMarker: PlainTextRegexp
}

export type Patterns = {
  strategy?: "matchFirst" | "matchAll"

  /** This is an array with the actual rules used to parse the document. In this example there are two rules (line 6-8 and 9-17). Rules will be explained in the next section. */
  patterns: LanguageRule[]
}

export type LanguageRule = SingleMatchLanguageRule | BeginEndLanguageRule | IncludeRule | Grammar | Patterns

/**
 * this allows you to reference a different language, recursively reference the grammar itself or a rule declared in this file’s repository.
 *
 * To reference another language, use the scope name of that language:
 *
 *  {  begin = '<\?(php|=)?'; end = '\?>'; patterns = (
 *        { include = "source.php"; }
 *     );
 *  }
 *
 * To reference the grammar itself, use $self:
 *
 *  {  begin = '\('; end = '\)'; patterns = (
 *        { include = "$self"; }
 *     );
 *  }
 *
 * To reference a rule from the current grammars repository, prefix the name with a pound sign (#):
 *
 *  patterns = (
 *     {  begin = '"'; end = '"'; patterns = (
 *           { include = "#escaped-char"; },
 *           { include = "#variable"; }
 *        );
 *     },
 *     …
 *  ); // end of patterns
 *  repository = {
 *     escaped-char = { match = '\\.'; };
 *     variable =     { match = '\$[a-zA-Z0-9_]+'; };
 *  };
 *
 * This can also be used to match recursive constructs like balanced characters:
 *
 *  patterns = (
 *     {  name = 'string.unquoted.qq.perl';
 *        begin = 'qq\('; end = '\)'; patterns = (
 *           { include = '#qq_string_content'; },
 *        );
 *     },
 *     …
 *  ); // end of patterns
 *  repository = {
 *     qq_string_content = {
 *        begin = '\('; end = '\)'; patterns = (
 *           { include = '#qq_string_content'; },
 *        );
 *     };
 *  };
 *
 * This will correctly match a string like: qq( this (is (the) entire) string).
 */
export type IncludeRule = {
  include: string
}

/** single regular expression, or two. As with the match key in the first rule above (lines 6-8), everything which matches that regular expression will then get the name specified by that rule. For example the first rule above assigns the name keyword.control.untitled to the following keywords: if, while, for and return. We can then use a scope selector of keyword.control to have our theme style these keywords. */
export type SingleMatchLanguageRule = {
  /** a regular expression which is used to identify the portion of text to which the name should be assigned. Example: '\b(true|false)\b'. */
  match: PlainTextRegexp
} & LanguageRuleBase & SingleMatchCaptures

/** The other type of match is the one used by the second rule (lines 9-17). Here two regular expressions are given using the begin and end keys. The name of the rule will be assigned from where the begin pattern matches to where the end pattern matches (including both matches). If there is no match for the end pattern, the end of the document is used.

In this latter form, the rule can have sub-rules which are matched against the part between the begin and end matches. In our example here we match strings that start and end with a quote character and escape characters are marked up as constant.character.escape.untitled inside the matched strings (line 13-15). */
export type BeginEndLanguageRule = {
  /** these keys allow matches which span several lines and must both be mutually exclusive with the match key. Each is a regular expression pattern. begin is the pattern that starts the block and end is the pattern which ends the block. Captures from the begin pattern can be referenced in the end pattern by using normal regular expression back-references. This is often used with here-docs, for example:

  {   name = 'string.unquoted.here-doc';
      begin = '<<(\w+)';  // match here-doc token
      end = '^\1$';       // match end of here-doc
  }
  */
  begin: PlainTextRegexp
  end: PlainTextRegexp
} & LanguageRuleBase & BeginEndCaptures & Partial<Patterns>

/** A language rule is responsible for matching a portion of the document. Generally a rule will specify a name which gets assigned to the part of the document which is matched by that rule. */
interface LanguageRuleBase {
  /** the name which gets assigned to the portion matched. This is used for styling and scope-specific settings and actions, which means it should generally be derived from one of the standard names (see naming conventions later). */
  scopeName: string
}

/** these keys allow you to assign attributes to the captures of the match, begin, or end patterns. Using the captures key for a begin/end rule is short-hand for giving both beginCaptures and endCaptures with same values.

The value of these keys is a dictionary with the key being the capture number and the value being a dictionary of attributes to assign to the captured text. Currently name is the only attribute supported. Here is an example: */
type BeginEndCaptures = {
  beginCaptures?: Capture
  endCaptures?: Capture

  /** this key is similar to the name key but only assigns the name to the text between what is matched by the begin/end patterns. For example to get the text between #if 0 and #endif marked up as a comment, we would do:

  {  begin = '#if 0(\s.*)?$'; end = '#endif';
      contentName = 'comment.block.preprocessor';
  };
  */
  contentScope?: string
}

type SingleMatchCaptures = {
  captures?: Capture
}

export type NamedCapture = {
  name: string
}

export type Capture = {
  [key: number]: NamedCapture | Patterns
}

type PlainTextRegexp = string

export type TokenizationResult = {
  line: string
  tokens: Token[]
}

export type ParsingResult = {
  line: string
  tokens: Token[]
}

export type Token = {
  startIndex: number
  endIndex: number
  scopes: string[]
}

export type RegExpMatchArrayWithIndices = RegExpMatchArray & { indices: Array<[number, number]> };
