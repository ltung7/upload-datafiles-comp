import { readFileContens, validateAndProcess } from './common';
let xlsxModule;
const loadXlsx = async () => {
    if (!xlsxModule) {
        // @ts-expect-error skip type check
        xlsxModule = await import(/* @vite-ignore */ 'https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs');
    }
    return xlsxModule;
};
const preprocessDatasheet = async (file, datafiles, extraData) => {
    if (!datafiles.datasheets)
        return false;
    const content = await readFileContens(file);
    const xlsx = await loadXlsx();
    const wb = xlsx.read(content, { raw: true });
    const data = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
    const isTxt = file.name.toLowerCase().endsWith('.txt');
    const headers = (isTxt ? data[0] : data.shift());
    for (const [type, typedata] of Object.entries(datafiles.datasheets)) {
        const result = await validateAndProcess(typedata, headers, data, file.name, extraData);
        if (result) {
            result.descriptor = type;
            return { result, type: typedata.specification ?? type, typedata, fileName: file.name };
        }
    }
    return false;
};
export default {
    preprocess: preprocessDatasheet,
    extensions: ['xlsx', 'csv', 'txt', 'xls', 'xlsm', 'xlsb', 'ods', 'numbers', 'tsv']
};
