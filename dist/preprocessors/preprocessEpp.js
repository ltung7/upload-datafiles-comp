import { readFileContens, validateAndProcess } from './common';
/**
 * Recombines raw lines that were split across false newlines inside quoted strings.
 */
function normalizeEppLines(rawLines) {
    const normalized = [];
    let buffer = '';
    for (const line of rawLines) {
        // Concatenate split string chunks, trimming false structural whitespace
        buffer = buffer ? buffer + line.trim() : line;
        // Check if double-quote count is balanced (even)
        const quoteCount = (buffer.match(/"/g) || []).length;
        if (quoteCount % 2 === 0) {
            normalized.push(buffer);
            buffer = '';
        }
    }
    // Flush any leftover buffer content
    if (buffer) {
        normalized.push(buffer);
    }
    return normalized;
}
/**
 * Parses an EPP export into a map of section-type -> array of raw content lines.
 */
function parseEpp(lines) {
    // Clean and merge split lines prior to processing state transitions
    const cleanLines = normalizeEppLines(lines);
    const result = {};
    let currentType = null;
    let headerLine = null;
    let joinWithHeader = false;
    let state = 'skip';
    for (const line of cleanLines) {
        if (line === '[INFO]') {
            state = 'skip';
            continue;
        }
        if (line === '[NAGLOWEK]') {
            state = 'header';
            continue;
        }
        if (line === '[ZAWARTOSC]') {
            state = 'content';
            continue;
        }
        if (state === 'header') {
            const firstComma = line.indexOf(',');
            joinWithHeader = firstComma !== -1;
            const rawType = joinWithHeader ? line.slice(0, firstComma) : line;
            currentType = rawType.replace(/"/g, '');
            headerLine = joinWithHeader ? line : null;
            if (!result[currentType]) {
                result[currentType] = [];
            }
            state = 'waiting';
            continue;
        }
        if (state === 'content' && currentType) {
            const row = joinWithHeader && headerLine !== null
                ? `${headerLine},${line}`
                : line;
            result[currentType].push(row);
        }
    }
    return result;
}
const preprocessEppFile = async (file, datafiles, extraData) => {
    if (!datafiles.epp)
        return false;
    const content = await readFileContens(file, true);
    const parsedContent = parseEpp(content.split('\r\n').filter(line => line.length));
    const headers = Object.keys(parsedContent);
    for (const [type, typedata] of Object.entries(datafiles.epp)) {
        const result = await validateAndProcess(typedata, headers, parsedContent, file.name, extraData);
        if (result) {
            return { result, type: typedata.specification ?? type, typedata, fileName: file.name };
        }
    }
    return false;
};
export default {
    preprocess: preprocessEppFile,
    extensions: ['epp']
};
