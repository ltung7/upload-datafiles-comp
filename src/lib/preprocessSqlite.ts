import { readFileContens, validateAndProcess } from './common';
import { PreprocessFunction, DataFilesType, FileTypeConfig } from './index.d';

let sqliteParserModule: any;

async function loadSqliteParser() {
    if (!sqliteParserModule) {
        const initSqlJs = (await import('sql.js')).default;
        let wasmPath: string
        if (typeof window !== 'undefined') {
            wasmPath = 'https://cdn.jsdelivr.net/npm/sql.js@1.14.1/dist/';
        } else {
            wasmPath = import.meta.resolve('sql.js/dist/');
        }

        sqliteParserModule = await initSqlJs({
            locateFile: (file) => wasmPath + file
        });
    }
    return sqliteParserModule;
}

const preprocessSqliteFile: PreprocessFunction = async (file: File, datafiles: DataFilesType<any>, extraData: any) => {
    if (!datafiles.sqlite) return false;
    const sql = await loadSqliteParser()
    const arrayBuffer = await readFileContens(file)
    const db = new sql.Database(new Uint8Array(arrayBuffer));
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'")[0].values.flat()

    for (const [type, typedata] of Object.entries(datafiles.sqlite)) {
        const result = await validateAndProcess(typedata, tables, db, file.name, extraData);
        if (result) {
            return { result, type: typedata.specification ?? type, typedata, fileName: file.name };
        }
    }

    db.close();
    return false;
};

export default {
    preprocess: preprocessSqliteFile,
    extensions: ['sqlite', 'db']
} as FileTypeConfig;