import { TESTPRODUCTS, testBrowserProductsArray, testNodeProductsArray } from "./testData";
import { test, describe, expect } from 'vitest';

describe('JSON File processing', () => {
    test('Generates a JSON string and parses it back correctly (Node)', async () => {
        const contents = JSON.stringify(TESTPRODUCTS)
        const { result, expected } = await testNodeProductsArray(TESTPRODUCTS, contents, 'json')
        
        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(TESTPRODUCTS.length);
        TESTPRODUCTS.forEach((product, index) => {
            expect(result.result.data[index]).toEqual(product);
        });
    })

    test('Generates a JSON string and parses it back correctly (browser)', async () => {
        const contents = JSON.stringify(TESTPRODUCTS)
        const { result, expected } = await testBrowserProductsArray(TESTPRODUCTS, contents, 'json')
        
        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(TESTPRODUCTS.length);
        TESTPRODUCTS.forEach((product, index) => {
            expect(result.result.data[index]).toEqual(product);
        }, 10000);
    })
});