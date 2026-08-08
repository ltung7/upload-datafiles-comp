import { dump } from 'js-yaml';
import { TESTPRODUCTS, testBrowserProductsArray, testNodeProductsArray } from "./testData";
import { test, describe, expect } from 'vitest';

describe('YAML file processing', () => {
    test('Generates a YAML string and parses it back correctly (Node)', async () => {
        const contents = dump(TESTPRODUCTS, {
            indent: 2,        // spaces per indent level (default 2)
            lineWidth: -1,    // disable line wrapping for long strings
            noRefs: true,     // disable YAML anchors/aliases for repeated objects
            sortKeys: false,  // keep key insertion order (default)
        });
        const { result, expected } = await testNodeProductsArray(TESTPRODUCTS, contents, 'yaml')

        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(TESTPRODUCTS.length);
        TESTPRODUCTS.forEach((product, index) => {
            expect(result.result.data[index]).toEqual(product);
        });
    })

    test('Generates a YAML string and parses it back correctly (browser)', async () => {
        const contents = dump(TESTPRODUCTS, {
            indent: 2,        // spaces per indent level (default 2)
            lineWidth: -1,    // disable line wrapping for long strings
            noRefs: true,     // disable YAML anchors/aliases for repeated objects
            sortKeys: false,  // keep key insertion order (default)
        });
        const { result, expected } = await testBrowserProductsArray(TESTPRODUCTS, contents, 'yaml')

        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(TESTPRODUCTS.length);
        TESTPRODUCTS.forEach((product, index) => {
            expect(result.result.data[index]).toEqual(product);
        });
    }, 10000)
});