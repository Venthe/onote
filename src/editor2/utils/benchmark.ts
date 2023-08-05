import {sumNumbers} from "./array";
import * as Statistics from "./statistics"
import {mean} from "./statistics";

type Quantiles = {
  [quantile: number]: number
};

type Result<T> = {
  time: number,
  result: T
};

export type TimeExecutionResult<T> = {
  results: Result<T>[],
  summary: {
    max: number,
    min: number,
    average: number,
    totalTime: number,
    repetitionCount: number,
    quantiles?: Quantiles
  }
};

export type TimeExecutionOptions = {
  repetitionCount?: number,
  quantiles?: number[]
}

export type FunctionCallback<T> = (executionId: number) => T;

export const timeExecution = <T>(functionCallback: FunctionCallback<T>, {repetitionCount = 100, quantiles = []}: TimeExecutionOptions = {}): TimeExecutionResult<T> => {
  const results: Result<T>[] = []
  for (let i = 0; i < repetitionCount; i++) {
    const startTime = performance.now()
    const result = functionCallback(i)
    const endTime = performance.now()
    results.push({
      time: endTime - startTime,
      result
    })
  }

  const timings = results.map(t => t.time);

  const calculatedQuantiles = quantiles?.reduce((accumulator, quantile) => {
    accumulator[quantile] = Statistics.quantile(timings, quantile)
    return accumulator
  }, {} as Quantiles)
  const max = Math.max(...timings);
  const min = Math.min(...timings);
  const totalTime = timings.reduce(...sumNumbers);
  const average = mean(timings);

  return {
    results: results,
    summary: {
      max: max,
      min: min,
      totalTime: totalTime,
      repetitionCount: repetitionCount,
      average: average,
      quantiles: calculatedQuantiles
    }
  }
}
