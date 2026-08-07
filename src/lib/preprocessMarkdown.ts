import { readFileContens, validateAndProcess } from './common';
import { PreprocessFunction, DataFilesType, FileTypeConfig } from './index.d';

let markdownParserModule: any;

async function loadMarkdownParser() {
    if (!markdownParserModule) {
        // @ts-expect-error skip type check
        markdownParserModule = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/parse-markdown-table@0.0.6/+esm');
    }
    return markdownParserModule;
}

const preprocessMarkdownFile: PreprocessFunction = async (file: File, datafiles: DataFilesType<any>, extraData: any) => {
    if (!datafiles.xml) return false;
    const content = await readFileContens(file, true);
    const { createMarkdownObjectTable } = await loadMarkdownParser();
    const mdContent = await createMarkdownObjectTable(content);
    const parsedContens: any[] = [];
    for await (const row of mdContent) {
        parsedContens.push(row)
    }
    const headers = Object.keys(parsedContens[0]);

    for (const [type, typedata] of Object.entries(datafiles.xml)) {
        const result = await validateAndProcess(typedata, headers, parsedContens, file.name, extraData);
        if (result) {
            return { result, type: typedata.specification ?? type, typedata, fileName: file.name };
        }
    }
    return false;
};


export default {
    preprocess: preprocessMarkdownFile,
    extensions: [ 'md' ]
} as FileTypeConfig;