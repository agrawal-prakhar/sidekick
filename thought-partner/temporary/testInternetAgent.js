require('dotenv').config();
const { ApifyClient } = require('apify-client');

// === CONFIG ===
const SEARCH_QUERY = "growth trajectory of ai agent market in 2025"; // In future, generate this from user input
const NUM_URLS = 2;

const client = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});

(async () => {
  try {
    // === STEP 1: RUN GOOGLE SEARCH SCRAPER ===
    const searchInput = {
      actors: ['apify/google-search-scraper'],
      maxActorMemoryBytes: 4096,
      debugActor: 'apify/google-search-scraper',
      debugActorInput: {
        queries: SEARCH_QUERY,
        maxPagesPerQuery: 1
      }
    };

    console.log("🔍 Running Google Search...");
    const searchRun = await client.actor('apify/actors-mcp-server').call(searchInput);
    const { items: searchResults } = await client.dataset(searchRun.defaultDatasetId).listItems();

    const urls = searchResults.slice(0, NUM_URLS).map(r => r.url);
    if (urls.length === 0) throw new Error("No URLs found from search.");
    console.log("✅ URLs to scrape:", urls);

    // === STEP 2: RUN WEBSITE CONTENT CRAWLER ===
    const crawlInput = {
      actors: ['apify/website-content-crawler'],
      maxActorMemoryBytes: 4096,
      debugActor: 'apify/website-content-crawler',
      debugActorInput: {
        startUrls: urls.map(url => ({ url })),
        proxyConfiguration: { useApifyProxy: true },
        maxPagesPerStartUrl: 2,
      }
    };

    console.log("🕷️ Scraping web content...");
    const crawlRun = await client.actor('apify/actors-mcp-server').call(crawlInput);
    const { items: pageContents } = await client.dataset(crawlRun.defaultDatasetId).listItems();

    // === STEP 3: DISPLAY SCRAPED CONTENT ===
    console.log(`\n📄 Scraped Results from dataset: https://console.apify.com/storage/datasets/${crawlRun.defaultDatasetId}\n`);
    pageContents.forEach((page, idx) => {
      console.log(`Page ${idx + 1}: ${page.url}`);
      console.log((page.text || '').slice(0, 500) + '...');
      console.log('---\n');
    });

  } catch (err) {
    console.error("❌ Error in Internet Agent:", err.message);
  }
})();
