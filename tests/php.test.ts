import { TESTPRODUCTS, testNodeProductsArray } from "./testData";
import { test, describe, expect } from 'vitest';
import { serialize } from 'locutus/php/var/serialize';

describe('File Processing PHP file Workflow', () => {
    test('Converts TESTPRODUCTS PHP to valid File object and processes correctly', async () => {
        const contents = serialize(TESTPRODUCTS);
        const { result, expected } = await testNodeProductsArray(TESTPRODUCTS, contents, 'php')
        // Assert: Verify the processed result matches original TESTPRODUCTS
        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(TESTPRODUCTS.length);

        // Verify basic data integrity
        TESTPRODUCTS.forEach((product, index) => {
            expect(result.result.data[index]).toEqual(product);
        });
    })
});