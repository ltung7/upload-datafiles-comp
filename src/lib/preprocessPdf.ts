import { readFileContens, validateAndProcess } from "./common";
import { PreprocessFunction, DataFilesType, FileTypeConfig } from './index.d';

let pdfjsModule: any;

const loadPdfJs = async (): Promise<typeof import('pdfjs-dist')> => {
    if (!pdfjsModule) {
        pdfjsModule = await import('pdfjs-dist/legacy/build/pdf.mjs');
        if (typeof window !== 'undefined') {
            // Browser (Vite): Dynamically load Vite's asset URL
            pdfjsModule.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.1.200/build/pdf.worker.min.mjs';
        } else {
            pdfjsModule.GlobalWorkerOptions.workerSrc = import.meta.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs');
        }
    }
    return pdfjsModule;
};

async function getPdfText(buffer: ArrayBuffer) {
    const data = new Uint8Array(buffer);
    const pdfjsLib = await loadPdfJs();
    const doc = await pdfjsLib.getDocument({ data }).promise;

    const contents = [];
    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const text = await page.getTextContent();
        for (const content of text.items as { str: string }[]) {
            contents.push(content.str);
        }
    }
    return contents;
}

const preprocessPdf: PreprocessFunction = async (file: File, datafiles: DataFilesType<any>, extraData: any) => {
    if (!datafiles.pdf) return false;
    const contentRaw = await readFileContens(file);
    const contents = await getPdfText(contentRaw as ArrayBuffer);
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
    extensions: [ 'pdf' ]
} as FileTypeConfig;