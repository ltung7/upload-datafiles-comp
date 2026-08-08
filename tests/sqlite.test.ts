import initSqlJs, { type Database } from 'sql.js';
import fs from 'fs';

import { TESTPRODUCTS, testNodeProductsArray } from "./testData";
import { test, describe, expect } from 'vitest';

let SQL: Awaited<ReturnType<typeof initSqlJs>> | null = null;
async function getSQL() {
    if (!SQL) {
        SQL = await initSqlJs();
        // If wasm resolution fails in your test env, pass locateFile:
        // SQL = await initSqlJs({ locateFile: (file) => `node_modules/sql.js/dist/${file}` });
    }
    return SQL;
}

export async function makeProductsSqliteBuffer(): Promise<Buffer> {
    const SQL = await getSQL();
    const db: Database = new SQL.Database();

    db.run(`
    CREATE TABLE products (
      id TEXT PRIMARY KEY,
      price REAL,
      inStock INTEGER,
      tags TEXT,
      rating REAL,
      discount REAL,
      comments INTEGER
    );
  `);

    const stmt = db.prepare(`
    INSERT INTO products (id, price, inStock, tags, rating, discount, comments)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

    for (const p of TESTPRODUCTS) {
        stmt.run([
            p.id,
            p.price,
            p.inStock ? 1 : 0,
            (p.tags ?? []).join(', '),
            p.rating ?? null,
            p.discount ?? null,
            p.comments ?? null,
        ]);
    }
    stmt.free();

    const data = db.export(); // Uint8Array
    db.close();

    return Buffer.from(data);
}

describe('File Processing Sqlite file Workflow', () => {
    test('Converts TESTPRODUCTS Sqlite to valid File object and processes correctly', async () => {
        const contents = await makeProductsSqliteBuffer()
        const expectedData = [{
            columns: ["id", "price", "inStock", "tags", "rating", "discount", "comments"],
            values: TESTPRODUCTS.map(p => [
                p.id,
                p.price,
                p.inStock ? 1 : 0,
                (p.tags ?? []).join(', '),
                p.rating ?? null,
                p.discount ?? null,
                p.comments ?? null,
            ])
        }]
        const { result, expected } = await testNodeProductsArray(expectedData, contents, 'sqlite')
        fs.writeFileSync('/tmp/testresults.json', JSON.stringify({ result, expected }, null, 4))
        // Assert: Verify the processed result matches original TESTPRODUCTS
        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(expectedData.length);
    })
});