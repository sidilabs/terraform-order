import * as vscode from 'vscode';
import { setStorageData } from './reservedKeywords';

import { readArrayLines } from './utils';
import * as orderer from './orderer';
import { elementTypeEnum as typesEnum } from './terraformTypesEnum';


export function activate(context: vscode.ExtensionContext) {
  const versionKey = '1.0.0';
  context.globalState.setKeysForSync([versionKey]);
  context.globalState.update('keywordsMapping', undefined); // TODO: Remove this before submitting PR
  if (context.globalState.get('keywordsMapping') === undefined || context.globalState.get('reservedKeywords') === undefined) {
    setStorageData(context);
  }

  let disposable = vscode.commands.registerCommand('terraform-order.order', async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      return; // no editor
    }

    const currentVersion = context.extension.packageJSON.version;
    const lastVersionShown = context.globalState.get(versionKey);
    let mainKeywordsMapping: Map<string, { keyword: string; required: boolean }[]>;
    let reservedMainKeywords: string[];
    if (currentVersion !== lastVersionShown) {
      context.globalState.update(versionKey, currentVersion);
      [mainKeywordsMapping, reservedMainKeywords] = setStorageData(context);
    } else {
      mainKeywordsMapping = context.globalState.get('keywordsMapping')!;
      reservedMainKeywords = context.globalState.get('reservedKeywords')!;
    }

    let inputText = editor.document;
    const documentText = inputText.getText();

    let fileStr = documentText
      //replace new line windows style with unix style
      .replace(/\r\n/g, '\n');

    const fileStrArr = fileStr.split('\n').filter((line) => line.trim());
    let arrResult = readArrayLines(fileStrArr);
    let typesMap = new Map<string, Array<number>>();
    for (let i = 0; i < arrResult.length; i++) {
      if (reservedMainKeywords.includes(arrResult[i].line[0].value)) {
        arrResult[i].mainType = arrResult[i].line[0].value;
      } else {
        arrResult[i].mainType = "attribution";
      }

      let currValue: Array<any> = [];

      if (typesMap.has(arrResult[i].mainType)) {
        console.log("Map content to be retrieved: ", typesMap.get(arrResult[i].mainType));
        currValue = currValue.concat(typesMap.get(arrResult[i].mainType));
      }

      currValue.push(i);
      typesMap.set(arrResult[i].mainType, currValue);

    }
    console.log(arrResult);

    let ord = new orderer.Orderer(typesMap);
    let orderedTypeLists = ord.segregateOrderedTypes(arrResult);
    orderer.OrderedWriter.writeListsToFiles(
      [typesEnum.DATA, typesEnum.VARIABLE, typesEnum.RESOURCE],
      orderedTypeLists,
      arrResult,
      editor.document.fileName
    );

    context.subscriptions.push(disposable);
  });
}

export function deactivate() { }
