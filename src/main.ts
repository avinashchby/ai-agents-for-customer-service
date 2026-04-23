import { Actor } from 'apify';
import { CheerioCrawler, log } from 'crawlee';
import * as cheerio from 'cheerio';

// ── Types ─────────────────────────────────────────────────────────────────────

/** Input shape as defined in .actor/input_schema.json */
interface Input {
  maxResults?: number;
  minRating?: number;
  channels?: string[];
  integrations?: string[];
  pricingModel?: 'free' | 'freemium' | 'paid' | 'enterprise' | 'all';
}

/** Normalised output record */
interface AgentRecord {
  name: string;
  vendor: string;
  description: string;
  channels: string[];
  integrations: string[];
  pricing_model: string;
  starting_price_usd: number | null;
  rating: number | null;
  review_count: number | null;
  deflection_rate_claimed: string | null;
  source: string;
  url: string;
  scraped_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract a numeric rating from a raw string such as "4.5 out of 5" or "4.5". */
function parseRating(raw: string): number | null {
  const match = raw.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

/** Extract an integer review count from strings like "(1,234 reviews)". */
function parseReviewCount(raw: string): number | null {
  const cleaned = raw.replace(/,/g, '');
  const match = cleaned.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/** Extract a USD starting price from strings like "$49/mo" or "From $19". */
function parsePrice(raw: string): number | null {
  const match = raw.match(/\$\s*(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Derive channel tags from free-text description.
 * Keeps extraction simple — no ML required.
 */
function extractChannels(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  if (lower.includes('chat') || lower.includes('live chat')) found.push('chat');
  if (lower.includes('email')) found.push('email');
  if (lower.includes('voice') || lower.includes('phone') || lower.includes('call')) found.push('voice');
  if (lower.includes('ticket') || lower.includes('helpdesk') || lower.includes('help desk')) found.push('ticketing');
  return [...new Set(found)];
}

/** Derive integration tags from free-text description. */
function extractIntegrations(text: string): string[] {
  const known = ['Zendesk', 'Intercom', 'Salesforce', 'HubSpot', 'Slack', 'Shopify'];
  return known.filter((name) => text.toLowerCase().includes(name.toLowerCase()));
}

/**
 * Guess a pricing model from description / price string.
 * Returns one of: free | freemium | paid | enterprise | unknown
 */
function guessPricingModel(text: string, price: number | null): string {
  const lower = text.toLowerCase();
  if (lower.includes('free plan') || lower.includes('free forever') || price === 0) return 'free';
  if (lower.includes('freemium') || lower.includes('free trial')) return 'freemium';
  if (lower.includes('enterprise') || lower.includes('contact sales') || lower.includes('custom pricing')) return 'enterprise';
  if (price !== null && price > 0) return 'paid';
  return 'unknown';
}

/** Sleep for `ms` milliseconds — used for polite crawling. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Source scrapers ───────────────────────────────────────────────────────────

/**
 * Scrape G2's AI customer-service category page.
 * URL: https://www.g2.com/categories/ai-customer-service
 * Each product card contains name, star rating, review count, and a snippet.
 */
function scrapeG2(html: string, url: string): AgentRecord[] {
  const $ = cheerio.load(html);
  const results: AgentRecord[] = [];
  const now = new Date().toISOString();

  // G2 product cards live in [data-product-id] or .product-card elements.
  $('[data-product-id], .product-listing').each((_i, el) => {
    const name = $(el).find('[itemprop="name"], .product-name, h3').first().text().trim();
    if (!name) return;

    const vendor = $(el).find('.vendor-name, .company-name').first().text().trim() || name;
    const description = $(el).find('.product-description, p').first().text().trim();
    const ratingRaw = $(el).find('[itemprop="ratingValue"], .rating-value, .stars').first().text().trim();
    const reviewRaw = $(el).find('[itemprop="reviewCount"], .reviews-count').first().text().trim();
    const priceRaw = $(el).find('.price, .pricing').first().text().trim();

    const rating = parseRating(ratingRaw);
    const review_count = parseReviewCount(reviewRaw);
    const starting_price_usd = parsePrice(priceRaw);
    const combined = `${description} ${priceRaw}`;

    results.push({
      name,
      vendor,
      description,
      channels: extractChannels(description),
      integrations: extractIntegrations(description),
      pricing_model: guessPricingModel(combined, starting_price_usd),
      starting_price_usd,
      rating,
      review_count,
      deflection_rate_claimed: null,
      source: 'G2',
      url,
      scraped_at: now,
    });
  });

  return results;
}

/**
 * Scrape Capterra's customer-service software listing page.
 * URL: https://www.capterra.com/customer-service-software/
 */
function scrapeCapterra(html: string, url: string): AgentRecord[] {
  const $ = cheerio.load(html);
  const results: AgentRecord[] = [];
  const now = new Date().toISOString();

  // Capterra listing cards — selector may vary; cover common patterns.
  $('[data-testid="product-card"], .product-card, article.listing').each((_i, el) => {
    const name = $(el).find('h3, [data-testid="product-name"], .product-name').first().text().trim();
    if (!name) return;

    const vendor = $(el).find('.vendor, .company').first().text().trim() || name;
    const description = $(el).find('.description, p').first().text().trim();
    const ratingRaw = $(el).find('.overall-rating, [data-testid="rating"]').first().text().trim();
    const reviewRaw = $(el).find('.review-count, [data-testid="review-count"]').first().text().trim();
    const priceRaw = $(el).find('.price, [data-testid="price"]').first().text().trim();

    const rating = parseRating(ratingRaw);
    const review_count = parseReviewCount(reviewRaw);
    const starting_price_usd = parsePrice(priceRaw);
    const combined = `${description} ${priceRaw}`;

    results.push({
      name,
      vendor,
      description,
      channels: extractChannels(description),
      integrations: extractIntegrations(description),
      pricing_model: guessPricingModel(combined, starting_price_usd),
      starting_price_usd,
      rating,
      review_count,
      deflection_rate_claimed: null,
      source: 'Capterra',
      url,
      scraped_at: now,
    });
  });

  return results;
}

/**
 * Scrape Zendesk Marketplace app listings.
 * URL: https://www.zendesk.com/marketplace/apps/support/
 * Focuses on AI / automation apps and records Zendesk as a guaranteed integration.
 */
function scrapeZendeskMarketplace(html: string, url: string): AgentRecord[] {
  const $ = cheerio.load(html);
  const results: AgentRecord[] = [];
  const now = new Date().toISOString();

  $('[data-app-id], .marketplace-app-card, .app-card').each((_i, el) => {
    const name = $(el).find('.app-name, h3, h2').first().text().trim();
    if (!name) return;

    const vendor = $(el).find('.partner-name, .vendor-name, .app-partner').first().text().trim() || name;
    const description = $(el).find('.app-description, .description, p').first().text().trim();
    const ratingRaw = $(el).find('.rating, .stars').first().text().trim();
    const reviewRaw = $(el).find('.review-count, .reviews').first().text().trim();
    const priceRaw = $(el).find('.price, .app-price').first().text().trim();

    const rating = parseRating(ratingRaw);
    const review_count = parseReviewCount(reviewRaw);
    const starting_price_usd = parsePrice(priceRaw);
    const combined = `${description} ${priceRaw}`;

    // All marketplace apps integrate with Zendesk by definition.
    const integrations = ['Zendesk', ...extractIntegrations(description)];

    results.push({
      name,
      vendor,
      description,
      channels: extractChannels(description),
      integrations: [...new Set(integrations)],
      pricing_model: guessPricingModel(combined, starting_price_usd),
      starting_price_usd,
      rating,
      review_count,
      deflection_rate_claimed: null,
      source: 'Zendesk Marketplace',
      url,
      scraped_at: now,
    });
  });

  return results;
}

// ── Filter helpers ────────────────────────────────────────────────────────────

/** Return true if the record passes all active input filters. */
function passesFilters(record: AgentRecord, input: Required<Input>): boolean {
  // Rating gate — null ratings are kept unless the user explicitly set minRating > 0.
  if (input.minRating > 0 && (record.rating === null || record.rating < input.minRating)) {
    return false;
  }

  // Channels — record must support at least one requested channel.
  if (input.channels.length > 0) {
    const hasChannel = input.channels.some((c) => record.channels.includes(c));
    if (!hasChannel) return false;
  }

  // Integrations — record must expose at least one requested integration.
  if (input.integrations.length > 0) {
    const hasIntegration = input.integrations.some((i) => record.integrations.includes(i));
    if (!hasIntegration) return false;
  }

  // Pricing model — "all" means no filter.
  if (input.pricingModel !== 'all' && record.pricing_model !== input.pricingModel) {
    return false;
  }

  return true;
}

// ── Main ──────────────────────────────────────────────────────────────────────

await Actor.init();

const startedAt = Date.now();

const rawInput = (await Actor.getInput<Input>()) ?? {};

// Apply defaults so the rest of the code can treat these as non-optional.
const input: Required<Input> = {
  maxResults: rawInput.maxResults ?? 30,
  minRating: rawInput.minRating ?? 0,
  channels: rawInput.channels ?? [],
  integrations: rawInput.integrations ?? [],
  pricingModel: rawInput.pricingModel ?? 'all',
};

log.info('Starting AI Customer Service Agent Finder', { input });

const proxyConfiguration = await Actor.createProxyConfiguration();

const allRecords: AgentRecord[] = [];
const sourcesScraped: string[] = [];

const SOURCES: Array<{ url: string; label: string; parse: (html: string, url: string) => AgentRecord[] }> = [
  {
    url: 'https://www.g2.com/categories/ai-customer-service',
    label: 'G2',
    parse: scrapeG2,
  },
  {
    url: 'https://www.capterra.com/customer-service-software/',
    label: 'Capterra',
    parse: scrapeCapterra,
  },
  {
    url: 'https://www.zendesk.com/marketplace/apps/support/',
    label: 'Zendesk Marketplace',
    parse: scrapeZendeskMarketplace,
  },
];

const crawler = new CheerioCrawler({
  proxyConfiguration,
  requestHandlerTimeoutSecs: 60,
  maxRequestRetries: 2,

  async requestHandler({ request, body }) {
    const source = SOURCES.find((s) => s.url === request.url);
    if (!source) {
      log.warning('No parser registered for URL', { url: request.url });
      return;
    }

    log.info(`Scraping ${source.label}`, { url: request.url });

    const html = typeof body === 'string' ? body : body.toString('utf-8');
    const records = source.parse(html, request.url);

    log.info(`Parsed ${records.length} records from ${source.label}`);

    if (records.length > 0 && !sourcesScraped.includes(source.label)) {
      sourcesScraped.push(source.label);
    }

    allRecords.push(...records);

    // Polite 2-second delay before the next request is handled.
    await sleep(2_000);
  },

  failedRequestHandler({ request, error }) {
    log.error(`Request failed: ${request.url}`, { error: (error as Error).message });
  },
});

await crawler.run(SOURCES.map((s) => s.url));

// ── Post-processing ───────────────────────────────────────────────────────────

// Deduplicate by name (case-insensitive) keeping the first occurrence.
const seen = new Set<string>();
const deduped = allRecords.filter((r) => {
  const key = r.name.toLowerCase();
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

// Apply filters.
const filtered = deduped.filter((r) => passesFilters(r, input));

// Sort: highest rating first; null ratings go to the end.
filtered.sort((a, b) => {
  if (a.rating === null && b.rating === null) return 0;
  if (a.rating === null) return 1;
  if (b.rating === null) return -1;
  return b.rating - a.rating;
});

// Cap at maxResults.
const results = filtered.slice(0, input.maxResults);

log.info(`Final result count after filters: ${results.length}`);

// ── Persist outputs ───────────────────────────────────────────────────────────

await Actor.pushData(results);

const runDurationSeconds = Math.round((Date.now() - startedAt) / 1000);

await Actor.setValue('OUTPUT', {
  results,
  metadata: {
    total_results: results.length,
    run_duration_seconds: runDurationSeconds,
    sources_scraped: sourcesScraped,
  },
});

log.info('Done', { total_results: results.length, run_duration_seconds: runDurationSeconds });

await Actor.exit();
