import { markdownTable } from 'markdown-table';
import { TESTPRODUCTS, arrayfyProductsData, stringifyProductsData, testNodeProductsArray } from "./testData";
import { test, describe, expect } from 'vitest';

describe('File Processing Markdown file Workflow', () => {
    test('Converts TESTPRODUCTS Markdown to valid File object and processes correctly', async () => {
        const headers = ['id', 'price', 'inStock', 'tags', 'rating', 'discount', 'comments'];
        const rows = arrayfyProductsData()
        const contents = markdownTable([headers, ...rows])
        const expectedData = stringifyProductsData();
        const { result, expected } = await testNodeProductsArray(expectedData, contents, 'md')
        
        // Assert: Verify the processed result matches original TESTPRODUCTS
        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(TESTPRODUCTS.length);

        // Verify basic data integrity
        expectedData.forEach((product, index) => {
            expect(result.result.data[index]).toEqual(product);
        });
    })
});