import { readFileContens, validateAndProcess } from './common';
import { PreprocessFunction, DataFilesType, FileTypeConfig } from './index.d';

let __type__ParserModule: any;

async function load__Type__Parser() {
    if (!__type__ParserModule) {
        // @ts-expect-error skip type check
        __type__ParserModule = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/package/+esm');
    }
    return __type__ParserModule;
}

const preprocess__Type__File: PreprocessFunction = async (file: File, datafiles: DataFilesType<any>, extraData: any) => {
    if (!datafiles.__type__) return false;
    const content = await readFileContens(file, true);
    const parsedContent = content;
    const headers = content;
    
    for (const [type, typedata] of Object.entries(datafiles.__type__)) {
        const result = await validateAndProcess(typedata, headers, parsedContent, file.name, extraData);
        if (result) {
            return { result, type: typedata.specification ?? type, typedata, fileName: file.name };
        }
    }
    return false;
};

export default {
    preprocess: preprocess__Type__File,
    extensions: [ '__type__' ]
} as FileTypeConfig;