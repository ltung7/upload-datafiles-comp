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
}

type DataForFileType<T extends DataFileType> =
    T extends DataFileType.PDF ? string[] :
    T extends DataFileType.JSON ? Record<string, any> :
    T extends DataFileType.JSONL ? AsyncGenerator :
    T extends DataFileType.MARKDOWN ? Record<string, any> :
    T extends DataFileType.YAML ? Record<string, any> :
    T extends DataFileType.XML ? any :
    T extends DataFileType.SQLITE ? Database :
    T extends DataFileType.DATASHEETS ? Array<Record<string, any>> :
    T extends DataFileType.PHP ? any :
        T extends DataFileType.IMAGE ? any :
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

export type PreprocessFunction = (file: File, datafiles: DataFilesType<any>, extraData?: any) => Promise<false | DataFilePreprocessResult>;

export type FileTypeConfig = {
    extensions: string[]
    preprocess: PreprocessFunction
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
    };
    events(): {
        uploaded: CustomEvent<File>;
        start: CustomEvent<null>;
        error: CustomEvent<string>;
        processed: CustomEvent<DataFilePreprocessResult<any, DataFilesDescriptor>>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    slots(): { };
}
export type UploadDatafilesProps<T extends DataFilesDescriptor> = ReturnType<__sveltets_Render<T>['props']>;
export type UploadDatafilesEvents<T extends DataFilesDescriptor> = ReturnType<__sveltets_Render<T>['events']>;
export type UploadDatafilesSlots<T extends DataFilesDescriptor> = ReturnType<__sveltets_Render<T>['slots']>;
export default class UploadDatafiles<T extends DataFilesDescriptor> extends SvelteComponentTyped<UploadDatafilesProps<T>, UploadDatafilesEvents<T>, UploadDatafilesSlots<T>> {
}
export {};
