import { TESTPRODUCTS, testNodeProductsArray } from "./testData";
import { test, describe, expect } from 'vitest';

describe('File Processing JSON Large file Workflow', () => {
    test('Converts TESTPRODUCTS JSON Large to valid File object and processes correctly', async () => {
        const contents = TESTPRODUCTS.map(product => JSON.stringify(product)).join('\n')
        const { result, expected } = await testNodeProductsArray(TESTPRODUCTS, contents, 'jsonl', 'logJsonLarge')
        // Assert: Verify the processed result matches original TESTPRODUCTS
        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(TESTPRODUCTS.length);

        // Verify basic data integrity
        TESTPRODUCTS.forEach((product, index) => {
            expect(result.result.data[index]).toEqual(product);
        });
    })
});