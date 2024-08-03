const axios = require('axios');
const fs = require('fs');
const cron = require('node-cron');
require('dotenv').config(); // Load environment variables from .env file

const { API_URL, API_TOKEN, GITHUB_API_URL, GITHUB_TOKEN } = process.env;

const LAST_UPDATED_FILE = 'lastUpdated.txt';

async function fetchPages() {
  try {
    const response = await axios.get(`${API_URL}?token=${API_TOKEN}&published=true&static=true`);
    return response.data.data; // Adjust based on API response structure
  } catch (error) {
    console.error('Error fetching pages:', error);
    throw error;
  }
}

async function triggerGitHubActions() {
  try {
    await axios.post(
      GITHUB_API_URL,
      { event_type: 'bludit-update' },
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      }
    );
    console.log('GitHub Actions triggered');
  } catch (error) {
    console.error('Error triggering GitHub Actions:', error);
  }
}

async function checkForUpdates() {
  try {
    const pages = await fetchPages();
    const lastUpdated = fs.existsSync(LAST_UPDATED_FILE) ? fs.readFileSync(LAST_UPDATED_FILE, 'utf-8') : '';

    const latestUpdate = pages.reduce((latest, page) => {
      return new Date(page.date) > new Date(latest) ? page.date : latest;
    }, lastUpdated);

    if (new Date(latestUpdate) > new Date(lastUpdated)) {
      console.log('New content detected. Triggering build...');
      await triggerGitHubActions();
      fs.writeFileSync(LAST_UPDATED_FILE, latestUpdate);
    } else {
      console.log('No new content detected');
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
  }
}

// Schedule the checkForUpdates function to run every 5 minutes
cron.schedule('*/5 * * * *', checkForUpdates);

console.log('Polling script started. Checking for updates every 5 minutes...');
