// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as fs from 'fs';
import * as vscode from 'vscode';

import { readArrayLines } from './utils';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (// console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log('Congratulations, your extension "terraform-order" is now active!');

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

  let disposable = vscode.commands.registerCommand('terraform-order.order', async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      return; // no editor
    }
    let inputText = editor.document;
    const documentText = inputText.getText();

    let fileStr = documentText
      //replace new line widows style with unix style
      .replace(/\r\n/g, '\n');

    const fileStrArr = fileStr.split('\n').filter((line) => line.trim());
    console.log(readArrayLines(fileStrArr));

    // const arrResult = [];
    // const keywords = 'variable|terraform|provider|data|resource|output|[^=]+=[ \t]*\\{';

    // const regexIdentifier = '[a-zA-Z](-?[a-zA-Z0-9])*';
    // const regexStringLit = '"([^"]|\\")+"';

    // const regexBlock = new RegExp(`[ \t]*${regexIdentifier}[ \t"-\w]*\{[ \t]*\n`);

    // const regexOneLineBlock = new RegExp(`[ \t]*${regexIdentifier}[ \t]*\{[ \t]*${regexIdentifier}`);

    // let openedBlockCounter = 0;

    // // console.log(fileStrArr);
    // for (let i = 0; i < fileStrArr.length; i++) {
    //   const current = fileStrArr[i];
    //   // console.log('i: ' + i + ' => ' + current);
    //   if (openedBlockCounter == 0 && regexBlock.test(current)) {
    //     openedBlockCounter++;
    //     const block = readBlock(fileStrArr, i + 1);
    //     i = block.endLine;
    //     arrResult.push({ statement: current, block: block.data });
    //   } else if (/^\s*\w+\s*=\s*\S+$/.test(current)) {
    //     arrResult.push({ statement: current, block: [] });
    //   }
    // }
    // arrResult.forEach((element) => {
    //   vscode.window.showInformationMessage('found elements: ' + element.statement);
    // });

    // //rewrite file
    // const fd = fs.openSync(editor.document.fileName, 'w');
    // let filePos = 0;
    // writeBlocks(fd, filePos, arrResult);
    // fs.closeSync(fd);

    context.subscriptions.push(disposable);
  });
}

function writeBlocks(fileDescriptor: any, filePos: number, blockArray: any) {
  if (blockArray === undefined) {
    return 0;
  }

  if (blockArray.length === 1) {
    filePos += fs.writeSync(fileDescriptor, blockArray[0].toString() + '\n', filePos, 'utf8');
    return filePos;
  }

  blockArray.forEach((element: any) => {
    if (typeof element === 'string') {
      filePos += fs.writeSync(fileDescriptor, element + '\n', filePos, 'utf8');
    } else {
      filePos += fs.writeSync(fileDescriptor, element.statement.toString() + '\n', filePos, 'utf8');
      if (element.block !== undefined) {
        filePos = writeBlocks(fileDescriptor, filePos, element.block);
      }
    }
  });
  return filePos;
}

function isEmptyStr(str: string) {
  return !str?.trim();
}

function getvarName() {}

// this method is called when your extension is deactivated
export function deactivate() {}
