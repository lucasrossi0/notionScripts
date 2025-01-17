#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Get input file from command line argument
const inputFile = process.argv[2];

if (!inputFile) {
  console.error("Please provide a markdown file path");
  console.error("Usage: ./notion2qmd.js input.md");
  process.exit(1);
}

// Ensure file has .md extension
if (path.extname(inputFile) !== ".md") {
  console.error("Error: Input file must have .md extension");
  process.exit(1);
}

// Function to create a valid filename from title
function createValidFilename(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric chars with hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// Function to check if content has YAML front matter
function hasYamlFrontMatter(content) {
  return /^---\s*\n[\s\S]*?\n---/.test(content);
}

// Function to create YAML front matter
function createYamlFrontMatter(title) {
  return `---
title: "${title}"
format: html
---

`;
}

// Function to process and split content
function processContent(content, baseDir, mainFilename) {
  // Split content by ## headers
  const sections = content.split(/(?=## )/);
  let mainContent = sections[0]; // Keep the first section (including # header if exists)
  const links = [];

  // Process each section starting with ##
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const titleMatch = section.match(/^## ([^\n]+)/);

    if (titleMatch) {
      const title = titleMatch[1].trim();
      const filename = createValidFilename(title);
      const newFilePath = path.join(baseDir, `${filename}.qmd`);

      // Create content for the new file
      let sectionContent = section.replace(/^## [^\n]+\n/, "").trim();
      if (!hasYamlFrontMatter(sectionContent)) {
        sectionContent = createYamlFrontMatter(title) + sectionContent;
      }

      // Write the new file
      fs.writeFileSync(newFilePath, sectionContent);
      console.log(`Created: ${newFilePath}`);

      // Add link to the main content
      links.push(`[${title}](./${filename}.qmd)`);
    }
  }

  // If there are links, add them to the main content
  if (links.length > 0) {
    mainContent += "\n\n## Related Pages\n\n" + links.join("\n\n");
  }

  return mainContent;
}

try {
  // Read the input file
  let content = fs.readFileSync(inputFile, "utf8");
  const baseDir = path.dirname(inputFile);
  const mainFilename = path.basename(inputFile, ".md");

  // Process the content
  let processedContent = processContent(content, baseDir, mainFilename);

  // Add YAML front matter to main file if needed
  if (!hasYamlFrontMatter(processedContent)) {
    const mainTitle =
      mainFilename.charAt(0).toUpperCase() + mainFilename.slice(1);
    processedContent = createYamlFrontMatter(mainTitle) + processedContent;
  }

  // Write the main output file
  const outputFile = path.join(baseDir, `${mainFilename}.qmd`);
  fs.writeFileSync(outputFile, processedContent);

  console.log(`Successfully converted main file to: ${outputFile}`);
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
