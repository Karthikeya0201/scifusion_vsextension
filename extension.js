const vscode = require('vscode');
const ChatViewProvider = require('./src/ChatViewProvider');

function activate(context) {
	const provider = new ChatViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('chatView', provider)
	);

	const openCommand = vscode.commands.registerCommand('first-extension.karthi', () => {
		vscode.commands.executeCommand('workbench.view.extension.chatViewContainer');
	});

	context.subscriptions.push(openCommand);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
};
