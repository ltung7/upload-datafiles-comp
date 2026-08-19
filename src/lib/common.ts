import type { DataFilesDescriptor, DataFilesType, DataFileType, PreprocessFunction } from "./index.d";
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
const modules = { xml, pdf, datasheets, json, yaml, sqlite, markdown, jsonl, php, image }

export const validateAndProcess = async (typedata: DataFilesDescriptor, headers: string[], contents: any, filename: string, extraData: any): Promise<any | undefined> => {
    if (typedata.headerLength && typedata.headerLength !== headers.length) {
        return false;
    }

    if (typedata.checkFilename) {
        const validFilename = typedata.checkFilename(filename);
        if (!validFilename) return false;
    }

    let validated = true;
    for (const column of typedata.headers) {
        if (!headers.includes(column)) validated = false;
    }
    if (validated) {
        return await typedata.process(contents, filename, extraData);
    }
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

export function generateFileTypes(keys: (DataFileType | `${DataFileType}`)[]): GeneratedFileTypes;
export function generateFileTypes(datafiles: DataFilesType): GeneratedFileTypes;
export function generateFileTypes(): GeneratedFileTypes;
export function generateFileTypes(keys?: (DataFileType | `${DataFileType}`)[] | DataFilesType | undefined): GeneratedFileTypes {
    let validKeys: DataFileType[] = []
    if (Array.isArray(keys)) {
        validKeys = keys as DataFileType[];
    } else if (typeof keys === 'object' && keys !== null) {
        validKeys = Object.keys(keys) as DataFileType[];
    } else {
        validKeys = Object.keys(modules) as DataFileType[];
    }
    const extensions: string[] = []
    const preprocessors: Record<string, PreprocessFunction> = {}

    for (const key of validKeys) {
        const module = modules[key]
        if (!module) continue

        for (const ext of module.extensions) {
            extensions.push(ext)
            preprocessors[ext] = module.preprocess
        }
    }

    const accept = extensions.map((ext) => `.${ext}`).join(',')

    return { extensions, preprocessors, accept }
}

export const processFile = async (file: File, datafiles: DataFilesType, extraData?: any) => {
    const ext = file.name.split(".").pop()?.toLowerCase() as string;
    const { preprocessors } = generateFileTypes(datafiles);
    console.log(preprocessors)
    if (!ext || !preprocessors[ext]) throw new Error("Plik ma nieprawidłowe rozszerzenie");
    const preprocess = preprocessors[ext];
    const result = await preprocess(file, datafiles, extraData);
    if (result) {
        return result;
    } else throw new Error("Specyfikacja nie została rozpoznana");
}