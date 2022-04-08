// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "terraform-order" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('terraform-order.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Terraform Order!');
	});

	disposable = vscode.commands.registerCommand('terraform-order.order', async () => {
		const inputText = await vscode.window.showInputBox({
			placeHolder: "Enter Full file path for variables files",
			prompt: "Terraform variables file absolute path"
		});

		vscode.window.showInformationMessage("You typed: "+ inputText);
	});

	context.subscriptions.push(disposable);
}

function isEmptyStr(str:string) {
	return (!str?.trim());
}

// this method is called when your extension is deactivated
export function deactivate() {}
