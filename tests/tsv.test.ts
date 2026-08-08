import { TESTPRODUCTS, arrayfyProductsData, testNodeProductsArray, testBrowserProductsArray, toDelimited } from "./testData";
import { test, describe, expect } from 'vitest';

describe('TSV file processing', () => {
    test('Generates a TSV string and parses it back correctly (Node)', async () => {
        const contents = toDelimited(TESTPRODUCTS, '\t');
        const expectedData = arrayfyProductsData();
        const { result, expected } = await testNodeProductsArray(expectedData, contents, 'tsv', 'logDataFile')

        for (const item of result.result.data) {
            for (let i = 0; i < item.length; i++) {
                if (typeof item[i] === 'undefined') item[i] = '';
            }
        }

        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(TESTPRODUCTS.length);
        expectedData.forEach((product, index) => {
            expect(result.result.data[index]).toEqual(product);
        });
    })

    test('Generates a TSV string and parses it back correctly (browser)', async () => {
        const contents = toDelimited(TESTPRODUCTS, '\t');
        const expectedData = arrayfyProductsData();
        const { result, expected } = await testBrowserProductsArray(expectedData, contents, 'tsv', 'logDataFile')

        for (const item of result.result.data) {
            for (let i = 0; i < item.length; i++) {
                if (typeof item[i] === 'undefined') item[i] = '';
            }
        }

        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(TESTPRODUCTS.length);
        expectedData.forEach((product, index) => {
            expect(result.result.data[index]).toEqual(product);
        });
    }, 10000)
});