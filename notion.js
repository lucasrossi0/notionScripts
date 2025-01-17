require('dotenv').config();
const { Client } = require('@notionhq/client');
const { NotionToMarkdown } = require('notion-to-md');
const fs = require('fs');

const notion = new Client({ auth: process.env.NOTION_TOKEN});
const n2m = new NotionToMarkdown({ notionClient: notion });

function getNextFileNumber() {
    let fileNumber = 0;
    while (fs.existsSync(`file${fileNumber}.md`)) {
      fileNumber++;
    }
    return fileNumber;
}

async function fetchNotionPageAsMarkdown(pageId) {
  try {
    const mdblocks = await n2m.pageToMarkdown(pageId);
    const mdString = n2m.toMarkdownString(mdblocks);
    const fileToWrite = "file" + getNextFileNumber() + ".md";

    fs.writeFileSync(fileToWrite, mdString.parent, 'utf8');
    console.log('Page exported to ' + fileToWrite);
  } catch (error) {
    console.log('Error fetching Notion page:', error);
  }
}

var argsIdPage = process.argv.splice(2);
fetchNotionPageAsMarkdown(argsIdPage);
