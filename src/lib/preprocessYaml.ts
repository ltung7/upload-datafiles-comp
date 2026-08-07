import { readFileContens, validateAndProcess } from './common';
import { PreprocessFunction, DataFilesType, FileTypeConfig } from './index.d';

let yamlParserModule: any;

async function loadYamlParser() {
    if (!yamlParserModule) {
        // @ts-expect-error skip type check
        yamlParserModule = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/+esm');
    }
    return yamlParserModule;
}

const preprocessYamlFile: PreprocessFunction = async (file: File, datafiles: DataFilesType<any>, extraData: any) => {
    if (!datafiles.yaml) return false;
    const content = await readFileContens(file, true);
    const yaml = await loadYamlParser();
    const parsedContent = yaml.load(content);

    for (const [type, typedata] of Object.entries(datafiles.yaml)) {
        const headers = Object.keys(yaml);
        const result = await validateAndProcess(typedata, headers, parsedContent, file.name, extraData);
        if (result) {
            return { result, type: typedata.specification ?? type, typedata, fileName: file.name };
        }
    }
    return false;
};

export default {
    preprocess: preprocessYamlFile,
    extensions: [ 'yaml', 'yml' ]
} as FileTypeConfig;