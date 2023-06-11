const vscode = acquireVsCodeApi();

window.onload = () => {
    console.debug("Loader", "startup")

    vscode.postMessage({ type: 'startup' });

    const previousState = vscode.getState();
    if (previousState) {
        console.debug("Loader", "Restoring previous state")
        vscode.postMessage({ type: "documentLoaded", text: previousState });
    }
};
