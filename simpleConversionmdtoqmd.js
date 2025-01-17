#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get input file from command line argument
const inputFile = process.argv[2];

if (!inputFile) {
    console.error('Please provide a markdown file path');
    console.error('Usage: ./md2qmd.js input.md');
    process.exit(1);
}

// Ensure file has .md extension
if (path.extname(inputFile) !== '.md') {
    console.error('Error: Input file must have .md extension');
    process.exit(1);
}

// Function to check if content has YAML front matter
function hasYamlFrontMatter(content) {
    return /^---\s*\n[\s\S]*?\n---/.test(content);
}

// Function to create YAML front matter
function createYamlFrontMatter(filename) {
    const title = path.basename(filename, '.md');
    return `---
title: "${title}"
format: html
---

`;
}

// Generate output filename
const outputFile = inputFile.replace(/\.md$/, '.qmd');

try {
    // Read the input file
    let content = fs.readFileSync(inputFile, 'utf8');
    
    // Check if YAML front matter exists
    if (!hasYamlFrontMatter(content)) {
        console.log('No YAML front matter found. Adding default configuration...');
        content = createYamlFrontMatter(inputFile) + content;
    } else {
        console.log('Existing YAML front matter found. Preserving configuration...');
    }
    
    // Write to output file
    fs.writeFileSync(outputFile, content);
    
    console.log(`Successfully converted '${inputFile}' to '${outputFile}'`);
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}