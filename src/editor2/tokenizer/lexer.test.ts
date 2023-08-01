// @ts-nocheck

import { Lexer } from "./lexer";
import { Grammar } from "./types";
import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'

const filenames = fs.readdirSync(path.join(__dirname, "./tests"))

describe.each(filenames)("Tokenizer", (filename) => {

  const tests = loadTests(filename)

  it.each(tests)("[$#] Tokenize '$description'", (test) => {
    // given
    let tokenizer = new Lexer({ loadGrammar: grammarLoader });
    const { grammar, input, tokenizedOutput: output } = test
    tokenizer.loadGrammar(grammar)

    // when
    const { result, timing } = timeExecution(() => {
      return tokenizer.parse({ data: input, fileType: "md" })
    })

    // then
    for (let i = 0; i < Math.max(output.length, result.length); i++) {
      expect(result[i]?.line).toEqual(output[i]?.line)
      for (let j = 0; j < Math.max(result[i]?.tokens.length ?? 0, output[i]?.tokens.length ?? 0); j++) {
        expect(result[i]?.tokens[j]?.startIndex).toEqual(output[i]?.tokens[j]?.startIndex)
        expect(result[i]?.tokens[j]?.endIndex).toEqual(output[i]?.tokens[j]?.endIndex)
        expect(result[i]?.tokens[j]?.scopes.sort()).toEqual(output[i]?.tokens[j]?.scopes.sort())
      }
    }

    // Performance tests
    expect(timing.target).toBeLessThan(expectedPerformancePerLine * result.length)
  }, 2000)

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

const timeExecution = <T>(fn: (executionId: number) => T, times: number = 100): { result: T, timing: { max: number, min: number, average: number } } => {
  const timings: { timing: number, result: T }[] = []
  for (let i = 0; i < times; i++) {
    var startTime = performance.now()
    const result = fn(i)
    var endTime = performance.now()
    timings.push({ timing: endTime - startTime, result })
  }

  const justValues = timings.map(t => t.timing);
  const sum = justValues.reduce((acc, val) => acc + val, 0);
  return {
    result: timings[0].result,
    timing: {
      max: Math.max(...justValues),
      min: Math.min(...justValues),
      sum: sum,
      median: quantile(justValues, .5),
      target: quantile(justValues, .95),
      performedTests: justValues.length,
      avg: sum / justValues.length
    }
  }
}

// sort array ascending
const asc = arr => arr.sort((a, b) => a - b);
const sum = arr => arr.reduce((a, b) => a + b, 0);
const mean = arr => sum(arr) / arr.length;

// sample standard deviation
const std = (arr) => {
  const mu = mean(arr);
  const diffArr = arr.map(a => (a - mu) ** 2);
  return Math.sqrt(sum(diffArr) / (arr.length - 1));
};

const quantile = (arr, q) => {
  const sorted = asc(arr);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};

const expectedPerformancePerLine = 0.08 // ms per line
