// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { CustomConsole, LogType, LogMessage } from '@jest/console';

function simpleFormatter(type: LogType, message: LogMessage): string {
  const TITLE_INDENT = '    ';
  const CONSOLE_INDENT = TITLE_INDENT + '  ';

  return message
    .split(/\n/)
    .map(line => CONSOLE_INDENT + line)
    .join('\n');
}

global.console = new CustomConsole(process.stdout, process.stderr, simpleFormatter);
