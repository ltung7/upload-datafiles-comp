// npx tsx testfile.ts
import { processFile } from './src/lib/common';
import datafiles, { NodeFileReader } from './testParserDatafiles';
import { readFile } from 'node:fs/promises'
import util from 'util';

if (typeof globalThis.FileReader === 'undefined') {
  (globalThis as any).FileReader = NodeFileReader;
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
    console.log(util.inspect(result, { showHidden: false, depth: null, colors: true }));
})