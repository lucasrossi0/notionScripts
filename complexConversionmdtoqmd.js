#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');

// Configure command-line options
program
    .name('md2qmd')
    .description('Convert Markdown (.md) files to Quarto Markdown (.qmd)')
    .argument('<path>', 'file or directory path to process')
    .option('-r, --recursive', 'recursively process directories')
    .version('1.0.0');

program.parse();

const options = program.opts();
const inputPath = program.args[0];

// Function to check if file has YAML header
function hasYamlHeader(content) {
    return content.trimStart().startsWith('---');
}

// Function to create YAML header
function createYamlHeader(filename) {
    return `---
title: "${path.basename(filename, '.md')}"
format: html
---

`;
}

// Function to convert a single file
async function convertFile(inputFile) {
    try {
        // Check if input file exists
        if (!fs.existsSync(inputFile)) {
            console.error(`Error: File '${inputFile}' not found`);
            return;
        }

        // Skip if already a .qmd file
        if (path.extname(inputFile) === '.qmd') {
            console.log(`Skipping '${inputFile}': Already a .qmd file`);
            return;
        }

        // Read the input file
        const content = await fs.promises.readFile(inputFile, 'utf8');
        const outputFile = inputFile.replace(/\.md$/, '.qmd');

        // Add YAML header if it doesn't exist
        let newContent = content;
        if (!hasYamlHeader(content)) {
            newContent = createYamlHeader(inputFile) + content;
        }

        // Write the output file
        await fs.promises.writeFile(outputFile, newContent);
        console.log(`Converted '${inputFile}' to '${outputFile}'`);
    } catch (error) {
        console.error(`Error processing '${inputFile}':`, error.message);
    }
}

// Function to process directory
async function processDirectory(dirPath, recursive) {
    try {
        const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            
            if (entry.isDirectory() && recursive) {
                await processDirectory(fullPath, recursive);
            } else if (entry.isFile() && path.extname(entry.name) === '.md') {
                await convertFile(fullPath);
            }
        }
    } catch (error) {
        console.error(`Error processing directory '${dirPath}':`, error.message);
    }
}

// Main execution
async function main() {
    try {
        const stats = await fs.promises.stat(inputPath);
        
        if (stats.isFile()) {
            await convertFile(inputPath);
        } else if (stats.isDirectory()) {
            await processDirectory(inputPath, options.recursive);
        } else {
            console.error(`Error: '${inputPath}' is not a valid file or directory`);
            process.exit(1);
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();