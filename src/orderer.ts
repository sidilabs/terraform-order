
import { writeBlocks } from './writer';
import * as fs from 'fs';
import * as tfTypes from './terraformTypesEnum';

export type ElementIndex = {
    element: any,
    position: number
};

export class Orderer {

    protected typesMap: Map<string, Array<number>>;

    constructor(typesMap: Map<string, Array<number>>) {
        this.typesMap = typesMap;
    }

    public segregateOrderedTypes(arrOrigin: any[]): Map<string, Array<ElementIndex>> {
        let orderList = new Map<string, Array<ElementIndex>>();
        Orderer.elementsToFetch().forEach(el => {
            orderList.set(el.element,
                this.orderArrayByKey(el.element, arrOrigin, el.position));
        });

        return orderList;
    }

    public static elementsToFetch(): ElementIndex[] {
        return [
            {
                element: tfTypes.elementTypeEnum.DATA,
                position: 2
            },
            {
                element: tfTypes.elementTypeEnum.VARIABLE,
                position: 1
            },
            {
                element: tfTypes.elementTypeEnum.RESOURCE,
                position: 2
            }
        ];
    }

    protected orderArrayByKey(elementKey: string, arrOrigin: any[], elementSortIndex: number): any[] {
        let resultList: any[] = [];
        if (this.typesMap.has(elementKey)) {
            resultList = this.sortListByTFElement(
                this.iterateElementArray(elementKey, arrOrigin),
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

    protected iterateElementArray(elementKey: string, arrOrigin: any[]): any[] {
        let resultList: any[] = [];
        this.typesMap.get(elementKey)!.forEach(i => {
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
