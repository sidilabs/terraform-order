// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "terraform-order" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("terraform-order.helloWorld", () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage("Hello World from Terraform Order!");
  });

  const readBlock = (strArray: string[], initLine: number): any => {
    const allData = [];
    for (let i = initLine; i < strArray.length; i++) {
      let current = strArray[i];
      let blockData = null;
      if (current.includes("{")) {
        blockData = readBlock(strArray, i + 1);
        i = blockData.endLine;
      } else if (current.includes("}")) {
        return {
          data: allData,
          endLine: i,
        };
      }
      allData.push({
        statement: current,
        block: blockData?.data,
      });
    }
    return {};
  };

  disposable = vscode.commands.registerCommand("terraform-order.order", async () => {
    const inputText = await vscode.window.showInputBox({
      placeHolder: "Enter Full file path for variables files",
      prompt: "Terraform variables file absolute path",
    });

    if (typeof inputText === undefined) {
      throw new Error("File cant be undefined");
    }

    vscode.window.showInformationMessage("Opening file: " + inputText);

    if (typeof inputText === typeof "") {
      const file = fs.readFileSync(inputText);
      let fileStr = file
        .toString()
        .replace(/\r\n/g, "\n")
        .replace(/\{(.+)/g, "{\n$1");
      const fileStrArr = fileStr.split("\n").filter((line) => line.trim());
      const arrResult = [];
      const keywords = "variable|terraform|provider|data|resource|output";
      for (let i = 0; i < fileStrArr.length; i++) {
        const current = fileStrArr[i];
        if (new RegExp(`^\s*(${keywords}).*`, "g").test(current)) {
          const block = readBlock(fileStrArr, i + 1);
          i = block.endLine;
          arrResult.push({ statement: current, block: block.data });
        } else if (/^\s*\w+\s*=\s*\S+$/.test(current)) {
          arrResult.push({ statement: current, block: [] });
        }
      }
      console.log(arrResult);
			arrResult.forEach((element) => {
          vscode.window.showInformationMessage("found elements: " + element.statement);
        });
  });

  context.subscriptions.push(disposable);
}

function isEmptyStr(str: string) {
  return !str?.trim();
}

function getvarName() {}

// this method is called when your extension is deactivated
export function deactivate() {}
