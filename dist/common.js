import pdf from './preprocessPdf';
import xml from './preprocessXml';
import datasheets from './preprocessDatasheet';
const modules = { xml, pdf, datasheets };
export const validateAndProcess = async (typedata, headers, contents, filename, extraData) => {
    if (typedata.headerLength && typedata.headerLength !== headers.length) {
        return false;
    }
    if (typedata.checkFilename) {
        const validFilename = typedata.checkFilename(filename);
        if (!validFilename)
            return false;
    }
    let validated = true;
    for (const column of typedata.headers) {
        if (!headers.includes(column))
            validated = false;
    }
    if (validated) {
        return await typedata.process(contents, filename, extraData);
    }
};
export const readFileContens = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                if (!e.target)
                    throw new Error('Invalid file type');
                resolve(e.target.result);
            }
            catch (err) {
                reject(err);
            }
        };
        reader.readAsArrayBuffer(file);
    });
};
export const generateFileTypes = (keys) => {
    const extensions = [];
    const preprocessors = {};
    for (const key of keys) {
        const module = modules[key];
        if (!module)
            continue;
        for (const ext of module.extensions) {
            extensions.push(ext);
            preprocessors[ext] = module.preprocess;
        }
    }
    const accept = extensions.map((ext) => `.${ext}`).join(',');
    return { extensions, preprocessors, accept };
};
