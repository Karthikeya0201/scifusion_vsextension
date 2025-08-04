const vscode = require('vscode');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = 'AIzaSyAf2LbgV3-fkZoQ2_wzHGTAn9LrxBT82vQ';

class ChatViewProvider {
	constructor(extensionUri) {
		this._extensionUri = extensionUri;
	}

	resolveWebviewView(webviewView) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'media')]
		};

		webviewView.webview.html = this._getHtml(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(async (message) => {
			if (message.command === 'userMessage') {
				try {
					const { fullText, codeOnly, languageId } = await this.queryGemini(message.text);

					// ✅ Send reply back to the webview chat UI
					webviewView.webview.postMessage({
						command: 'botReply',
						text: fullText
					});

					// Map some common language IDs to extensions
					const langToExt = {
						javascript: 'js',
						python: 'py',
						java: 'java',
						html: 'html',
						css: 'css',
						typescript: 'ts',
						plaintext: 'txt',
						cpp: 'cpp',
						c: 'c',
						json: 'json',
						rust: 'rs',
						// Add more mappings as needed
					};

					const extension = langToExt[languageId] || 'txt';
					const sanitize = (str) => str.toLowerCase().replace(/[^a-z0-9]/gi, '_').substring(0, 30); // limit length
					const topic = sanitize(message.text);
					const fileName = `${topic}.${extension}`;

					const filePath = path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || __dirname, fileName);

					// Save file to disk
					fs.writeFileSync(filePath, codeOnly);

					// Open saved file in editor
					const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
					await vscode.window.showTextDocument(document);

				} catch (err) {
					console.error(err);
					webviewView.webview.postMessage({
						command: 'botReply',
						text: '❌ Error: Could not reach Gemini.'
					});
				}
			}

		});
	}

	async queryGemini(prompt) {
		const response = await axios.post(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
			{ contents: [{ parts: [{ text: prompt }] }] },
			{ headers: { 'Content-Type': 'application/json' } }
		);

		const fullText = response.data.candidates[0]?.content?.parts[0]?.text || '';
		const match = fullText.match(/```(\w*)\n([\s\S]*?)```/);
		const languageId = match ? match[1].trim() : 'plaintext';
		const codeOnly = match ? match[2].trim() : '// No code block found in Gemini response.';
		return { fullText, codeOnly, languageId };
	}

	_getHtml(webview) {
		const htmlPath = path.join(this._extensionUri.fsPath, 'media', 'webview.html');
		let html = fs.readFileSync(htmlPath, 'utf8');

		// Fix local resource paths for CSS/JS in the HTML
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'script.js'));
		const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css'));

		html = html.replace('{{scriptUri}}', scriptUri.toString());
		html = html.replace('{{styleUri}}', styleUri.toString());

		return html;
	}
}

module.exports = ChatViewProvider;
