import { TESTPRODUCTS, arrayfyProductsData, testNodeProductsArray, toDelimited } from "./testData";
import { test, describe, expect } from 'vitest';

describe('File Processing TSV file Workflow', () => {
    test('Converts TESTPRODUCTS TSV to valid File object and processes correctly', async () => {
        // Build the matrix of strings: header row + data rows
        const contents = toDelimited(TESTPRODUCTS, '\t');
        const expectedData = arrayfyProductsData();
        const { result, expected } = await testNodeProductsArray(expectedData, contents, 'tsv', 'logDataFile')

        // Assert: Verify the processed result matches original TESTPRODUCTS
        for (const item of result.result.data) {
            for (let i = 0; i < item.length; i++) {
                if (typeof item[i] === 'undefined') item[i] = '';
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