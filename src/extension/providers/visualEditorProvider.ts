import { getNonce } from '../util';
import { VSCodeMessage } from '../../common';
import {
	CancellationToken,
	CustomTextEditorProvider,
	Disposable,
	ExtensionContext,
	ExtensionMode,
	TextDocument,
	Uri,
	Webview,
	WebviewPanel,
	WorkspaceEdit,
	window as windowHandler,
	workspace as workspaceHandler,
	Range as VSCodeRange
} from 'vscode';

namespace Communication {
	export const updateWebviewCommand = (doc: TextDocument) => ({
		type: 'documentLoaded',
		text: doc.getText(),
	})
}

export class VisualEditorProvider implements CustomTextEditorProvider {

	public static register(context: ExtensionContext): Disposable {
		const provider = new VisualEditorProvider(context);
		const providerRegistration = windowHandler.registerCustomEditorProvider(VisualEditorProvider.viewType, provider);
		return providerRegistration;
	}

	private static readonly viewType = 'venthe.onote';

	constructor(private readonly context: ExtensionContext) {
		console.debug("VisualEditorProvider", "constructor")
	}

	public async resolveCustomTextEditor(
		document: TextDocument,
		webviewPanel: WebviewPanel,
		_token: CancellationToken
	): Promise<void> {
		console.debug("VisualEditorProvider", "resolveCustomTextEditor")

		webviewPanel.webview.options = {
			enableScripts: true,
			localResourceRoots: [Uri.file(this.context.extensionPath)]
		};
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

		this.registerListeners(document, webviewPanel);

		// webviewPanel.webview.postMessage(Communication.updateWebviewCommand(document))
	}

	private registerListeners(document: TextDocument, webviewPanel: WebviewPanel) {
		const disposables: Disposable[] = [];

		workspaceHandler.onDidChangeTextDocument(e => {
			console.debug("VisualEditorProvider", "onDidChangeTextDocument");
			if (e.document.uri.toString() !== document.uri.toString())
				return;

			// console.log("!!!!1", document.getText())
			webviewPanel.webview.postMessage(Communication.updateWebviewCommand(document));
		}, disposables);

		webviewPanel.webview.onDidReceiveMessage((e: VSCodeMessage) => {
			// console.debug("VisualEditorProvider", "onDidReceiveMessage");
			console.log("VisualEditorProvider", "onDidReceiveMessage", e.type);
			switch (e.type) {
				case 'pageChangedCommand':
					this.updateDocument(document, (e as any).page);
					// console.log("!!!!2", document.getText(), (e as any).page)
					break;
				case 'refreshEditor':
					webviewPanel.webview.postMessage(Communication.updateWebviewCommand(document));
					break;
				default:
					console.debug("VisualEditorProvider", "Received an unhandled message");
					break;
			}
		}, disposables);

		// webviewPanel.onDidChangeViewState(e => {
		// 	console.debug("VisualEditorProvider", "onDidChangeViewState", e)
		// })

		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			console.debug("VisualEditorProvider", "onDidDispose");
			disposables.forEach(d => d.dispose());
		});
	}

	private getHtmlForWebview(webview: Webview): string {
		console.debug("VisualEditorProvider", "Rendering webview HTML")
		const localPort = "3000"
		const localServerUrl = `http://localhost:${localPort}`;
		const nonce = getNonce();

		const isProduction = this.context.extensionMode === ExtensionMode.Production;
		const isDebug = true;

		const url = (filename: string) => isProduction ? webview.asWebviewUri(Uri.joinPath(this.context.extensionUri, "dist", filename)) : `${localServerUrl}/${filename}`;

		const scriptUri = url("main.wv.js")
		const loaderScriptUri = webview.asWebviewUri(Uri.joinPath(this.context.extensionUri, "dist", "loader.js"))

		const contentSecurityPolicy = [...(isProduction ?
			[
				`default-src 'none'`,
				`img-src '${webview.cspSource}'`,
				`style-src 'unsafe-inline'`,
				`script-src 'nonce-${nonce}'`
			]
			: [])].join(";")

		const nonceAttribute = isProduction ? 'nonce="${nonce}"' : ""

		return /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy}">
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>WebView editor</title>
			</head>
			<body>
				<div id="root" data-is-production="${isProduction}" data-is-debug="${isDebug}"></div>
				<script ${nonceAttribute} src="${loaderScriptUri}"></script>
                <script ${nonceAttribute} src="${scriptUri}"></script>
			</body>
			</html>`;
	}

	private updateDocument(document: TextDocument, text: string) {
		const edit = new WorkspaceEdit();

		// Just replace the entire document every time for this example extension.
		// A more complete extension should compute minimal edits instead.
		edit.replace(
			document.uri,
			new VSCodeRange(0, 0, document.lineCount, 0),
			text
		);

		return workspaceHandler.applyEdit(edit);
	}
}
