import { readFileContens, validateAndProcess } from './common';
let sqliteParserModule;
async function loadSqliteParser() {
    if (!sqliteParserModule) {
        const initSqlJs = (await import('sql.js')).default;
        let wasmPath;
        if (typeof window !== 'undefined') {
            wasmPath = 'https://cdn.jsdelivr.net/npm/sql.js@1.14.1/dist/';
        }
        else {
            wasmPath = import.meta.resolve('sql.js/dist/');
        }
        sqliteParserModule = await initSqlJs({
            locateFile: (file) => wasmPath + file
        });
    }
    return sqliteParserModule;
}
const preprocessSqliteFile = async (file, datafiles, extraData) => {
    if (!datafiles.sqlite)
        return false;
    const sql = await loadSqliteParser();
    const arrayBuffer = await readFileContens(file);
    const db = new sql.Database(new Uint8Array(arrayBuffer));
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'")[0].values.flat();
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
};
