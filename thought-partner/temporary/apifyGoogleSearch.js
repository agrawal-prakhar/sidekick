require('dotenv').config();
const { ApifyClient } = require('apify-client');

(async () => {
  const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
  });

  const input = {
    actors: ['apify/google-search-scraper'],
    maxActorMemoryBytes: 4096,
    debugActor: 'apify/google-search-scraper',
    debugActorInput: {
      queries: 'Notion AI pricing site',
      maxPagesPerQuery: 1,
    },
  };

  try {
    const run = await client.actor('apify/actors-mcp-server').call(input);
    console.log(`\nResults from dataset: https://console.apify.com/storage/datasets/${run.defaultDatasetId}\n`);

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items.length || !items[0].organicResults) {
      console.log("❌ No organic results found.");
      return;
    }

    const organic = items[0].organicResults.filter(r => r.url && !r.url.includes('google.com'));

    if (!organic.length) {
      console.log("❌ No valid URLs found.");
      return;
    }

    organic.slice(0, 3).forEach((result, i) => {
      console.log(`Result ${i + 1}:`);
      console.log(`Title: ${result.title}`);
      console.log(`URL: ${result.url}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Error running the actor:', error.message);
  }
})();
