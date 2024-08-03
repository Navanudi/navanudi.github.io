const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load environment variables
const https = require('https'); // Required for downloading images
const { URL } = require('url'); // Required to parse URLs

const { API_URL, API_TOKEN } = process.env;
const OUTPUT_DIR = 'src/pages';
const IMAGES_DIR = 'src/images';
const DATA_FILE = 'src/_data/bludit.json'; // Path to the JSON file

async function fetchPages() {
  try {
    const response = await axios.get(`${API_URL}?token=${API_TOKEN}&published=true&static=true`);
    return response.data.data; // Adjust based on API response structure
  } catch (error) {
    console.error('Error fetching pages:', error);
    throw error;
  }
}

async function downloadImage(url, filename) {
  const file = fs.createWriteStream(path.join(IMAGES_DIR, filename));
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', err => {
      fs.unlink(filename, () => reject(err));
    });
  });
}

async function saveData(pages) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  // Prepare data for JSON file
  const dataForJson = [];

  for (const page of pages) {
    let coverImagePath = '';
    if (page.coverImage) {
      const url = new URL(page.coverImage);
      const filename = path.basename(url.pathname);
      await downloadImage(page.coverImage, filename);
      coverImagePath = `images/${filename}`;
    }

    const filePath = path.join(OUTPUT_DIR, `${page.slug}.md`);
    const frontMatter = `---
layout: page
title: "${page.title.replace(/"/g, '\\"')}"  # Escape quotes
slug: ${page.slug}
category: ${page.category}
coverImage: ${coverImagePath ? `"/${coverImagePath}"` : 'null'}
---

${page.content}
`.trim();

    try {
      fs.writeFileSync(filePath, frontMatter);
      console.log(`Saved page: ${filePath}`);
    } catch (error) {
      console.error(`Error saving file ${filePath}:`, error);
    }

    // Add data to the JSON array
    dataForJson.push({
      title: page.title,
      slug: page.slug,
      category: page.category,
      coverImage: coverImagePath ? `/${coverImagePath}` : null,
      content: page.content,
    });
  }

  // Save the JSON file
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataForJson, null, 2));
    console.log(`Saved data to ${DATA_FILE}`);
  } catch (error) {
    console.error(`Error saving JSON file ${DATA_FILE}:`, error);
  }
}

fetchPages()
  .then(saveData)
  .catch(err => console.error('Error:', err));
