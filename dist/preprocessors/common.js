import pdf from './preprocessPdf';
import xml from './preprocessXml';
import json from './preprocessJson';
import jsonl from './preprocessJsonLarge';
import yaml from './preprocessYaml';
import sqlite from './preprocessSqlite';
import datasheets from './preprocessDatasheet';
import markdown from './preprocessMarkdown';
import php from './preprocessPhp';
import image from './preprocessImage';
import epp from './preprocessEpp';
const modules = { xml, pdf, datasheets, json, yaml, sqlite, markdown, jsonl, php, image, epp };
let diagnostics;
const CONTENT_SAMPLE_LENGTH = 4000;
const HEADER_SAMPLE_LENGTH = 60;
const contentSample = (contents) => {
    if (contents === null || contents === undefined)
        return undefined;
    let text;
    if (typeof contents === 'string')
        text = contents;
    else if (Array.isArray(contents) && contents.every((item) => typeof item === 'string'))
        text = contents.join(' ');
    else if (Array.isArray(contents))
        text = JSON.stringify(contents);
    else if (typeof contents === 'object') {
        try {
            text = JSON.stringify(contents);
        }
        catch {
            text = String(contents);
        }
    }
    else
        text = String(contents);
    return text.length > CONTENT_SAMPLE_LENGTH ? `${text.slice(0, CONTENT_SAMPLE_LENGTH)}…` : text;
};
/** Starts collecting diagnostics for one file. Call before running a preprocessor. */
export const resetRecognitionDiagnostics = (fileName, fileExtension) => {
    diagnostics = { fileName, fileExtension, tried: [] };
};
/** Diagnostics of the last preprocessed file, for logging when nothing matched. */
export const getRecognitionDiagnostics = () => diagnostics;
/** Adds arbitrary context (parsed text, headers, notes) to the current diagnostics. */
export const noteRecognition = (note) => {
    if (!diagnostics)
        return;
    diagnostics = { ...diagnostics, ...note, tried: diagnostics.tried };
};
const recordAttempt = (typedata, type, headers, reason) => {
    diagnostics?.tried.push({
        type,
        specification: typedata.specification,
        reason,
        expectedHeaders: typedata.headers,
        receivedHeaders: headers.slice(0, HEADER_SAMPLE_LENGTH)
    });
};
export const validateAndProcess = async (typedata, headers, contents, filename, extraData, type) => {
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
    if (!result)
        recordAttempt(typedata, label, headers, 'process nie zwrócił wyniku');
    return result;
};
export function readFileContens(file, asText = false) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        // Standard load handler
        reader.onload = () => {
            if (reader.result !== null) {
                resolve(reader.result);
            }
            else {
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
        }
        else {
            reader.readAsArrayBuffer(file);
        }
    });
}
export function generateFileTypes(keys, customModules) {
    const mergedModules = { ...modules, ...customModules };
    let validKeys = [];
    if (Array.isArray(keys)) {
        validKeys = keys;
    }
    else if (typeof keys === 'object' && keys !== null) {
        validKeys = Object.keys(keys);
    }
    else {
        validKeys = Object.keys(mergedModules);
    }
    const extensions = [];
    const preprocessors = {};
    for (const key of validKeys) {
        const module = mergedModules[key];
        if (!module)
            continue;
        for (const ext of module.extensions) {
            extensions.push(ext);
            preprocessors[ext] = module.preprocess;
        }
    }
    const accept = extensions.map((ext) => `.${ext}`).join(',');
    return { extensions, preprocessors, accept };
}
export const processFile = async (file, datafiles, extraData, customModules) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const { preprocessors } = generateFileTypes(datafiles, customModules);
    if (!ext || !preprocessors[ext])
        throw new Error("Plik ma nieprawidłowe rozszerzenie");
    const preprocess = preprocessors[ext];
    resetRecognitionDiagnostics(file.name, ext);
    const result = await preprocess(file, datafiles, extraData);
    if (result) {
        return result;
    }
    else {
        const error = new Error("Specyfikacja nie została rozpoznana");
        error.diagnostics = getRecognitionDiagnostics();
        throw error;
    }
};
