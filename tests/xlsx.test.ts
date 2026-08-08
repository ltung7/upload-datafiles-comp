import * as XLSX from 'xlsx';
import { TESTPRODUCTS, arrayfyProductsData, stringifyProductsData, testBrowserProductsArray, testNodeProductsArray } from "./testData";
import { test, describe, expect } from 'vitest';

export function makeXlsxBuffer(data: Record<string, any>[], sheetName = 'Sheet1') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 'buffer' type works in Node; use 'array' if you need a Uint8Array instead
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

describe('XLSX file processing', () => {
    test('Generates a XSLX Buffer and parses it back correctly (Node)', async () => {
        const data = stringifyProductsData();
        const contents = makeXlsxBuffer(data);
        const expectedData = arrayfyProductsData();
        const { result, expected } = await testNodeProductsArray(expectedData, contents, 'csv', 'logDataFile')
        
        for (const item of result.result.data) {
            for (let i = 0; i < 7; i++) {
                if (typeof item[i] === 'undefined' || item[i] === null) item[i] = '';
            }
        }

        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(TESTPRODUCTS.length);
        expectedData.forEach((product, index) => {
            expect(result.result.data[index]).toEqual(product);
        });
    })

    test('Generates a XSLX Buffer and parses it back correctly (browsr)', async () => {
        const data = stringifyProductsData();
        const contents = makeXlsxBuffer(data);
        const expectedData = arrayfyProductsData();
        const { result, expected } = await testBrowserProductsArray(expectedData, contents, 'csv', 'logDataFile')
        
        for (const item of result.result.data) {
            for (let i = 0; i < 7; i++) {
                if (typeof item[i] === 'undefined' || item[i] === null) item[i] = '';
            }
        }

        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(TESTPRODUCTS.length);
        expectedData.forEach((product, index) => {
            expect(result.result.data[index]).toEqual(product);
        });
    }, 10000)
});