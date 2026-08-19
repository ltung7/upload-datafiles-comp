import { SvelteComponentTyped } from "svelte";
import type { DataFilesDescriptor, DataFilePreprocessResult } from "./index.d";
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
            image?: Record<string, T> | undefined;
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
    slots(): {
        default: {};
    };
}
export type UploadDatafilesProps<T extends DataFilesDescriptor> = ReturnType<__sveltets_Render<T>['props']>;
export type UploadDatafilesEvents<T extends DataFilesDescriptor> = ReturnType<__sveltets_Render<T>['events']>;
export type UploadDatafilesSlots<T extends DataFilesDescriptor> = ReturnType<__sveltets_Render<T>['slots']>;
export default class UploadDatafiles<T extends DataFilesDescriptor> extends SvelteComponentTyped<UploadDatafilesProps<T>, UploadDatafilesEvents<T>, UploadDatafilesSlots<T>> {
}
export {};
