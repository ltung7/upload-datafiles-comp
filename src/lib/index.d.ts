export type DataFilesProcessor<R = any> = (data: any[], filename: string, extraData?: any) => Promise<R>; 

export interface DataFilesDescriptor {
    headers: string[];
    process: DataFilesProcessor;
    headerLength?: number;
    specification?: string;
    checkFilename?: (name: string) => boolean;
}

export interface DataFilesType<R = DataFilesDescriptor> {
    datasheets?: Record<string,R>;
    pdf?: Record<string,R>;
    xml?: Record<string,R>;
}

export interface DataFilePreprocessResult<R = any, D = DataFilesDescriptor> {
    result: R;
    type: string;
    typedata: D
}

export type PreprocessFunction = (file: File, datafiles: DataFilesType<any>, extraData: any) => Promise<false | DataFilePreprocessResult>;
 
export type FileTypeConfig = {
    extensions: string[]
    preprocess: PreprocessFunction
}

import { SvelteComponentTyped } from "svelte";
declare class __sveltets_Render<T extends DataFilesDescriptor> {
    props(): {
        datafiles: DataFilesType<T>;
        extraData?: any;
        uploadCopy?: boolean | string[] | ((_s: string) => boolean) | undefined;
        uploadCopyUrl?: string | undefined;
        containerClasses?: string | undefined;
        multiple?: boolean;
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
    slots(): {};
}
export type UploadDatafilesProps<T extends DataFilesDescriptor> = ReturnType<__sveltets_Render<T>['props']>;
export type UploadDatafilesEvents<T extends DataFilesDescriptor> = ReturnType<__sveltets_Render<T>['events']>;
export type UploadDatafilesSlots<T extends DataFilesDescriptor> = ReturnType<__sveltets_Render<T>['slots']>;
export default class UploadDatafiles<T extends DataFilesDescriptor> extends SvelteComponentTyped<UploadDatafilesProps<T>, UploadDatafilesEvents<T>, UploadDatafilesSlots<T>> {
}
export {};