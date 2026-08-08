import { TESTPRODUCTS, testNodeProductsArray } from "./testData";
import { test, describe, expect } from 'vitest';

describe('File Processing JSON file Workflow', () => {
    test('Converts TESTPRODUCTS JSON to valid File object and processes correctly', async () => {
        const contents = JSON.stringify(TESTPRODUCTS)
        const { result, expected } = await testNodeProductsArray(TESTPRODUCTS, contents, 'json')
        // Assert: Verify the processed result matches original TESTPRODUCTS
        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(TESTPRODUCTS.length);

        // Verify basic data integrity
        TESTPRODUCTS.forEach((product, index) => {
            expect(result.result.data[index]).toEqual(product);
        });
    })
});