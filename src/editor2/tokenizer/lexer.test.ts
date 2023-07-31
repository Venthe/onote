// @ts-nocheck

import { Lexer } from "./lexer";
import { Grammar } from "./types";
import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'

const filenames = fs.readdirSync(path.join(__dirname, "./tests"))

describe.each(filenames)("Tokenizer", (filename) => {
  let tokenizer: Lexer;

  beforeEach(() => {
    tokenizer = new Lexer({ loadGrammar: grammarLoader });
  })

  const tests = loadTests(filename)

  it.each(tests)("[$#] Tokenize '$description'", (test) => {
    if (test.description !== "Header 1") return

    // given
    const { grammar, input, tokenizedOutput: output } = test
    tokenizer.loadGrammar(grammar)

    // when
    const result = tokenizer.parse({ data: input, fileType: "md" })

    // then
    expect(result).toEqual(output)
  })

  xit.each(tests)("[$#] Colorize '$description'", (test) => {
    // given
    const { grammar, input, highlightedOutput: output } = test
    tokenizer.loadGrammar(grammar)

    // when
    throw new Error("Unsupported operation exception")
  })
})

function loadTests(filename: any) {
  return yaml.load(fs.readFileSync(path.join(__dirname, "./tests", filename), 'utf-8'));
}

const grammarLoader = (scopeName: string): Grammar => {
  switch (scopeName) {
    case "markdown.text":
      return yaml.load(fs.readFileSync(path.join(__dirname, "grammars", `${scopeName}.yaml`), 'utf-8'))
    default:
      throw new Error("UnsupportedOperationException")
  }
}
