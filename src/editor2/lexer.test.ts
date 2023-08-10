import {Lexer} from "./lexer";
import {Grammar, Token} from "./types";
import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'
// import * as url from 'url';
import {timeExecution} from "./utils/benchmark";
import {DocumentHandler} from "./document";
import {tokens} from "@fluentui/react-components";

declare const __dirname: string
// const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

// ms per line. This is a baseline VSCode 1.8.1.
const expectedPerformancePerLine = 0.08
const filenames: string[] = fs.readdirSync(path.join(__dirname, "./tests"))

describe.each(filenames)("Document", (filename) => {
  const tests = loadTests(filename).filter(el => !el.disabled)

  it.each(tests)("[$#] Tokenizer '$description'", (test) => {
    // given
    const tokenizer = new Lexer({ loadGrammar: grammarLoader });
    const {
      grammar,
      input,
      output: {
        tokenization: output
      }
    } = test
    tokenizer.loadGrammar(grammar)

    // when
    const result = tokenizer.parse({ data: input, fileType: "md" })

    // then
    for (let i = 0; i < Math.max(output.length, result.length); i++) {
      const tokenizationResult = result[i];
      const expectedResult = output[i];
      expect(tokenizationResult?.line).toEqual(expectedResult?.line)
      expect(tokenizationResult?.tokens.length).toEqual(expectedResult?.tokens.length)

      for (let j = 0; j < Math.max(tokenizationResult?.tokens.length ?? 0, expectedResult?.tokens.length ?? 0); j++) {
        const resultToken = tokenizationResult?.tokens[j];
        const outputToken = expectedResult?.tokens[j];
        expect({
          startIndex: resultToken?.startIndex,
          endIndex: resultToken?.endIndex,
          scopes: resultToken?.scopes.sort()
        })
          .toEqual({
            startIndex: outputToken?.startIndex,
            endIndex: outputToken?.endIndex,
            scopes: outputToken?.scopes.sort()
          })
      }
    }
  })

  xit.each(tests)("[$#] Performance of tokens '$description'", (test) => {
    // given
    const tokenizer = new Lexer({ loadGrammar: grammarLoader });
    const { grammar, input} = test
    tokenizer.loadGrammar(grammar)

    // when
    const {summary} = timeExecution(() => tokenizer.parse({
      data: input,
      fileType: "md"
    }), {quantiles: [0.95]})

    // then
    expect(summary.quantiles?.[0.95]).toBeLessThan(expectedPerformancePerLine * summary.repetitionCount)
  }, 2000)

  xit.each(tests)("[$#] Rich text '$description'", (test) => {
    // given
    const { input, output: {richText: output} } = test
    const lexer = new Lexer({ loadGrammar: grammarLoader });
    const documentHandler = new DocumentHandler(lexer);

    // when
    documentHandler.parse({
      data: input,
      fileType: "md"
    })

    // then
    expect(documentHandler.richText).toEqual(output)
  })

  xit.each(tests)("[$#] Plain text '$description'", (test) => {
    // given
    const { input, output: {plainText: output} } = test
    const lexer = new Lexer({ loadGrammar: grammarLoader });
    const documentHandler = new DocumentHandler(lexer);

    // when
    documentHandler.parse({
      data: input,
      fileType: "md"
    })

    // then
    expect(documentHandler.plainText).toEqual(output)
  })
})

interface Test {
  description: string
  disabled?: boolean
  grammar: string
  input: string
  output: {
    tokenization: {line: string, tokens: Token[]}[]
    plainText: string
    richText: string
  }
}

function loadTests(filename: string): Test[] {
  return yaml.load(fs.readFileSync(path.join(__dirname, "./tests", filename), 'utf-8')) as Test[];
}

const grammarLoader = (scopeName: string): Grammar => {
  switch (scopeName) {
    case "markdown.text":
      return yaml.load(fs.readFileSync(path.join(__dirname, "grammars", `${scopeName}.yaml`), 'utf-8')) as Grammar
    default:
      throw new Error("UnsupportedOperationException")
  }
}

