// npx tsx script.ts
import { generateFileTypes } from './src/lib/common';
import datafiles from './testParserDatafiles';
import { readFile } from 'node:fs/promises'
import { extname } from 'node:path'
import { chromium } from 'playwright';
import { build } from 'esbuild';
import util from 'util';

const main = async () => {
    const filename = process.argv[2]

    if (!filename) {
        console.error('Usage: tsx cli-test.ts <filename>')
        process.exit(1)
    }

    const ext = extname(filename).slice(1).toLowerCase()
    const { preprocessors } = generateFileTypes()
    const preprocess = preprocessors[ext];
    if (!preprocess) {
        console.error(`No preprocessor registered for extension ".${ext}"`)
        process.exit(1)
    }

    const buffer = await readFile('/tmp/' + filename)
    const content = buffer.toString('base64');
    const result = await build({
        stdin: {
            contents: `
                import { generateFileTypes } from './src/lib/common';
                import datafiles from './testParserDatafiles';

                window.generateFileTypes = generateFileTypes;
                window.datafiles = datafiles;
            `,
            resolveDir: process.cwd(),
            loader: 'ts',
        },
        bundle: true,
        format: 'esm',
        write: false,
        platform: 'browser',
    });
    const bundledCode = result.outputFiles[0].text;

    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('about:blank');
    page.on('console', msg => console.log('[browser]', msg.text()));
    page.on('pageerror', err => console.error('[browser error]', err));
    await page.addScriptTag({
        content: bundledCode,
        type: 'module',
    });
    const browserResult = await page.evaluate(async ({ content, filename, ext }) => {
        const { preprocessors } = generateFileTypes()
        const preprocess = preprocessors[ext];

        const binaryString = atob(content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const file = new File([bytes], filename);

        const runResult = await preprocess(file, datafiles);
        return runResult;
    }, { content, filename, ext });

    // const result = await preprocess(file, datafiles)
    console.log(util.inspect(browserResult, { showHidden: false, depth: null, colors: true }));
    await browser.close();
}

main().catch((err) => {
    console.error('Failed:', err)
    process.exit(1)
})