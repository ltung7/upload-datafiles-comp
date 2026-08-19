 
// npx tsx testfile.ts
import fs from 'fs';
import { DataFilesDescriptor, DataFilesType } from './src/lib/index.d';
import { processFile } from './src/lib/common';
import { NodeFileReader } from './testParserDatafiles';
import { readFile } from 'node:fs/promises'
import util from 'util';
import hix from "./hix.ds";

if (typeof globalThis.FileReader === 'undefined') {
  (globalThis as any).FileReader = NodeFileReader;
}

const saveProcessor: DataFilesDescriptor = {
    headers: [],
    headerLength: 0,
    process: async (data, filename) => {
        await fs.promises.writeFile(`/tmp/${filename}.json`, JSON.stringify(data, null, 4))
    }
}

const logProcessor: DataFilesDescriptor = {
    headers: [],
    headerLength: 0,
    process: async (data) => {
        let rows: any[] = data.JPK.Ewidencja.SprzedazWiersz as any | any[];
        if (!Array.isArray(rows)) rows = [ rows ];
        const invoices = rows.map(item => item.DowodSprzedazy)
        return invoices;
    }
};

const datafiles: DataFilesType = {
    xml: {
        process: logProcessor
    },
    pdf: {
        hix,
        process: saveProcessor,
    },
    image: {
        
    }
}

const main = async () => {
    const filename = process.argv[2]

    if (!filename) {
        console.error('Usage: tsx test.ts <filename>')
        process.exit(1)
    }

    const buffer = await readFile('/tmp/' + filename)
    const file = new File([buffer], filename);

    const result = await processFile(file, datafiles);
    return result
}

main().catch((err) => {
    console.error('Failed:', err)
    process.exit(1)
}).then((result) => {
    console.log(util.inspect(result.result, { showHidden: false, depth: null, colors: true }));
})