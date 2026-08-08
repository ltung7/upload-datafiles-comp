import XMLBuilder  from 'fast-xml-builder'
import { TESTPRODUCTS, testBrowserProductsArray, testNodeProductsArray } from "./testData";
import { test, describe, expect } from 'vitest';

describe('XML file processing', () => {
    test('Generates a XML string and parses it back correctly (Node)', async () => {
        const data = { products: TESTPRODUCTS };
        const builder = new XMLBuilder();
        const contents = builder.build(data)
        const { result, expected } = await testNodeProductsArray(data, contents, 'xml')

        expect(result).toEqual(expected);
        expect(result.result.data.products.length).toBe(TESTPRODUCTS.length);
        TESTPRODUCTS.forEach((product, index) => {
            expect(result.result.data.products[index]).toEqual(product);
        });
    })

    test('Generates a XML string and parses it back correctly (browser)', async () => {
        const data = { products: TESTPRODUCTS };
        const builder = new XMLBuilder();
        const contents = builder.build(data)
        const { result, expected } = await testBrowserProductsArray(data, contents, 'xml')

        expect(result).toEqual(expected);
        expect(result.result.data.products.length).toBe(TESTPRODUCTS.length);
        TESTPRODUCTS.forEach((product, index) => {
            expect(result.result.data.products[index]).toEqual(product);
        });
    }, 10000)
});