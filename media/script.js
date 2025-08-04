const vscode = acquireVsCodeApi();
const chat = document.getElementById('chat');

function appendMessage(sender, text) {
  const div = document.createElement('div');
  div.className = 'message ' + sender;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function send() {
  const input = document.getElementById('msg');
  const text = input.value.trim();
  if (!text) return;
  appendMessage('user', text);
  vscode.postMessage({ command: 'userMessage', text });
  input.value = '';
}

window.addEventListener('message', event => {
  const message = event.data;
  if (message.command === 'botReply') {
    appendMessage('bot', message.text);
  }
});
