import { TESTPRODUCTS, testBrowserProductsArray, testNodeProductsArray } from "./testData";
import { test, describe, expect } from 'vitest';
import { serialize } from 'locutus/php/var/serialize';

describe('PHP file processing', () => {
    test('Generates a PHP string and parses it back correctly (Node)', async () => {
        const contents = serialize(TESTPRODUCTS);
        const { result, expected } = await testNodeProductsArray(TESTPRODUCTS, contents, 'php')

        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(TESTPRODUCTS.length);

        TESTPRODUCTS.forEach((product, index) => {
            expect(result.result.data[index]).toEqual(product);
        });
    })

    test('Generates a PHP string and parses it back correctly (browser)', async () => {
        const contents = serialize(TESTPRODUCTS);
        const { result, expected } = await testBrowserProductsArray(TESTPRODUCTS, contents, 'php')

        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(TESTPRODUCTS.length);

        TESTPRODUCTS.forEach((product, index) => {
            expect(result.result.data[index]).toEqual(product);
        });
    }, 10000)
});