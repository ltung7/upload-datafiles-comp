import type { DataFilesDescriptor, DataFilesType, DataFileType, PreprocessFunction } from "./index.d";
export declare const validateAndProcess: (typedata: DataFilesDescriptor, headers: string[], contents: any, filename: string, extraData: any) => Promise<any | undefined>;
export declare function readFileContens(file: File, asText: true): Promise<string>;
export declare function readFileContens(file: File, asText?: false): Promise<ArrayBuffer>;
interface GeneratedFileTypes {
    extensions: string[];
    preprocessors: Record<string, PreprocessFunction>;
    accept: string;
}
export declare function generateFileTypes(keys: (DataFileType | `${DataFileType}`)[]): GeneratedFileTypes;
export declare function generateFileTypes(datafiles: DataFilesType): GeneratedFileTypes;
export declare function generateFileTypes(): GeneratedFileTypes;
export declare const processFile: (file: File, datafiles: DataFilesType, extraData?: any) => Promise<import("./index.d").DataFilePreprocessResult<any, DataFilesDescriptor>>;
export {};
