import * as XLSX from 'xlsx';
import { TESTPRODUCTS, arrayfyProductsData, stringifyProductsData, testNodeProductsArray } from "./testData";
import { test, describe, expect } from 'vitest';

export function makeXlsxBuffer(data: Record<string, any>[], sheetName = 'Sheet1') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 'buffer' type works in Node; use 'array' if you need a Uint8Array instead
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

describe('File Processing CSV file Workflow', () => {
    test('Converts TESTPRODUCTS CSV to valid File object and processes correctly', async () => {
        // Build the matrix of strings: header row + data rows
        const data = stringifyProductsData();
        const contents = makeXlsxBuffer(data);
        const expectedData = arrayfyProductsData();
        const { result, expected } = await testNodeProductsArray(expectedData, contents, 'csv', 'logDataFile')
        
        // Assert: Verify the processed result matches original TESTPRODUCTS
        for (const item of result.result.data) {
            for (let i = 0; i < 7; i++) {
                if (typeof item[i] === 'undefined' || item[i] === null) item[i] = '';
            }
        }

        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(TESTPRODUCTS.length);

        // Verify basic data integrity
        expectedData.forEach((product, index) => {
            expect(result.result.data[index]).toEqual(product);
        });
    })
});