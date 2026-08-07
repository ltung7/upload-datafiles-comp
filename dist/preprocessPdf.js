import { readFileContens, validateAndProcess } from "./common";
let pdfjsModule;
const loadPdfJs = async () => {
    if (!pdfjsModule) {
        // @ts-expect-error skip type check
        pdfjsModule = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs');
        pdfjsModule.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
    }
    return pdfjsModule;
};
async function getPdfText(buffer) {
    const data = new Uint8Array(buffer);
    const pdfjsLib = await loadPdfJs();
    const doc = await pdfjsLib.getDocument({ data }).promise;
    const contents = [];
    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const text = await page.getTextContent();
        for (const content of text.items) {
            contents.push(content.str);
        }
    }
    return contents;
}
const preprocessPdf = async (file, datafiles, extraData) => {
    if (!datafiles.pdf)
        return false;
    const contentRaw = await readFileContens(file);
    const contents = await getPdfText(contentRaw);
    for (const [type, typedata] of Object.entries(datafiles.pdf)) {
        const headers = contents.slice(0, typedata.headerLength ?? 20);
        const result = await validateAndProcess(typedata, headers, contents, file.name, extraData);
        if (result) {
            return { result, type: typedata.specification ?? type, typedata, fileName: file.name };
        }
    }
    return false;
};
export default {
    preprocess: preprocessPdf,
    extensions: ['pdf']
};
