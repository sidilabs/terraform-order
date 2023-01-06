import * as fs from 'fs';


export function writeBlocks(fileDescriptor: any, filePos: number, resources: any) {
    resources.forEach((resource: any) => {
      filePos=writeLines(fileDescriptor, filePos, resource.line, resource.tab)
  
      if(resource.lineBlock !== undefined){
        filePos= writeBlocks(fileDescriptor, filePos, resource.lineBlock)
      }
    })
    return filePos;
}

export function writeLines(fileDescriptor: any, filePos: number, line: any, tabNum: number){
    let tabs = '';

    for (let i = 0; i < tabNum; i++) {
      tabs+='\t';
    }
    filePos+=fs.writeSync(fileDescriptor, tabs, filePos,'utf8')

    line.forEach((word: any) => {
      filePos+=fs.writeSync(fileDescriptor, word.separator+word.value, filePos,'utf8')
    });
    filePos+=fs.writeSync(fileDescriptor, '\n', filePos, 'utf8');
    
    return filePos;
}