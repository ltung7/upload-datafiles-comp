import type { DataFilesDescriptor, DataFilesProcessor, DataFilesType, DataFileType } from './src/lib/index.d';

const logProcessor: DataFilesDescriptor = {
    headers: [],
    headerLength: 0,
    process: async (data, filename) => {
        return { data, filename };
    }
};

const processSqlite: DataFilesProcessor<any, DataFileType.SQLITE> = async (db, filename) => {
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'")[0].values.flat()
        const data = db.exec(`SELECT * FROM ${tables[0]}`);
        return { data, filename };
}

const logSqliteProcessor: DataFilesDescriptor = {
    headers: [],
    headerLength: 0,
    process: processSqlite
};

const datafiles: DataFilesType<any> = {
    datasheets: {
        logDataFile: logProcessor
    },
    pdf: {
        logPdf: logProcessor,
    },
    json: {
        logJson: logProcessor
    },
    xml: {
        logXml: logProcessor
    },
    yaml: {
        logYaml: logProcessor
    },
    markdown: {
        logMd: logProcessor
    },
    sqlite: {
        logSqlite: logSqliteProcessor
    },
}

export default datafiles;

// fileReaderPolyfill.ts
export class NodeFileReader {
    result: ArrayBuffer | string | null = null
    onload: ((ev: { target: NodeFileReader }) => void) | null = null
    onerror: ((ev: { target: NodeFileReader }) => void) | null = null

    readAsArrayBuffer(file: File) {
        file
            .arrayBuffer()
            .then((buf) => {
                this.result = buf
                this.onload?.({ target: this })
            })
            .catch(() => this.onerror?.({ target: this }))
    }

    readAsText(file: File) {
        file
            .text()
            .then((text) => {
                this.result = text
                this.onload?.({ target: this })
            })
            .catch(() => this.onerror?.({ target: this }))
    }
}