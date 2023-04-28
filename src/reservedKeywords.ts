import * as vscode from 'vscode';
import * as fs from 'fs';

type Data = {
    keyword: string;
    required: boolean;
};
export function setStorageData(context: vscode.ExtensionContext): [Map<string, { keyword: string; required: boolean }[]>, string[]] {
    let mainKeywordsMapping = new Map<string, Data[]>;
    let reservedMainKeywords: string[] = [];

    let outDirSplit = __dirname.split('/');
    let baseDir = outDirSplit.slice(0, outDirSplit.length - 1).join('/');
    let dataDir = baseDir + '/data/';

    if (!fs.existsSync(dataDir)) {
        console.log('Could not find data dir ' + dataDir);
    }

    let dataFiles = fs.readdirSync(dataDir);
    for (var i = 0; i < dataFiles.length; i++) {
        let fileName = dataFiles[i].split('.')[0];
        if (fileName !== 'keyword') {
            let data: Data[] = JSON.parse(fs.readFileSync(dataDir + dataFiles[i], 'utf-8'));

            mainKeywordsMapping.set(fileName, data);
        } else {
            reservedMainKeywords = JSON.parse(fs.readFileSync(dataDir + dataFiles[i], 'utf-8'));
        }
    }

    context.globalState.update("keywordsMapping", mainKeywordsMapping);
    context.globalState.update("reservedKeywords", reservedMainKeywords);
    return [mainKeywordsMapping, reservedMainKeywords];
}
