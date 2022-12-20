export function oneLineStringComponentsToArray(line: string) {
  const delimiters = ['[', ']', '{', '}', '(', ')', ',', '.', '=', '>', '<', '*', '/', '%', '&', '|', '!', ':', '?'];
  const doubleDelimiters = ['||', '&&', '==', '!=', '<=', '>=', '=>', '${', '%{', '..'];
  // the .. is the initial of the triple delimiter ...

  const charsArray = line.trim().split('');
  let inString = false;
  let ignoreNextChar = false;
  const arrayComponents = [] as { separator: string; value: string }[];
  let currentComponentCharArray: string[] = [];
  function addCurrentAndPrepareNext() {
    if (currentComponentCharArray.length) {
      arrayComponents.push({ separator: lastSeparator, value: currentComponentCharArray.join('') });
      currentComponentCharArray = [];
    }
  }
  let lastSeparator = '';
  for (let i = 0; i < charsArray.length; i++) {
    const lastChar = i === 0 ? '' : charsArray[i - 1];
    const currentChar = charsArray[i];
    const nextChar = charsArray[i + 1] || '';

    if (!inString) {
      if (currentChar === ' ' || currentChar === '\t') {
        addCurrentAndPrepareNext();
        lastSeparator = currentChar;
        continue;
      } else if (currentChar === '"') {
        if (lastChar.trim().replace('\t', '')) {
          lastSeparator = '';
        }
        addCurrentAndPrepareNext();
        currentComponentCharArray.push(currentChar);
        inString = true;
        continue;
      } else if (doubleDelimiters.some((indentifier) => indentifier === `${currentChar}${nextChar}`)) {
        if (lastChar.trim().replace('\t', '')) {
          lastSeparator = '';
        }
        addCurrentAndPrepareNext();
        let thirdChar = '';
        if (`${currentChar}${nextChar}` == '..') {
          thirdChar = '.';
          i++;
        }
        arrayComponents.push({ separator: lastSeparator, value: currentChar + nextChar + thirdChar });
        i++;
        continue;
      } else if (delimiters.some((indentifier) => indentifier === currentChar)) {
        if (lastChar.trim().replace('\t', '')) {
          lastSeparator = '';
        }
        addCurrentAndPrepareNext();
        arrayComponents.push({ separator: lastSeparator, value: currentChar });
        continue;
      }
      currentComponentCharArray.push(currentChar);
    } else {
      if (!ignoreNextChar) {
        if (currentChar === '\\') {
          ignoreNextChar = true;
        } else if (currentChar === '"') {
          currentComponentCharArray.push(currentChar);
          addCurrentAndPrepareNext();
          inString = false;
          continue;
        }
      } else {
        ignoreNextChar = false;
      }
      currentComponentCharArray.push(currentChar);
    }
  }
  if (currentComponentCharArray.length) {
    arrayComponents.push({ separator: lastSeparator, value: currentComponentCharArray.join('') });
  }

  return arrayComponents;
}

type BlockState = { stackOpeners: string[]; index: number };
function componentsArrayToBlocksArray(
  arrComponents: { separator: string; value: string }[],
  state: BlockState = { stackOpeners: [], index: 0 },
  stack = 0
): any {
  const componentArrayState = { stackOpeners: state.stackOpeners, index: state.index };

  const blockOpeners = ['[', '{', '('];
  const blockClosers = [']', '}', ')'];

  function componentsArrayToBlocksArrayParser(stack = 0) {
    let arrContent: any[] = [];
    for (let i = componentArrayState.index; i < arrComponents.length; i++) {
      const currentComponent = arrComponents[i];
      if (blockOpeners.some((opener) => opener === currentComponent.value)) {
        arrContent.push(currentComponent);
        componentArrayState.stackOpeners.push(currentComponent.value);

        componentArrayState.index = i + 1;
        if (componentArrayState.index < arrComponents.length) {
          const { content, closer } = componentsArrayToBlocksArrayParser(stack + 1);
          i = componentArrayState.index;
          if (content?.length) {
            arrContent.push(...content);
          }
          if (closer) {
            arrContent.push(closer);
          }
        }
      } else if (blockClosers.some((closer) => closer === currentComponent.value)) {
        componentArrayState.stackOpeners?.pop();

        if (stack > 0 && i + 1 == arrComponents.length) {
          componentArrayState.index = i;
          return { content: arrContent, state: componentArrayState, closer: currentComponent };
        } else {
          arrContent.push(currentComponent);
        }
      } else {
        arrContent.push(currentComponent);
      }
      componentArrayState.index = i;
    }
    componentArrayState.index = arrComponents.length;
    return { content: arrContent };
  }
  const result = {
    ...componentsArrayToBlocksArrayParser(stack),
    state: { stackOpeners: [...componentArrayState.stackOpeners] },
  };

  return result;
}

export function readArrayLines(arrLines: string[], ref = { index: 0, stack: 0 }) {
  let readArrayStack = [] as string[];

  let stackNum = 0;
  function readArrayLinesParser(tab = 0) {
    const arrayResult: any[] = [];

    for (let i = ref.index; i < arrLines.length; i++) {
      const originalSizeStack = readArrayStack.length;

      const line = arrLines[i];

      const result = componentsArrayToBlocksArray(
        oneLineStringComponentsToArray(line),
        {
          stackOpeners: readArrayStack,
          index: 0,
        },
        ref.stack
      );

      const currentSizeStack = readArrayStack.length;

      const objResult: any = {};
      objResult.line = result.content;
      arrayResult.push(objResult);
      ref.index = i;
      objResult.tab = tab;

      if (currentSizeStack > originalSizeStack) {
        ref.index += 1;
        ref.stack += 1;
        objResult.lineBlock = readArrayLinesParser(tab + 1);
        i = ref.index;
      } else if (currentSizeStack < originalSizeStack) {
        ref.stack -= 1;
        let line = result.content || [];
        if (result.closer) {
          line.push(result.closer);
        }
        objResult.line = line;

        return arrayResult;
      }
    }
    return arrayResult;
  }
  return readArrayLinesParser();
}
