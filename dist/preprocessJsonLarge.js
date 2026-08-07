import { validateAndProcess } from './common';
async function* streamJsonl(file) {
    const lineStream = file.stream().pipeThrough(new TextDecoderStream());
    const reader = lineStream.getReader();
    let buffer = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done)
            break;
        buffer += value;
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? ''; // Hold incomplete line chunk for the next iteration
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed)
                yield JSON.parse(trimmed);
        }
    }
    if (buffer.trim()) {
        yield JSON.parse(buffer.trim());
    }
}
const preprocessJsonFile = async (file, datafiles, extraData) => {
    if (!datafiles.jsonl)
        return false;
    const parsedContent = [];
    const headers = Object.keys(parsedContent);
    const jsonlStream = streamJsonl(file);
    for (const [type, typedata] of Object.entries(datafiles.jsonl)) {
        const result = await validateAndProcess(typedata, headers, jsonlStream, file.name, extraData);
        if (result) {
            return { result, type: typedata.specification ?? type, typedata, fileName: file.name };
        }
    }
    return false;
};
export default {
    preprocess: preprocessJsonFile,
    extensions: ['jsonl', 'ndjson']
};
