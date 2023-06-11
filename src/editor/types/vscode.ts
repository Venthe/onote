import { VSCodeMessage } from '../../common';

export interface VSCode {
    postMessage(message: VSCodeMessage): void;
    setState(obj: Object): void
}