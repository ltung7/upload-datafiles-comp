import fs from "fs";

import { processFile } from "../src/lib/common";
import datafiles, { NodeFileReader } from "../testParserDatafiles";

if (typeof globalThis.FileReader === 'undefined') {
    (globalThis as any).FileReader = NodeFileReader;
}

/**
 * Generic test data structure with separate category and product variables.
 *
 * - TESTCATEGORIES: array of objects with `id` and `name`.
 * - TESTPRODUCTS: array with a mix of primitive values (strings, numbers, booleans) and simple objects.
 */

export const TESTCATEGORIES = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Books' },
    { id: 3, name: 'Clothing' },
    { id: 4, name: 'Home & Garden' },
    { id: 5, name: 'Sports' }
];

type Product = {
    id: string;
    price: number;
    inStock: boolean;
    tags?: string[];
    rating?: number;
    discount?: number;
    comments?: number;
};
export const TESTPRODUCTS: Product[] = [
    { id: 'A001', price: 19.99, inStock: true, tags: ['new', 'best-seller'] },
    { id: 'B002', price: 5, inStock: false, rating: 4.2 },
    { id: 'C003', price: 120, inStock: true, discount: 15 },
    { id: 'D004', price: 8, inStock: true },
    { id: 'E005', price: 250, inStock: false, comments: 12 }
];

export const TESTDATA = {
    products: TESTPRODUCTS,
    categories: TESTCATEGORIES
};

export function createFileObject(content: string | ArrayBuffer | Buffer, filename: string): File {
    // Convert content to ArrayBuffer for File constructor compatibility
    if (typeof content === 'string') {
        const encoder = new TextEncoder();
        const arrayBuffer = encoder.encode(content);
        return new File([arrayBuffer], filename);
    } else if (Buffer.isBuffer(content)) {
        function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
            return buffer.buffer.slice(
                buffer.byteOffset,
                buffer.byteOffset + buffer.byteLength
            ) as ArrayBuffer;
        }
        return new File([bufferToArrayBuffer(content)], filename)
    } else {
        return new File([content], filename)
    }
}

export function testResults(data: any, fileName: string, type: string) {
    return {
        result: { data, filename: fileName },
        fileName,
        type,
        typedata: {
            headerLength: 0,
            headers: [],
            process: undefined
        }
    }
}

export const testNodeProductsArray = async (data: any, contents: string | ArrayBuffer | Buffer, ext: string, logType?: string) => {
    // Arrange: Create test file with TESTPRODUCTS JSON content
    const filename = 'test.' + ext;
    const testFile = createFileObject(contents, filename);
    if (!logType) logType = 'log' + ext[0].toUpperCase() + ext.slice(1)
    const expected = testResults(data, filename, logType);
    if (typeof contents === 'string') {
        fs.writeFileSync('/tmp/ud-' + filename, contents);
    } else {
        fs.writeFileSync('/tmp/ud-' + filename, new Uint8Array(contents));
    }
    // Act: Process the file using the system's processing workflow
    const result = await processFile(testFile, datafiles);
    result.typedata.process = undefined as never;
    return { result, expected }
}

export const stringifyProductsData = () => {
    const rows = TESTPRODUCTS.map(p => ({
        id: p.id,
        price: p.price.toString(),
        inStock: p.inStock.toString(),
        tags: (p?.tags ?? []).join(', '),
        rating: (p.rating ?? 0).toString(),
        discount: (p.discount ?? 0).toString(),
        comments: (p.comments ?? 0).toString()
    }));
    return rows;
}

export const arrayfyProductsData = () => {
    const rows = TESTPRODUCTS.map(p => [
        p.id,
        p.price.toString(),
        p.inStock.toString(),
        (p.tags ?? []).join(', '),
        (p.rating ?? 0).toString(),
        (p.discount ?? 0).toString(),
        (p.comments ?? 0).toString()
    ]);
    return rows;
}

export function toDelimited(data: Product[], delimiter: ',' | '\t'): string {
    const headers = ['id', 'price', 'inStock', 'tags', 'rating', 'discount', 'comments'];

    const escapeCell = (value: string): string => {
        const needsQuoting =
            value.includes(delimiter) ||
            value.includes('"') ||
            value.includes('\n') ||
            value.includes('\r') ||
            value === '';
        if (needsQuoting) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    };

    const rows = data.map(p => [
        p.id,
        p.price.toString(),
        p.inStock.toString(),
        (p?.tags ?? []).join(', '), // avoid clashing with the delimiter
        (p.rating ?? 0).toString(),
        (p.discount ?? 0).toString(),
        (p.comments ?? 0).toString()
    ]);

    return [headers, ...rows]
        .map(row => row.map(escapeCell).join(delimiter))
        .join('\n');
}