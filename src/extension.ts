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

  const readBlock = (strArray: string[], initLine: number): any => {
    const allData = [];
    for (let i = initLine; i < strArray.length; i++) {
      let current = strArray[i];
      let blockData = null;
      if (/\{\s*$/.test(current) || /\[\s*$/.test(current)) {
        blockData = readBlock(strArray, i + 1);
        i = blockData.endLine;
      } else if (/^\s*\}/.test(current) || /^\s*\]/.test(current)) {
        return {
          data: [...allData, current],
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

  let disposable = vscode.commands.registerCommand("terraform-order.order", async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      return; // no editor
    }
    let inputText = editor.document;
    const documentText = inputText.getText();

    let fileStr = documentText
      .replace(/\r\n/g, "\n")
      .replace(/\n+\s*\[/g, " [")
      .replace(/(\n\s*"?[^\["]+"?\s*=\s*[^"']*\[)([^\n]+)/g, "$1\n$2")
      .replace(/\]([ ,\t]*)/g, "\n]$1")
      .replace(/\{\s*\}/g, "{\n}") //empty object
      .replace(/(\n\s*"?[^\["]+"?\s*=\s*\{)([^\n]+)\}([ \t,]*\n)$/g, "$1\n$2\n}$3"); //attr pointing to obj

    // { asdasd = "sdasdas" }

    const fileStrArr = fileStr.split("\n").filter((line) => line.trim());
    const arrResult = [];
    const keywords = "variable|terraform|provider|data|resource|output";
    console.log(fileStrArr);
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
