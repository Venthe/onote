// sort array ascending
import {sumNumbers} from "./array";

const asc = (arr: number[]) => arr.sort((a, b) => a - b);
export const mean = (arr: number[]) => arr.reduce(...sumNumbers) / arr.length;

// sample standard deviation
export const std = (arr: number[]) => {
  const mu = mean(arr);
  const diffArr = arr.map(a => (a - mu) ** 2);
  return Math.sqrt(diffArr.reduce(...sumNumbers) / (arr.length - 1));
};

export const quantile = (arr: number[], q: number) => {
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
