#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);

// Colorized logging functions
const info = (message: string) => console.log(`\x1b[34m${message}\x1b[0m`);
const success = (message: string) => console.log(`\x1b[32m${message}\x1b[0m`);
const error = (message: string) => console.error(`\x1b[31m${message}\x1b[0m`);
const muted = (message: string) => console.log(`\x1b[90m${message}\x1b[0m`);

/**
 * Check if a file exists
 */
function fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
}

if (args.length < 1) {
    error('Usage: node makePreprocessor.ts <type> [Type]');
    error('  <type>: the type in lowercase (e.g., json)');
    error('  [Type]: optional, the type with first letter uppercase (e.g., Json). If not provided, it is derived from <type> by capitalizing the first letter.');
    process.exit(1);
}

const firstArg = args[0];
const secondArg = args.length >= 2 ? args[1] : firstArg;

const capitalize = (s: string): string => {
    if (s.length === 0) return s;
    return s[0].toUpperCase() + s.slice(1);
};

const type = firstArg;
const Type = capitalize(secondArg);

// ============================================================
// Step 1: Generate preprocessor file FIRST
// ============================================================
info(`Processing type: ${type}, Type: ${Type}`);
info(`Checking for existing preprocessor file: preprocess${Type}.ts`);

const preprocessorPath = path.join(__dirname, 'src', 'lib', `preprocess${Type}.ts`);

if (fileExists(preprocessorPath)) {
    muted(`Preprocessor file already exists at: ${preprocessorPath}, skipping...`);
} else {
    // Read template, replace placeholders, and write the new preprocessor file
    const templatePath = path.join(__dirname, 'src', 'template', 'preprocessTemplate.ts');
    info(`Reading template from: ${templatePath}`);
    let templateContent = fs.readFileSync(templatePath, 'utf8');

    info('Replacing __type__ placeholders...');
    templateContent = templateContent.replace(/__type__/g, type);

    info('Replacing __Type__ placeholders...');
    templateContent = templateContent.replace(/__Type__/g, Type);

    const outputFileName = `preprocess${Type}.ts`;
    const outputDir = path.join(__dirname, 'src', 'lib');
    const outputPath = path.join(outputDir, outputFileName);

    info(`Writing output to: ${outputPath}`);
    fs.writeFileSync(outputPath, templateContent, 'utf8');
    success(`Successfully created ${outputPath}`);
}

// ============================================================
// Step 2: Modify index.d.ts
// ============================================================
info(`Modifying index.d.ts to add TYPE entry: ${type.toUpperCase()} = '${type.toLowerCase()}'`);

const indexPath = path.join(__dirname, 'src', 'lib', 'index.d.ts');

if (fileExists(indexPath)) {
    // Read the existing file
    const fileContent = fs.readFileSync(indexPath, 'utf8');

    // Define enum name and value from the type parameter
    const enumName = type.toUpperCase();
    const enumValue = type.toLowerCase();

    // Check if the enum entry already exists to avoid duplicates
    const enumEntry = `    ${enumName} = '${enumValue}',`;
    const alreadyExists = fileContent.includes(enumEntry);

    if (alreadyExists) {
        muted(`Enum ${enumName} already exists in index.d.ts, skipping...`);
    } else {
        // Find the DataFileType enum block and add the new entry
        // Pattern: match from "export enum DataFileType {" to the closing "}"
        const enumRegex = /(export enum DataFileType \{[\s\S]*?)(\})/;
        const enumMatch = fileContent.match(enumRegex);

        if (enumMatch) {
            const beforeBrace = enumMatch[1];
            const closingBrace = enumMatch[2];

            // Append new enum entry with comma if the last entry doesn't have one
            const newEnumEntry = `    ${enumName} = '${enumValue}',`;
            const updatedEnum = beforeBrace.replace(/\}$/, '') + newEnumEntry + '\n' + closingBrace;
            const updatedContent = fileContent.replace(enumRegex, updatedEnum);
            success(`Added ${enumName} to DataFileType enum`);

            // Check if DataForFileType type exists and add TYPE check
            const typeRegex = /(type DataForFileType<T extends DataFileType> =[\s\S]*?)(any;)/;
            const typeMatch = updatedContent.match(typeRegex);

            if (typeMatch) {
                const beforeAny = typeMatch[1];
                const anyEnding = typeMatch[2];

                // Add TYPE check before the final `any:` fallback
                const typeCheck = `    T extends DataFileType.${enumName} ? any :\n`;
                const finalContent = beforeAny + typeCheck + '    ' + anyEnding;
                const writeContent = updatedContent.replace(typeRegex, finalContent);
                success(`Added ${enumName} check to DataForFileType type`);

                // Write the modified content back to index.d.ts
                fs.writeFileSync(indexPath, writeContent, 'utf8');
                success(`Successfully updated ${indexPath}`);
            } else {
                error('Could not find DataForFileType type in index.d.ts');
            }
        } else {
            error('Could not find DataFileType enum in index.d.ts');
        }
    }
} else {
    info(`Target file does not exist: ${indexPath}`);
}

// ============================================================
// Step 3: Modify common.ts to add type preprocessor
// ============================================================
info(`Modifying common.ts to add '${type}' preprocessor module`);

const commonPath = path.join(__dirname, 'src', 'lib', 'common.ts');

if (fileExists(commonPath)) {
    let commonContent = fs.readFileSync(commonPath, 'utf8');

    // Step 3a: Add import for preprocessType (dynamic based on Type argument)
    const preprocessImport = `import ${type} from './preprocess${Type}';`;

    // Check if the import already exists
    if (!commonContent.includes(preprocessImport)) {
        // Find the last import line and insert after it
        const lines = commonContent.split('\n');
        let insertIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith('import ')) {
                insertIndex = i + 1;
            } else if (lines[i].trim() === '') {
                // Skip empty lines after imports
                continue;
            } else {
                break;
            }
        }
        console.log({ insertIndex })
        if (insertIndex >= 0) {
            lines.splice(insertIndex, 0, preprocessImport);
            info(`Added import: ${preprocessImport}`);
        }
        commonContent = lines.join('\n');
        fs.writeFileSync(commonPath, commonContent, 'utf8');
    }

    // Step 3b: Add 'type' to modules object (dynamic based on firstArg)
    const modulesRegex = /(const modules = \{[\s\S]*?\})/;
    const modulesMatch = commonContent.match(modulesRegex);

    if (modulesMatch) {
        const modulesBlock = modulesMatch[1];
        // Check if the type key already exists to avoid duplicates
        const keyExists = modulesBlock.includes(type);

        if (!keyExists) {
            // Add the new key-value pair to modules object
            const updatedModulesBlock = modulesBlock.replace(/ \}$/, `, ${type} }`);
            const updatedCommonContent = commonContent.replace(modulesRegex, updatedModulesBlock);
            success(`Added '${type}' property to modules object`);

            // Write the modified content back to common.ts
            fs.writeFileSync(commonPath, updatedCommonContent, 'utf8');
            success(`Successfully updated ${commonPath}`);
        } else {
            muted(`'${type}' property already exists in modules, skipping...`);
        }
    } else {
        error('Could not find modules object in common.ts');
    }
} else {
    muted(`Target file does not exist: ${commonPath}`);
}

// ============================================================
// Step 4: Modify testParserDatafiles.ts to add type datafiles entry
// ============================================================
info(`Modifying testParserDatafiles.ts to add '${type}' datafiles entry`);

const datafilesTestPath = path.join(__dirname, 'testParserDatafiles.ts');

if (fileExists(datafilesTestPath)) {
    const testContent = fs.readFileSync(datafilesTestPath, 'utf8');

    // The entry key in datafiles is the type in lowercase (e.g., 'json')
    const datafileKey = type.toLowerCase();
    // The processor key inside the block (e.g., 'logJson')
    const processorKey = `log${Type}`;

    // Check if the type entry already exists to avoid duplicates
    if (testContent.includes(`${datafileKey}: {`)) {
        muted(`'${datafileKey}' entry already exists in testParserDatafiles.ts datafiles, skipping...`);
    } else if (testContent.includes(`${processorKey}:`)) {
        muted(`Processor key '${processorKey}' already exists in testParserDatafiles.ts, skipping...`);
    } else {
        // Insert the new entry before the closing brace of the datafiles object
        const closingPattern = /\n\s*}\s*\n\s*export\s+default\s+datafiles\s*;/;
        const match = testContent.match(closingPattern);

        if (match) {
            const newEntry = `\n    ${datafileKey}: {\n        ${processorKey}: logProcessor\n    },\n}\n\nexport default datafiles;`;
            const updatedContent = testContent.replace(closingPattern, newEntry);

            // Write the modified content back to testParserDatafiles.ts
            fs.writeFileSync(datafilesTestPath, updatedContent, 'utf8');
            success(`Added '${datafileKey}' entry with ${processorKey} to datafiles in testParserDatafiles.ts`);
            success(`Successfully updated ${datafilesTestPath}`);
        } else {
            error('Could not find datafiles closing brace pattern in testParserDatafiles.ts');
        }
    }
} else {
    info(`Target file does not exist: ${datafilesTestPath}`);
}