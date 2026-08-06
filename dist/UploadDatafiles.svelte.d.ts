import { SvelteComponentTyped } from "svelte";
import type { DataFilesDescriptor, DataFilesType, DataFilePreprocessResult } from "./index.d";
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
