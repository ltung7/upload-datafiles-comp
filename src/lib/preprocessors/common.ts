import type { DataFilesDescriptor, DataFilesType, DataFileType, PreprocessFunction, FileTypeConfig, RecognitionDiagnostics } from "../index.d";
import pdf from './preprocessPdf'
import xml from './preprocessXml'
import json from './preprocessJson'
import jsonl from './preprocessJsonLarge'
import yaml from './preprocessYaml'
import sqlite from './preprocessSqlite'
import datasheets from './preprocessDatasheet'
import markdown from './preprocessMarkdown'
import php from './preprocessPhp';
import image from './preprocessImage';
import epp from './preprocessEpp';
const modules: Record<string, FileTypeConfig> = { xml, pdf, datasheets, json, yaml, sqlite, markdown, jsonl, php, image, epp }

let diagnostics: RecognitionDiagnostics | undefined;

const CONTENT_SAMPLE_LENGTH = 4000;
const HEADER_SAMPLE_LENGTH = 60;

const contentSample = (contents: unknown): string | undefined => {
    if (contents === null || contents === undefined) return undefined;
    let text: string;
    if (typeof contents === 'string') text = contents;
    else if (Array.isArray(contents) && contents.every((item) => typeof item === 'string')) text = (contents as string[]).join(' ');
    else if (Array.isArray(contents)) text = JSON.stringify(contents);
    else if (typeof contents === 'object') {
        try { text = JSON.stringify(contents); } catch { text = String(contents); }
    } else text = String(contents);
    return text.length > CONTENT_SAMPLE_LENGTH ? `${text.slice(0, CONTENT_SAMPLE_LENGTH)}…` : text;
};

/** Starts collecting diagnostics for one file. Call before running a preprocessor. */
export const resetRecognitionDiagnostics = (fileName: string, fileExtension?: string): void => {
    diagnostics = { fileName, fileExtension, tried: [] };
};

/** Diagnostics of the last preprocessed file, for logging when nothing matched. */
export const getRecognitionDiagnostics = (): RecognitionDiagnostics | undefined => diagnostics;

/** Adds arbitrary context (parsed text, headers, notes) to the current diagnostics. */
export const noteRecognition = (note: Partial<RecognitionDiagnostics>): void => {
    if (!diagnostics) return;
    diagnostics = { ...diagnostics, ...note, tried: diagnostics.tried };
};

const recordAttempt = (typedata: DataFilesDescriptor, type: string, headers: string[], reason: string): void => {
    diagnostics?.tried.push({
        type,
        specification: typedata.specification,
        reason,
        expectedHeaders: typedata.headers,
        receivedHeaders: headers.slice(0, HEADER_SAMPLE_LENGTH)
    });
};

export const validateAndProcess = async (
    typedata: DataFilesDescriptor,
    headers: string[],
    contents: any,
    filename: string,
    extraData: any,
    type?: string
): Promise<any | undefined> => {
    const label = type ?? typedata.specification ?? 'descriptor';
    if (diagnostics && !diagnostics.text) {
        noteRecognition({ text: contentSample(contents), headers: headers.slice(0, HEADER_SAMPLE_LENGTH) });
    }

    if (typedata.headerLength && typedata.headerLength !== headers.length) {
        recordAttempt(typedata, label, headers, `headerLength: oczekiwano ${typedata.headerLength}, otrzymano ${headers.length}`);
        return undefined;
    }

    if (typedata.checkFilename) {
        const validFilename = typedata.checkFilename(filename);
        if (!validFilename) {
            recordAttempt(typedata, label, headers, 'checkFilename odrzucił nazwę pliku');
            return undefined;
        }
    }

    const missing = typedata.headers.filter((column) => !headers.includes(column));
    if (missing.length) {
        recordAttempt(typedata, label, headers, `brak nagłówków: ${missing.join(', ')}`);
        return undefined;
    }

    const result = await typedata.process(contents, filename, extraData);
    if (!result) recordAttempt(typedata, label, headers, 'process nie zwrócił wyniku');
    return result;
};

export function readFileContens(file: File, asText: true): Promise<string>;
export function readFileContens(file: File, asText?: false): Promise<ArrayBuffer>;
export function readFileContens(
    file: File,
    asText: boolean = false
): Promise<string | ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        // Standard load handler
        reader.onload = () => {
            if (reader.result !== null) {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to read file contents: result was null'));
            }
        };

        // Standard error handler
        reader.onerror = () => {
            reject(reader.error || new Error('An error occurred reading the file.'));
        };

        // Switch reading mode based on asText flag
        if (asText) {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    });
}

interface GeneratedFileTypes {
    extensions: string[];
    preprocessors: Record<string, PreprocessFunction>;
    accept: string;
}

export interface CustomModules {
    [key: string]: FileTypeConfig;
}

export function generateFileTypes(keys: (DataFileType | `${DataFileType}`)[]): GeneratedFileTypes;
export function generateFileTypes(datafiles: DataFilesType): GeneratedFileTypes;
export function generateFileTypes(keys: (DataFileType | `${DataFileType}`)[] | DataFilesType, customModules?: CustomModules): GeneratedFileTypes;
export function generateFileTypes(): GeneratedFileTypes;
export function generateFileTypes(keys?: (DataFileType | `${DataFileType}`)[] | DataFilesType | undefined, customModules?: CustomModules): GeneratedFileTypes {
    const mergedModules: Record<string, FileTypeConfig> = { ...modules, ...customModules };

    let validKeys: string[] = []
    if (Array.isArray(keys)) {
        validKeys = keys as DataFileType[];
    } else if (typeof keys === 'object' && keys !== null) {
        validKeys = Object.keys(keys) as DataFileType[];
    } else {
        validKeys = Object.keys(mergedModules) as DataFileType[];
    }
    const extensions: string[] = []
    const preprocessors: Record<string, PreprocessFunction> = {}

    for (const key of validKeys) {
        const module = mergedModules[key]
        if (!module) continue

        for (const ext of module.extensions) {
            extensions.push(ext)
            preprocessors[ext] = module.preprocess
        }
    }

    const accept = extensions.map((ext) => `.${ext}`).join(',')
    return { extensions, preprocessors, accept }
}

export const processFile = async (file: File, datafiles: DataFilesType, extraData?: any, customModules?: CustomModules) => {
    const ext = file.name.split(".").pop()?.toLowerCase() as string;
    const { preprocessors } = generateFileTypes(datafiles, customModules);
    if (!ext || !preprocessors[ext]) throw new Error("Plik ma nieprawidłowe rozszerzenie");
    const preprocess = preprocessors[ext];
    resetRecognitionDiagnostics(file.name, ext);
    const result = await preprocess(file, datafiles, extraData);
    if (result) {
        return result;
    } else {
        const error = new Error("Specyfikacja nie została rozpoznana") as Error & { diagnostics?: RecognitionDiagnostics };
        error.diagnostics = getRecognitionDiagnostics();
        throw error;
    }
}

