import { noteRecognition, readFileContens, validateAndProcess } from './common';
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

/** Set localStorage['upload-datafiles:debug'] = '1' to OCR images even when no image descriptor is registered. */
const isOcrDebugEnabled = (): boolean => {
    try {
        return typeof localStorage !== 'undefined' && localStorage.getItem('upload-datafiles:debug') === '1';
    } catch {
        return false;
    }
};

const preprocessImageFile: PreprocessFunction = async (file: File, datafiles: DataFilesType<any>, extraData: any, options?: { debug?: boolean }) => {
    const descriptors = Object.entries(datafiles.image ?? {});
    const debug = options?.debug || isOcrDebugEnabled();
    // Nothing to recognise against: return before loading Tesseract. OCR of a photo is slow
    // and its WASM core prints harmless "Image too small to scale!!" warnings to the console.
    // In debug mode OCR still runs so the extracted text ends up in the error diagnostics.
    if (!descriptors.length && !debug) {
        noteRecognition({
            dataType: 'image',
            notes: ['OCR pominięty: datafiles.image jest puste, więc nie ma z czym porównać wyniku']
        });
        return false;
    }

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

    const headers = extractedText.split('\n').map(line => line.trim()).filter(Boolean);
    noteRecognition({
        dataType: 'image',
        text: extractedText,
        headers,
        notes: descriptors.length ? undefined : ['OCR uruchomiony tylko diagnostycznie: brak descriptorów obrazów w datafiles.image']
    });

    for (const [type, typedata] of descriptors) {
        const result = await validateAndProcess(typedata, headers, extractedText, file.name, extraData, type);
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