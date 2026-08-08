import { TESTPRODUCTS, testBrowserProductsArray, testNodeProductsArray } from "./testData";
import { test, describe, expect } from 'vitest';

describe('Lage JSON File processing', () => {
    test('Generates a JSONL string and parses it back correctly (Node)', async () => {
        const contents = TESTPRODUCTS.map(product => JSON.stringify(product)).join('\n')
        const { result, expected } = await testNodeProductsArray(TESTPRODUCTS, contents, 'jsonl', 'logJsonLarge')
        
        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(TESTPRODUCTS.length);
        TESTPRODUCTS.forEach((product, index) => {
            expect(result.result.data[index]).toEqual(product);
        });
    })

    test('Generates a JSONL string and parses it back correctly (broser)', async () => {
        const contents = TESTPRODUCTS.map(product => JSON.stringify(product)).join('\n')
        const { result, expected } = await testBrowserProductsArray(TESTPRODUCTS, contents, 'jsonl', 'logJsonLarge')
        
        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(TESTPRODUCTS.length);
        TESTPRODUCTS.forEach((product, index) => {
            expect(result.result.data[index]).toEqual(product);
        });
    }, 10000)
});