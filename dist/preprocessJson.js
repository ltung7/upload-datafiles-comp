import { readFileContens, validateAndProcess } from './common';
const preprocessJsonFile = async (file, datafiles, extraData) => {
    if (!datafiles.xml)
        return false;
    const content = await readFileContens(file, true);
    const parsedContent = JSON.parse(content);
    const headers = Object.keys(parsedContent);
    for (const [type, typedata] of Object.entries(datafiles.xml)) {
        const result = await validateAndProcess(typedata, headers, parsedContent, file.name, extraData);
        if (result) {
            return { result, type: typedata.specification ?? type, typedata, fileName: file.name };
        }
    }
    return false;
};
export default {
    preprocess: preprocessJsonFile,
    extensions: ['json', 'geojson']
};
