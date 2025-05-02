require('dotenv').config();
const { ApifyClient } = require('apify-client');

(async () => {
  const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
  });

  const input = {
    actors: ['apify/website-content-crawler'],
    maxActorMemoryBytes: 4096,
    debugActor: 'apify/website-content-crawler',
    debugActorInput: {
      startUrls: [
        // { url: 'https://www.notion.so/pricing' },
        { url: 'https://digiday.com/media/from-crm-giant-to-digital-labor-provider-how-salesforce-aims-to-stand-above-the-hype-with-agentic-ai/#:~:text=Last%20week%2C%20Salesforce%20highlighted%20growth,deals%20in%20the%20fourth%20quarter.' }
      ],
      proxyConfiguration: { useApifyProxy: true }
    }
  };

  try {
    const run = await client.actor('apify/actors-mcp-server').call(input);

    console.log(`\nResults from dataset: https://console.apify.com/storage/datasets/${run.defaultDatasetId}\n`);
    
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items.length) {
      console.log('No content found.');
    }

    items.forEach((item, index) => {
      console.log(`Result ${index + 1}: ${item.url}`);
      console.log('--- Content Preview ---');
      console.log((item.text || '').slice(0, 500) + '...');
      console.log('---\n');
    });

  } catch (err) {
    console.error('Error during scraping:', err.message);
  }
})();
