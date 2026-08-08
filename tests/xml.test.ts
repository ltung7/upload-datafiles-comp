import XMLBuilder  from 'fast-xml-builder'
import { TESTPRODUCTS, testNodeProductsArray } from "./testData";
import { test, describe, expect } from 'vitest';

describe('File Processing XML file Workflow', () => {
    test('Converts TESTPRODUCTS XML to valid File object and processes correctly', async () => {
        const data = { products: TESTPRODUCTS };
        const builder = new XMLBuilder();
        const contents = builder.build(data)
        const { result, expected } = await testNodeProductsArray(data, contents, 'xml')
        // Assert: Verify the processed result matches original TESTPRODUCTS
        expect(result).toEqual(expected);
        expect(result.result.data.products.length).toBe(TESTPRODUCTS.length);

        // Verify basic data integrity
        TESTPRODUCTS.forEach((product, index) => {
            expect(result.result.data.products[index]).toEqual(product);
        });
    })
});