import type { DataFilesDescriptor, DataFilesType, DataFileType, PreprocessFunction, FileTypeConfig, RecognitionDiagnostics } from "../index.d";
/** Starts collecting diagnostics for one file. Call before running a preprocessor. */
export declare const resetRecognitionDiagnostics: (fileName: string, fileExtension?: string) => void;
/** Diagnostics of the last preprocessed file, for logging when nothing matched. */
export declare const getRecognitionDiagnostics: () => RecognitionDiagnostics | undefined;
/** Adds arbitrary context (parsed text, headers, notes) to the current diagnostics. */
export declare const noteRecognition: (note: Partial<RecognitionDiagnostics>) => void;
export declare const validateAndProcess: (typedata: DataFilesDescriptor, headers: string[], contents: any, filename: string, extraData: any, type?: string) => Promise<any | undefined>;
export declare function readFileContens(file: File, asText: true): Promise<string>;
export declare function readFileContens(file: File, asText?: false): Promise<ArrayBuffer>;
interface GeneratedFileTypes {
    extensions: string[];
    preprocessors: Record<string, PreprocessFunction>;
    accept: string;
}
export interface CustomModules {
    [key: string]: FileTypeConfig;
}
export declare function generateFileTypes(keys: (DataFileType | `${DataFileType}`)[]): GeneratedFileTypes;
export declare function generateFileTypes(datafiles: DataFilesType): GeneratedFileTypes;
export declare function generateFileTypes(keys: (DataFileType | `${DataFileType}`)[] | DataFilesType, customModules?: CustomModules): GeneratedFileTypes;
export declare function generateFileTypes(): GeneratedFileTypes;
export declare const processFile: (file: File, datafiles: DataFilesType, extraData?: any, customModules?: CustomModules) => Promise<import("../index.d").DataFilePreprocessResult<any, DataFilesDescriptor>>;
export {};
