const WHITESPACE_AWARE_REGEXP = /^(?<whitespace_1>\s*)(?<text>.*\S)(?<whitespace_2>\s*)$/;

export const ignoringWhitespaceSelectionHelper = (text: string | undefined, mod: (text: string) => string) => {
  const {
    whitespace_1: prefixWhitespace,
    whitespace_2: suffixWhitespace,
    text: text_
  } = (WHITESPACE_AWARE_REGEXP).exec(text ?? "")?.groups ?? {}
  return (prefixWhitespace ?? "") + mod(text_ ?? "") + (suffixWhitespace ?? "")
}
