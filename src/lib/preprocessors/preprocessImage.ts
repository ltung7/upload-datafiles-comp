import { readFileContens, validateAndProcess } from './common';
import { PreprocessFunction, DataFilesType, FileTypeConfig } from '../index.d';

type TesseractWorker = Awaited<ReturnType<typeof import('tesseract.js').createWorker>>;

let tesseractWorker: TesseractWorker | undefined;

async function loadTesseract(): Promise<TesseractWorker> {
    if (!tesseractWorker) {
        const { createWorker } = await import('tesseract.js');
        tesseractWorker = await createWorker('eng');
    }
    return tesseractWorker;
}

const preprocessImageFile: PreprocessFunction = async (file: File, datafiles: DataFilesType<any>, extraData: any) => {
    if (!datafiles.image) return false;

    const worker = await loadTesseract();
    const arrayBuffer = await readFileContens(file, false) as ArrayBuffer;
    // Use Buffer in Node.js (accepted by tesseract.js Node worker), Uint8Array in browser
    const imageData = typeof Buffer !== 'undefined' ? Buffer.from(arrayBuffer) : new Uint8Array(arrayBuffer);

    let extractedText: string;
    try {
        const { data } = await worker.recognize(imageData as any);
        extractedText = data.text;
    } catch (err) {
        throw new Error(`OCR failed for ${file.name}: ${(err as Error).message}`);
    }

    for (const [type, typedata] of Object.entries(datafiles.image)) {
        const headers = extractedText.split('\n').map(line => line.trim()).filter(Boolean);
        const result = await validateAndProcess(typedata, headers, extractedText, file.name, extraData);
        if (result) {
            return { result, type: typedata.specification ?? type, typedata, fileName: file.name };
        }
    }
    return false;
};

export default {
    preprocess: preprocessImageFile,
    extensions: ['png', 'jpg', 'webp']
} as FileTypeConfig;