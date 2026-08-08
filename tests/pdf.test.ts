import PDFDocument from 'pdfkit';

import { stringifyProductsData, testNodeProductsArray } from "./testData";
import { test, describe, expect } from 'vitest';
export function makeProductsPdfBuffer(
    rows: ReturnType<typeof stringifyProductsData> = stringifyProductsData()
): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Title
        doc.fontSize(18).text('Products', { align: 'left' });
        doc.moveDown();

        const startX = doc.page.margins.left;
        let y = doc.y;

        const columns = [
            { key: 'id', label: 'ID', width: 50 },
            { key: 'price', label: 'Price', width: 60 },
            { key: 'inStock', label: 'In Stock', width: 60 },
            { key: 'tags', label: 'Tags', width: 110 },
            { key: 'rating', label: 'Rating', width: 50 },
            { key: 'discount', label: 'Discount', width: 60 },
            { key: 'comments', label: 'Comments', width: 60 },
        ] as const;

        // Header row
        doc.fontSize(10).font('Helvetica-Bold');
        let x = startX;
        for (const col of columns) {
            doc.text(col.label, x, y, { width: col.width });
            x += col.width;
        }

        y += 18;
        const tableWidth = columns.reduce((sum, c) => sum + c.width, 0);
        doc.moveTo(startX, y).lineTo(startX + tableWidth, y).stroke();
        y += 6;

        // Data rows
        doc.font('Helvetica').fontSize(9);
        for (const row of rows) {
            if (y > doc.page.height - doc.page.margins.bottom - 30) {
                doc.addPage();
                y = doc.page.margins.top;
            }

            x = startX;
            for (const col of columns) {
                doc.text(row[col.key], x, y, { width: col.width });
                x += col.width;
            }

            y += 18;
        }

        doc.end();
    });
}

describe('File Processing PDF file Workflow', () => {
    test('Converts TESTPRODUCTS PDF to valid File object and processes correctly', async () => {
        // Build the matrix of strings: header row + data rows
        const data = stringifyProductsData();
        const contents = await makeProductsPdfBuffer(data);
        const expectedData = [ "Products", "", "ID", " ", "Price", " ", "In Stock", " ", "Tags", " ", "Rating", " ", "Discount", " ", "Comments", "", "A001", " ", "19.99", " ", "true", " ", "new, best-seller", " ", "0", " ", "0", " ", "0", "B002", " ", "5", " ", "false", " ", "4.2", " ", "0", " ", "0", "C003", " ", "120", " ", "true", " ", "0", " ", "15", " ", "0", "D004", " ", "8", " ", "true", " ", "0", " ", "0", " ", "0", "E005", " ", "250", " ", "false", " ", "0", " ", "0", " ", "12" ];
        const { result, expected } = await testNodeProductsArray(expectedData, contents, 'pdf', 'logPdf')

        // Assert: Verify the processed result matches original TESTPRODUCTS
        for (const item of result.result.data) {
            for (let i = 0; i < item.length; i++) {
                if (typeof item[i] === 'undefined') item[i] = '';
            }
        }

        expect(result).toEqual(expected);
        expect(result.result.data.length).toBe(expectedData.length);
    })
});