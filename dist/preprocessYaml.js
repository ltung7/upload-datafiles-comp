import { readFileContens, validateAndProcess } from './common';
let yamlParserModule;
async function loadYamlParser() {
    if (!yamlParserModule) {
        yamlParserModule = await import('js-yaml');
    }
    return yamlParserModule;
}
const preprocessYamlFile = async (file, datafiles, extraData) => {
    if (!datafiles.yaml)
        return false;
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
    extensions: ['yaml', 'yml']
};
