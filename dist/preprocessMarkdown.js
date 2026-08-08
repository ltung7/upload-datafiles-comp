import { readFileContens, validateAndProcess } from './common';
let markdownParserModule;
async function loadMarkdownParser() {
    if (!markdownParserModule) {
        const { createMarkdownObjectTable } = await import('parse-markdown-table');
        markdownParserModule = { createMarkdownObjectTable };
    }
    return markdownParserModule;
}
const preprocessMarkdownFile = async (file, datafiles, extraData) => {
    if (!datafiles.markdown)
        return false;
    const content = await readFileContens(file, true);
    const { createMarkdownObjectTable } = await loadMarkdownParser();
    const mdContent = await createMarkdownObjectTable(content);
    const parsedContens = [];
    for await (const row of mdContent) {
        parsedContens.push(row);
    }
    const headers = Object.keys(parsedContens[0]);
    for (const [type, typedata] of Object.entries(datafiles.markdown)) {
        const result = await validateAndProcess(typedata, headers, parsedContens, file.name, extraData);
        if (result) {
            return { result, type: typedata.specification ?? type, typedata, fileName: file.name };
        }
    }
    return false;
};
export default {
    preprocess: preprocessMarkdownFile,
    extensions: ['md']
};
