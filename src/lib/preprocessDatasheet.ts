import { readFileContens, validateAndProcess } from './common';
import { PreprocessFunction, DataFilesType, FileTypeConfig } from './index.d';

let xlsxModule: any;

const loadXlsx = async (): Promise<any> => {
    if (!xlsxModule) {
        xlsxModule = await import('xlsx');
    }
    return xlsxModule;
};

const preprocessDatasheet: PreprocessFunction = async (file: File, datafiles: DataFilesType<any>, extraData: any) => {
    if (!datafiles.datasheets) return false;
    const content = await readFileContens(file);
    const xlsx = await loadXlsx();
    const wb = xlsx.read(content, { raw: true });
    const data = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
    const isTxt = file.name.toLowerCase().endsWith('.txt');
    const headers = (isTxt ? data[0] : data.shift()) as string[];

    for (const [type, typedata] of Object.entries(datafiles.datasheets)) {
        const result = await validateAndProcess(typedata, headers, data, file.name, extraData);
        if (result) {
            return { result, type: typedata.specification ?? type, typedata, fileName: file.name };
        }
    }
    return false;
}

export default {
    preprocess: preprocessDatasheet,
    extensions: [ 'xlsx', 'csv', 'txt', 'xls', 'xlsm', 'xlsb', 'ods', 'numbers', 'tsv' ]
} as FileTypeConfig;
