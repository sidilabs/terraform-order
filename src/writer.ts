import * as fs from 'fs';


export function writeBlocks(fileDescriptor: any, filePos: number, resources: any) {
  for (let i = 0; i < resources.length; i++) {
    filePos = writeLines(fileDescriptor, filePos, resources[i].line, resources[i].tab);

    if (resources[i].lineBlock) {
      filePos = writeBlocks(fileDescriptor, filePos, resources[i].lineBlock);
    }

    if ((resources[i].mainType && resources[i].mainType !== 'attribution') // Current line is not attribution
      || (resources[i + 1] && resources[i + 1].mainType && resources[i + 1].mainType !== 'attribution')) { // Current line is attribution but next is not
      filePos += fs.writeSync(fileDescriptor, '\n', filePos, 'utf8'); // Add an extra blank line for better visualization
    }
  }
  return filePos;
}

export function writeLines(fileDescriptor: any, filePos: number, line: any, tabNum: number) {
  let tabs = '';

  for (let i = 0; i < tabNum; i++) {
    tabs += '\t';
  }
  filePos += fs.writeSync(fileDescriptor, tabs, filePos, 'utf8');

  line.forEach((word: any) => {
    filePos += fs.writeSync(fileDescriptor, word.separator + word.value, filePos, 'utf8');
  });
  filePos += fs.writeSync(fileDescriptor, '\n', filePos, 'utf8');

  return filePos;
}
