import * as fs from 'fs';
import * as vscode from 'vscode';
import { setStorageData } from './reservedKeywords';

import { readArrayLines } from './utils';
import { writeBlocks } from './writer';
import { types } from 'util';
import { stringify } from 'querystring';


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

      if(typesMap.has(arrResult[i].mainType)) {
        console.log("Map content to be retrieved: ", typesMap.get(arrResult[i].mainType));
        currValue = currValue.concat(typesMap.get(arrResult[i].mainType));
      }

      currValue.push(i);
      typesMap.set(arrResult[i].mainType, currValue);

    }
    console.log(arrResult);

    type OrderingArray = {
      element: any,
      position: number
    };

    let dataList: any[] = [];
    let varList: any[] = [];
    let resList: any[] = [];
    
    console.log(">>>>>>>>>>>> Datas")
    console.log(typesMap.get("data")!.length);
    console.log(typesMap.get("data"));
    if(typesMap.has("data")) {
      typesMap.get("data")!.forEach(i => {
        const item: OrderingArray = {
          element: arrResult[i],
          position: i
        };
        dataList.push(item);
      });

      dataList.sort((d1, d2) => {
        return d1.element.line[2].value.toLowerCase().localeCompare(d2.element.line[2].value.toLowerCase());
      });
    }
    console.log("datalist: ", dataList);

    console.log(">>>>>>>>>>>> Variables");
    console.log(typesMap.get("variable")!.length);
    console.log(typesMap.get("variable"));
    if(typesMap.has("variable")) {
      typesMap.get("variable")!.forEach (i => {
        console.log("variables i= ", i);
        console.log("arrResult: ", arrResult[i]);
        const item: OrderingArray = {
          element: arrResult[i],
          position: i
        };
        varList.push(item);
        console.log(item);
      });

      varList.sort((d1, d2) => {
        return d1.element.line[1].value.toLowerCase().localeCompare(d2.element.line[1].value.toLowerCase());
      });
    }   

    if(typesMap.has("resource")) {
      typesMap.get("resource")!.forEach(i => {
        const item: OrderingArray = {
          element: arrResult[i],
          position: i
        };
        resList.push(item);
      });

      resList.sort((d1, d2) => {
        return d1.element.line[2].value.toLowerCase().localeCompare(d2.element.line[2].value.toLowerCase());
      });
    }
    
    
    

    arrResult.forEach((element) => {
      vscode.window.showInformationMessage('found elements: ' + element.line.join(' '));
    });

    //rewrite file
    const fd = fs.openSync(editor.document.fileName, 'w');
    let filePos = 0;
    console.log('writing blocks');
    writeBlocks(fd, filePos, arrResult);
    fs.closeSync(fd);

    context.subscriptions.push(disposable);
  });
}

export function deactivate() { }
