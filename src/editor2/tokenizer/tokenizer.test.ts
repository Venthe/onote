// @ts-nocheck

import { buildGrammar } from "./_archive/markdownGrammar";
import { Tokenizer } from "./tokenizer";
import { Grammar } from "./types";
import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'

const filenames = fs.readdirSync(path.join(__dirname, "./tests"))

describe.each(filenames)("Tokenizer", (filename) => {
  let tokenizer: Tokenizer;

  beforeEach(() => {
    tokenizer = new Tokenizer({ loadGrammar: grammarLoader });
  })

  const tests = loadTests(filename)

  it.each(tests)("[$#] Tokenize '$description'", (test) => {
    if (test.description !== "Header 1") return

    // given
    const { grammar, input, tokenizedOutput: output } = test
    tokenizer.loadGrammar(grammar)

    // when
    const result = tokenize(input, tokenizer)

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

const tokenize = (document: string, tokenizer: Tokenizer) => {
  const lines = document.split(/\r?\n/)
  const { result: result_ } = lines.reduce((accumulator, line) => {
    const { ruleStack, ...result } = tokenizer.tokenizeLine(line, accumulator.stack)
    accumulator.stack = ruleStack
    accumulator.result.push(result)
    return accumulator
  }, { stack: undefined, result: [] })
  return result_
}

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
