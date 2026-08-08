import { readFileContens, validateAndProcess } from './common';
import { PreprocessFunction, DataFilesType, FileTypeConfig } from './index.d';

type LoadFunction = (input: string, options?: any) => any;
let yamlParserModule: LoadFunction;

async function loadYamlParser() {
    if (!yamlParserModule) {
        const { load } = await import('js-yaml');
        yamlParserModule = load;
    }
    return yamlParserModule;
}

const preprocessYamlFile: PreprocessFunction = async (file: File, datafiles: DataFilesType<any>, extraData: any) => {
    if (!datafiles.yaml) return false;
    const content = await readFileContens(file, true);
    const parseYaml = await loadYamlParser();
    const parsedContent = parseYaml(content);

    for (const [type, typedata] of Object.entries(datafiles.yaml)) {
        const headers = Object.keys(parsedContent);
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