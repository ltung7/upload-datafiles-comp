import type { DataFilesDescriptor, DataFilesType, PreprocessFunction } from "./index.d";
export declare const validateAndProcess: (typedata: DataFilesDescriptor, headers: string[], contents: any[], filename: string, extraData: any) => Promise<any | undefined>;
export declare const readFileContens: (file: File) => Promise<ArrayBuffer>;
export declare const generateFileTypes: (keys: (keyof DataFilesType)[]) => {
    extensions: string[];
    preprocessors: Record<string, PreprocessFunction>;
    accept: string;
};
