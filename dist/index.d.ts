import type { Database } from 'sql.js';

export enum DataFileType {
    DATASHEETS = 'datasheets',
    PDF = 'pdf',
    XML = 'xml',
    JSON = 'json',
    JSONL = 'jsonl',
    YAML = 'yaml',
    SQLITE = 'sqlite',
    MARKDOWN = 'markdown',
    PHP = 'php',
    IMAGE = 'image',
    EPP = 'epp',
}

type DataForFileType<T extends DataFileType> =
    T extends DataFileType.PDF ? string[] :
    T extends DataFileType.JSON ? Record<string, any> :
    T extends DataFileType.JSONL ? AsyncGenerator :
    T extends DataFileType.MARKDOWN ? Record<string, any> :
    T extends DataFileType.YAML ? Record<string, any> :
    T extends DataFileType.XML ? string :
    T extends DataFileType.SQLITE ? Database :
    T extends DataFileType.DATASHEETS ? Array<Record<string, any>> :
    T extends DataFileType.PHP ? any :
    T extends DataFileType.IMAGE ? ArrayBuffer :
    T extends DataFileType.EPP ? Record<string, string[]> :
    any;

export type DataFilesProcessor<R = any, T extends DataFileType = DataFileType> = (
    data: DataForFileType<T>,
    filename: string,
    extraData?: any
) => Promise<R>;

export interface DataFilesDescriptor {
    headers: string[];
    process: DataFilesProcessor;
    headerLength?: number;
    specification?: string;
    checkFilename?: (name: string) => boolean;
}

export type DataFilesType<
    R = DataFilesDescriptor,
    Keys extends DataFileType | `${DataFileType}` | 'all' = 'all'
> = [Keys] extends ['all']
    ? { [K in DataFileType]?: Record<string, R> }
    : { [K in Extract<DataFileType, `${Keys}`>]: Record<string, R> };

export interface DataFilePreprocessResult<R = any, D = DataFilesDescriptor> {
    result: R;
    type: string;
    typedata: D
}

/** One descriptor that was tried while recognising a file and the reason it did not match. */
export interface RecognitionAttempt {
    type: string;
    specification?: string;
    reason: string;
    expectedHeaders?: string[];
    receivedHeaders?: string[];
}

/** Everything that was learned while a file was (not) recognised, including extracted text. */
export interface RecognitionDiagnostics {
    fileName?: string;
    fileExtension?: string;
    dataType?: string;
    /** Sample of the parsed / OCR-ed content. */
    text?: string;
    headers?: string[];
    tried: RecognitionAttempt[];
    notes?: string[];
}

/** Payload of the `error` event. `diagnostics` is present when a file was parsed but not recognised. */
export interface DataFileError {
    message: string;
    diagnostics?: RecognitionDiagnostics;
}

/** Options passed by the uploader to a preprocessor. */
export interface PreprocessOptions {
    /** When true, run expensive parsing (e.g. OCR) even if it cannot produce a match, so diagnostics contain the text. */
    debug?: boolean;
}

export type PreprocessFunction = (file: File, datafiles: DataFilesType<any>, extraData?: any, options?: PreprocessOptions) => Promise<false | DataFilePreprocessResult>;

export type FileTypeConfig = {
    extensions: string[]
    preprocess: PreprocessFunction
}

export interface CustomModules {
    [key: string]: FileTypeConfig;
}

import { SvelteComponentTyped } from "svelte";
declare class __sveltets_Render<T extends DataFilesDescriptor> {
    props(): {
        datafiles: {
            datasheets?: Record<string, T> | undefined;
            pdf?: Record<string, T> | undefined;
            xml?: Record<string, T> | undefined;
            json?: Record<string, T> | undefined;
            jsonl?: Record<string, T> | undefined;
            yaml?: Record<string, T> | undefined;
            sqlite?: Record<string, T> | undefined;
            markdown?: Record<string, T> | undefined;
            php?: Record<string, T> | undefined;
        };
        extraData?: any;
        uploadCopy?: boolean | string[] | ((_s: string) => boolean) | undefined;
        uploadCopyUrl?: string | undefined;
        containerClasses?: string | undefined;
        multiple?: boolean;
        placeholder?: string;
        accept?: string;
        debug?: boolean;
    };
    events(): {
        uploaded: CustomEvent<File>;
        start: CustomEvent<null>;
        error: CustomEvent<DataFileError>;
        processed: CustomEvent<DataFilePreprocessResult<any, DataFilesDescriptor>>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    slots(): {};
}
export type UploadDatafilesProps<T extends DataFilesDescriptor> = ReturnType<__sveltets_Render<T>['props']>;
export type UploadDatafilesEvents<T extends DataFilesDescriptor> = ReturnType<__sveltets_Render<T>['events']>;
export type UploadDatafilesSlots<T extends DataFilesDescriptor> = ReturnType<__sveltets_Render<T>['slots']>;
export default class UploadDatafiles<T extends DataFilesDescriptor> extends SvelteComponentTyped<UploadDatafilesProps<T>, UploadDatafilesEvents<T>, UploadDatafilesSlots<T>> {
}
export { };
