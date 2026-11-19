import { noteRecognition, readFileContens, validateAndProcess } from './common';
import { PreprocessFunction, DataFilesType, FileTypeConfig } from '../index.d';

type TesseractWorker = Awaited<ReturnType<typeof import('tesseract.js').createWorker>>;

/** Base OCR language. Tesseract accepts several languages as one string, e.g. 'pol+eng'. */
const TESSERACT_LANGUAGES = 'pol';

/** Brands stored in the ISO-BMFF `ftyp` box of HEIC/HEIF files. */
const HEIF_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs', 'mif1', 'msf1']);

const HEIC_EXTENSION = /\.(heic|heif)$/i;

let tesseractWorker: TesseractWorker | undefined;

async function loadTesseract(): Promise<TesseractWorker> {
    if (!tesseractWorker) {
        const { createWorker } = await import('tesseract.js');
        tesseractWorker = await createWorker(TESSERACT_LANGUAGES);
    }
    return tesseractWorker;
}

/** True in a browser window and in a Web Worker (both can use the browser HEIC converter). */
const isBrowserRuntime = (): boolean =>
    typeof window !== 'undefined' || typeof self !== 'undefined';

/**
 * Imports a Node-only package through a computed specifier so browser bundlers do not try to
 * resolve its Node built-ins (`fs`, `path`). Only ever called in Node.
 */
const importNodeModule = (specifier: string): Promise<any> => import(specifier);

const brandAt = (bytes: Uint8Array, offset: number): string =>
    String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);

/**
 * Detects the HEIF container by its magic bytes, so HEIC photos renamed to `.jpg` are
 * still converted before OCR.
 */
const isHeifContainer = (buffer: ArrayBuffer): boolean => {
    const bytes = new Uint8Array(buffer);
    if (bytes.length < 12 || brandAt(bytes, 4) !== 'ftyp') return false;
    if (HEIF_BRANDS.has(brandAt(bytes, 8))) return true;
    // The compatible brands follow the major brand (4 bytes) and minor_version (4 bytes).
    const boxSize = new DataView(buffer).getUint32(0);
    const end = Math.min(bytes.length, boxSize || bytes.length);
    for (let offset = 16; offset + 4 <= end; offset += 4) {
        if (HEIF_BRANDS.has(brandAt(bytes, offset))) return true;
    }
    return false;
};

/**
 * HEIC/HEIF is not decodable by Tesseract or by browser image APIs, so it is always
 * converted to JPEG first: `heic-to` (libheif wasm) in the browser, `heic-convert`
 * (libheif for Node) on the server.
 */
const convertHeicToJpeg = async (file: File, buffer: ArrayBuffer): Promise<Blob | Buffer> => {
    if (isBrowserRuntime()) {
        const { heicTo } = await import('heic-to');
        return heicTo({ blob: file, type: 'image/jpeg', quality: 0.95 });
    }

    const imported = await importNodeModule('heic-convert');
    const convert = imported.default ?? imported;
    const jpeg = await convert({ buffer: Buffer.from(buffer), format: 'JPEG', quality: 1 });
    return Buffer.from(jpeg);
};

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
    const isHeic = HEIC_EXTENSION.test(file.name) || isHeifContainer(arrayBuffer);

    let imageData: Blob | Buffer | Uint8Array;
    if (isHeic) {
        try {
            imageData = await convertHeicToJpeg(file, arrayBuffer);
        } catch (err) {
            throw new Error(`HEIC conversion failed for ${file.name}: ${(err as Error).message}`);
        }
    } else {
        // Use Buffer in Node.js (accepted by tesseract.js Node worker), Uint8Array in browser
        imageData = typeof Buffer !== 'undefined' ? Buffer.from(arrayBuffer) : new Uint8Array(arrayBuffer);
    }

    let extractedText: string;
    try {
        const { data } = await worker.recognize(imageData as any);
        extractedText = data.text;
    } catch (err) {
        throw new Error(`OCR failed for ${file.name}: ${(err as Error).message}`);
    }

    const headers = extractedText.split('\n').map(line => line.trim()).filter(Boolean);
    const notes = descriptors.length ? [] : ['OCR uruchomiony tylko diagnostycznie: brak descriptorów obrazów w datafiles.image'];
    if (isHeic) notes.push('HEIC/HEIF przekonwertowany do JPEG przed OCR');
    noteRecognition({
        dataType: 'image',
        text: extractedText,
        headers,
        notes: notes.length ? notes : undefined
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
    extensions: ['png', 'jpg', 'webp', 'jpeg', 'heic', 'heif']
} as FileTypeConfig;
