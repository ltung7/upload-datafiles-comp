import { readFileContens, validateAndProcess } from './common';
import { PreprocessFunction, DataFilesType, FileTypeConfig } from './index.d';

let phpParserModule: any;

async function loadPhpParser() {
    if (!phpParserModule) {
        // @ts-expect-error skip type check
        phpParserModule = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/php-serialize@5.1.3/+esm');
    }
    return phpParserModule;
}

const preprocessPhpFile: PreprocessFunction = async (file: File, datafiles: DataFilesType<any>, extraData: any) => {
    if (!datafiles.php) return false;
    const content = await readFileContens(file, true);
    const { unserialize } = await loadPhpParser();
    const parsedContent = unserialize(content, {}, { strict: false });
    const headers = Object.keys(parsedContent);
    
    for (const [type, typedata] of Object.entries(datafiles.php)) {
        const result = await validateAndProcess(typedata, headers, parsedContent, file.name, extraData);
        if (result) {
            return { result, type: typedata.specification ?? type, typedata, fileName: file.name };
        }
    }
    return false;
};

export default {
    preprocess: preprocessPhpFile,
    extensions: [ 'php' ]
} as FileTypeConfig;