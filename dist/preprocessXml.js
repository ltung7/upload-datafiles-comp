import { readFileContens, validateAndProcess } from './common';
let xmlParserModule;
async function loadXmlParser() {
    if (!xmlParserModule) {
        const { XMLParser } = await import('fast-xml-parser');
        xmlParserModule = XMLParser;
    }
    return xmlParserModule;
}
// Walk down the parsed object, taking the first key at each level,
// until `depth` levels have been collected.
// <Doc><Nest><SuperNest> with depth=3 -> ['Doc', 'Nest', 'SuperNest']
const getXmlHeaders = (parsed, depth) => {
    const headers = [];
    let current = parsed;
    for (let i = 0; i < depth; i++) {
        if (current === null || typeof current !== 'object')
            break;
        const keys = Object.keys(current).filter((k) => k !== '?xml' && !k.startsWith('@_') && k !== '#text');
        if (keys.length === 0)
            break;
        const key = keys[0];
        headers.push(key);
        current = current[key];
        if (Array.isArray(current))
            current = current[0]; // repeated elements
    }
    return headers;
};
const preprocessXmlFile = async (file, datafiles, extraData) => {
    if (!datafiles.xml)
        return false;
    const content = await readFileContens(file, true);
    const XMLParser = await loadXmlParser();
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        parseTagValue: false // keep ALL tag text as strings
    });
    let parsedContent;
    try {
        parsedContent = parser.parse(content);
    }
    catch (err) {
        throw new Error(`Invalid XML in ${file.name}: ${err.message}`);
    }
    for (const [type, typedata] of Object.entries(datafiles.xml)) {
        const headers = getXmlHeaders(parsedContent, typedata.headerLength);
        const result = await validateAndProcess(typedata, headers, parsedContent, file.name, extraData);
        if (result) {
            return { result, type: typedata.specification ?? type, typedata, fileName: file.name };
        }
    }
    return false;
};
export default {
    preprocess: preprocessXmlFile,
    extensions: ['xml', 'xliff', 'xaml', 'rss', 'atom', 'plist']
};
