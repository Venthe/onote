import * as React from 'react';
import { VSCode } from './types/vscode'
import { VSCodeMessage } from '../common';
import { Dispatch, SetStateAction } from 'react';
import { Page } from './page/page';
import * as yaml from 'js-yaml'

declare const vscode: VSCode;

const listenToMessages = (dispatch: Dispatch<SetStateAction<string | undefined>>): React.EffectCallback => () => {
    const messageHandler = (event: MessageEvent<any>): void => {
        const message = event.data;
        console.log("App", "messageListener", message.type)
        switch (message.type) {
            case 'documentLoaded':
                console.debug("App", "updated text received")

                dispatch(message.text);
                break;
            default:
                // console.debug("App", "Received unhandled message", message)
                break;
        }
    };

    window.addEventListener('message', messageHandler);

    return () => window.removeEventListener('message', messageHandler);
}

const notifyPageChanged = (page: string): void => {
    console.debug("App", "Received request to inform extension about updated change")
    vscode.setState(page)
    vscode.postMessage({ type: 'pageChangedCommand', page } as VSCodeMessage<any>);
};

export const VSCodeApp = (props: { isProduction: boolean, isDebug: boolean }) => {
    const [text, setText] = React.useState<string>();

    React.useEffect(listenToMessages(setText), undefined);
    React.useEffect(() => {
        vscode.postMessage({ type: "refreshEditor" })
    }, undefined)

    return (
        <Page {...props}
            text={text}
            onPageChange={notifyPageChanged} />
    );
};
