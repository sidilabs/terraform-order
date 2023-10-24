
import { writeBlocks } from './writer';
import * as fs from 'fs';

export type ElementIndex = {
    element: any,
    position: number
};

export class Orderer {

    constructor() { }

    public fillOrderedArray(typesMap: Map<string, Array<number>>, arrOrigin: []): Map<string, Array<ElementIndex>> {
        let orderList = new Map<string, Array<ElementIndex>>();
        Orderer.elementsToFetch().forEach(el => {
            orderList.set(el.element,
                this.orderArrayByKey(typesMap, el.element, arrOrigin, el.position));
        });

        return orderList;
    }

    public static elementsToFetch(): ElementIndex[] {
        return [
            {
                element: "data",
                position: 2
            },
            {
                element: "variables",
                position: 1
            },
            {
                element: "resource",
                position: 2
            }
        ];
    }

    protected orderArrayByKey(typesMap: Map<string, Array<number>>, elementKey: string, arrOrigin: [], elementSortIndex: number): any[] {
        let resultList: any[] = [];
        if (typesMap.has(elementKey)) {
            resultList = this.sortListByTFElement(
                this.iterateElementArray(typesMap, elementKey, arrOrigin),
                elementSortIndex
            );
        }

        return resultList;
    }

    protected sortListByTFElement(unsortedList: any[], index: number): any[] {
        return unsortedList.sort((d1, d2) => {
            return d1.element.line[index].value.toLowerCase().localeCompare(d2.element.line[index].value.toLowerCase());
        });
    }

    protected iterateElementArray(typesMap: Map<string, Array<number>>, elementKey: string, arrOrigin: []): any[] {
        let resultList: any[] = [];
        typesMap.get(elementKey)!.forEach(i => {
            const item: ElementIndex = {
                element: arrOrigin[i],
                position: i
            };
            resultList.push(item);
        });

        return resultList;
    }
}


export class OrderedWriter {
    public static writeListsToFiles(orderResourceTypeList: string[], orderedLists: Map<string, Array<ElementIndex>>, contentArray: any[], filename: string): void {
        let filePos = 0;
        let burnedIndex = new Array<number>();
        const fd = fs.openSync(filename, 'w');
        orderResourceTypeList.forEach(resType => {
            orderedLists.get(resType)!.forEach(el => {
                burnedIndex.push(el.position);
                filePos = writeBlocks(fd, filePos, [contentArray[el.position]]);
            });
        });

        const difference = [
            ...OrderedWriter.getDifference(burnedIndex, [...Array(contentArray.length).keys()]),
            ...OrderedWriter.getDifference([...Array(contentArray.length).keys()], burnedIndex)
        ];

        difference.forEach(index => {
            filePos = writeBlocks(fd, filePos, [contentArray[index]]);
        });

        fs.closeSync(fd);
    }

    public static getDifference(a: number[], b: number[]) {
        return a.filter(element => {
            return !b.includes(element);
        });
    }

}
