import { markdownTable } from 'markdown-table';
import { TESTPRODUCTS, arrayfyProductsData, stringifyProductsData, testNodeProductsArray, testBrowserProductsArray } from "./testData";
import { test, describe, expect } from 'vitest';

describe('Markdown file processing', () => {
    test('Generates a Markdown string and parses it back correctly (Node)', async () => {
        const headers = ['id', 'price', 'inStock', 'tags', 'rating', 'discount', 'comments'];
        const rows = arrayfyProductsData()
        const contents = markdownTable([headers, ...rows])
        const expectedData = stringifyProductsData();
        const { result, expected } = await testNodeProductsArray(expectedData, contents, 'md')
        
        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(TESTPRODUCTS.length);
        expectedData.forEach((product, index) => {
            expect(result.result.data[index]).toEqual(product);
        });
    })

    test('Generates a Markdown string and parses it back correctly (browser)', async () => {
        const headers = ['id', 'price', 'inStock', 'tags', 'rating', 'discount', 'comments'];
        const rows = arrayfyProductsData()
        const contents = markdownTable([headers, ...rows])
        const expectedData = stringifyProductsData();
        const { result, expected } = await testBrowserProductsArray(expectedData, contents, 'md')
        
        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(TESTPRODUCTS.length);
        expectedData.forEach((product, index) => {
            expect(result.result.data[index]).toEqual(product);
        });
    }, 10000)
});