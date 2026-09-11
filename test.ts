 
// npx tsx testfile.ts
import fs from 'fs';
import { DataFilesDescriptor, DataFilesType } from './src/lib/index.d';
import { processFile } from "./src/lib/preprocessors/common";
import { NodeFileReader } from './testParserDatafiles';
import { readFile } from 'node:fs/promises'
import util from 'util';

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
        console.log(data)
    }
};

const datafiles: DataFilesType = {
    xml: {
        process: logProcessor
    },
    pdf: {
        process: saveProcessor,
    },
    epp: {
        process: saveProcessor
    },
    image: {
        process: logProcessor
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
