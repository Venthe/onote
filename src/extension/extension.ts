import * as vscode from 'vscode';
import { VisualEditorProvider } from './providers/visualEditorProvider';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(VisualEditorProvider.register(context));
}
