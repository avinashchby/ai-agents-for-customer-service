# AI Agents for Customer Service — Finder & Comparator

Finding the right ai agents for customer service is time-consuming — category pages are cluttered, pricing is hidden, and comparing helpdesk integrations across dozens of vendors is a spreadsheet nightmare. This Apify actor scrapes G2, Capterra, and Zendesk Marketplace in a single run and returns clean, structured JSON so CX Directors, VP Customer Success, and Support Ops leads can evaluate tools without leaving their workflow.

---

## What it does

- Scrapes **G2** (`/categories/ai-customer-service`), **Capterra** (`/customer-service-software/`), and the **Zendesk Marketplace** for AI-powered customer service tools
- Deduplicates results across sources and sorts by rating (highest first)
- Filters by support channel (chat, email, voice, ticketing), helpdesk integration (Zendesk, Intercom, Salesforce, and more), minimum star rating, and pricing model
- Extracts deflection rate claims from product descriptions where present
- Returns one structured JSON record per tool plus a run metadata block

---

## Input

| Field | Type | Default | Description |
|---|---|---|---|
| `maxResults` | integer | `30` | Maximum number of tools to return across all sources (1–200) |
| `channels` | array | `[]` | Filter to tools supporting at least one of: `chat`, `email`, `voice`, `ticketing` |
| `integrations` | array | `[]` | Filter to tools integrating with at least one of: `Zendesk`, `Intercom`, `Salesforce`, `HubSpot`, `Slack`, `Shopify` |
| `minRating` | number | `0` | Minimum star rating (0–5). Tools with no rating data are kept when this is `0` |
| `pricingModel` | string | `"all"` | One of: `free`, `freemium`, `paid`, `enterprise`, `all` |

---

## Output

Each item in the dataset follows this shape:

```json
{
  "name": "Freshdesk",
  "vendor": "Freshworks",
  "description": "AI-powered helpdesk with omnichannel ticketing, live-chat bots, and a self-service portal.",
  "channels": ["chat", "email", "ticketing"],
  "integrations": ["Zendesk", "Salesforce", "Slack"],
  "deflection_rate_claimed": "Deflects up to 40% of tickets automatically",
  "pricing_model": "freemium",
  "starting_price_usd": 15,
  "rating": 4.5,
  "review_count": 3201,
  "source": "G2",
  "url": "https://www.g2.com/categories/ai-customer-service",
  "scraped_at": "2024-04-23T18:00:00.000Z"
}
```

The `OUTPUT` key-value store record wraps the results array with run metadata:

```json
{
  "results": [...],
  "metadata": {
    "total_results": 47,
    "run_duration_seconds": 18,
    "sources_scraped": ["G2", "Capterra", "Zendesk Marketplace"]
  }
}
```

---

## Example use cases

1. **Shortlist ai chatbot for customer support tools with a Zendesk integration**
   Set `integrations: ["Zendesk"]` and `channels: ["chat"]`. The actor returns every tool from G2, Capterra, and the Zendesk Marketplace that ticks both boxes, sorted by rating — ready to drop into a vendor comparison doc.

2. **Find freemium ai helpdesk automation options rated 4.0 or above**
   Set `pricingModel: "freemium"` and `minRating: 4`. Useful when evaluating low-cost starting points for a support ops pilot before committing to enterprise ai support ticket automation software.

3. **Benchmark the Zendesk Marketplace ai virtual agent ecosystem**
   Leave `channels` and `integrations` empty and set `integrations: ["Zendesk"]` only. All results are natively Zendesk-compatible — ideal for teams already on Zendesk AI who want to audit third-party augmentation options.

---

## How to run

**Via the Apify API:**

```bash
curl -X POST \
  "https://api.apify.com/v2/acts/avinashchby~ai-agents-for-customer-service/runs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_API_TOKEN>" \
  -d '{
    "maxResults": 50,
    "channels": ["chat", "email"],
    "integrations": ["Zendesk", "Intercom"],
    "minRating": 4.0,
    "pricingModel": "all"
  }'
```

**Via Apify Console:**
Open the actor page, click **Start**, fill in the input form, and hit **Run**. Results appear in the **Dataset** tab as soon as each source finishes scraping.

---

## About

This actor is maintained by [avinashchby](https://github.com/avinashchby). It is built with [Apify SDK v3](https://docs.apify.com/sdk/js/), [Crawlee](https://crawlee.dev/), and Cheerio. If a source changes its page structure and results drop to zero, open an issue on GitHub.
