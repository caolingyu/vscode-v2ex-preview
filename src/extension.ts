import * as vscode from 'vscode';
import { FeedDocumentContentProvider } from './feedDocumentContentProvider';


export function activate(context: vscode.ExtensionContext) {

  const v2ex = new FeedDocumentContentProvider();
//   v2ex.register(context, "v2ex");

  context.subscriptions.push(
    vscode.commands.registerCommand('v2ex.start', () => {
      // Create and show panel
      const panel = vscode.window.createWebviewPanel(
        'v2ex',
        'v2ex preview',
        vscode.ViewColumn.One,
        {}
      );

      // And set its HTML content
	//   panel.webview.html = getWebviewContent();
	 

	let iteration = 0;
	const updateWebview = () => {
		const htmlContent = v2ex.provideTextDocumentContent(vscode.Uri.parse("v2ex://"));
		console.log(htmlContent);
		htmlContent.then(result => {
			console.log(result);
			panel.webview.html = result;
		})
		if (v2ex.service.feeds.length != 0) {
			console.log("clear interval")
			clearInterval(intervalId);
		}

	};
	updateWebview();
	let intervalId = setInterval(updateWebview, 1000);

    })
  );
}

function getWebviewContent() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>v2ex preview</title>
</head>
<body>
    <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
</body>
</html>`;
}

function getBaseContent() {
	return `<button onclick="move()">点我</button> `
}