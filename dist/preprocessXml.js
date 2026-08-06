import { validateAndProcess } from './common';
let xmlParserModule;
async function loadXmlParser() {
    if (!xmlParserModule) {
        // @ts-expect-error skip type check
        xmlParserModule = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/fast-xml-parser@4.5.3/+esm');
    }
    return xmlParserModule;
}
// File -> raw text (XML equivalent of readDatasheet)
const readXmlFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
};
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
    const content = await readXmlFile(file);
    const { XMLParser, XMLValidator } = await loadXmlParser();
    const isValid = XMLValidator.validate(content);
    if (isValid !== true) {
        console.error('Invalid XML in', file.name, isValid.err);
        return false;
    }
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        parseTagValue: false // keep ALL tag text as strings
    });
    const parsedContent = parser.parse(content);
    for (const [type, typedata] of Object.entries(datafiles.xml)) {
        const headers = getXmlHeaders(parsedContent, typedata.headerLength);
        const result = await validateAndProcess(typedata, headers, parsedContent, file.name, extraData);
        if (result) {
            result.descriptor = type;
            return { result, type: typedata.specification ?? type, typedata, fileName: file.name };
        }
    }
    return false;
};
export default {
    preprocess: preprocessXmlFile,
    extensions: ['xml', 'xliff', 'xaml', 'rss', 'atom', 'plist']
};
