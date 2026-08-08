import { dump } from 'js-yaml';
import { TESTPRODUCTS, testNodeProductsArray } from "./testData";
import { test, describe, expect } from 'vitest';

describe('File Processing YAML file Workflow', () => {
    test('Converts TESTPRODUCTS YAML to valid File object and processes correctly', async () => {
        console.log('yaml.dump ------- ', dump)
        const contents = dump(TESTPRODUCTS, {
            indent: 2,        // spaces per indent level (default 2)
            lineWidth: -1,    // disable line wrapping for long strings
            noRefs: true,     // disable YAML anchors/aliases for repeated objects
            sortKeys: false,  // keep key insertion order (default)
        });
        const { result, expected } = await testNodeProductsArray(TESTPRODUCTS, contents, 'yaml')
        // Assert: Verify the processed result matches original TESTPRODUCTS
        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(TESTPRODUCTS.length);

        // Verify basic data integrity
        TESTPRODUCTS.forEach((product, index) => {
            expect(result.result.data[index]).toEqual(product);
        });
    })
});