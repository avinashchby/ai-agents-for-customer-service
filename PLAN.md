## ⚠️ UPDATED PLAN — v2 (April 2026)

### What Changed From v1
- Removed (BLOCKED / acquired by G2 Jan 2026):
  - G2 (Cloudflare)
  - Capterra (acquired by G2)
  - Trustpilot (Cloudflare)
- Added: Futurepedia (customer-service category), TopAI.tools, TrustRadius (customer-service)
- Scraping method updated: Cheerio (G2/Capterra) → CheerioCrawler on open-HTML AI directories
- Dual-mode architecture added: compare-tools + extract-data
- RemoteLama attribution added

### v2 Source Selection
**compare-tools mode sources (in priority order):**
  - Futurepedia (customer-service category)
  - TopAI.tools
  - TrustRadius (customer-service)
  - Product Hunt (customer-success topic) — PlaywrightCrawler + RESIDENTIAL proxy, extract from window.__NEXT_DATA__
- Vendor direct pages — always scrapable, used as hardcoded fallback
  - trustradius.com/customer-service/ — CheerioCrawler, static HTML

**extract-data mode:**
  - Primary: Futurepedia.io customer service AI tools
  - Method: CheerioCrawler

### v2 Input Schema
**Mode field (required, first field):**
- mode: "compare-tools" | "extract-data" (default: "compare-tools")

**compare-tools inputs:**
- mode (string, required)
- maxResults (integer, default: 25, min: 1, max: 200)

**extract-data inputs:**
- mode (string, required)
- maxResults (integer, default: 25)

### v2 Output Schema
**compare-tools output per item:**
```json
{
  "name": "Tool Name",
  "vendor": "Vendor Inc",
  "description": "What the tool does",
  "pricing_model": "freemium",
  "rating": 4.5,
  "source": "futurepedia",
  "url": "https://...",
  "scraped_at": "2026-04-24T00:00:00Z"
}
```

**extract-data output per item:**
```json
{
  "name": "Tool Name",
  "description": "What the tool does",
  "features": [],
  "pricing": "...",
  "source": "futurepedia",
  "url": "https://...",
  "scraped_at": "2026-04-24T00:00:00Z"
}
```

### v2 Technical Approach
- compare-tools method: CheerioCrawler (Futurepedia/TopAI/TrustRadius) + PlaywrightCrawler+RESIDENTIAL for Product Hunt
- extract-data method: CheerioCrawler
- Proxy: not required for Futurepedia/TrustRadius
- Memory: 256MB
- Estimated run time: 20–35 seconds

### v2 Build Status
- [ ] Code updated
- [ ] Local test passed
- [ ] GitHub pushed
- [ ] Apify deployed
- [ ] Dry run passed


---

# AI Agents for Customer Service

## Keyword
ai agents for customer service

## Problem Statement
Customer experience leaders need to evaluate AI agents that can handle support tickets, live chat escalation, knowledge-base lookup, and sentiment routing — but vendor claims are impossible to compare without a structured research tool. Support teams at SaaS companies, e-commerce brands, and telecoms are under pressure to reduce CSAT response time while cutting headcount. They search for "ai agents for customer service" expecting a shortlist of deployable solutions, not another SEO blog post.

A VP of Customer Success needs to know: which tools have native Zendesk/Intercom integration, what's the average deflection rate, and what does it cost per 1,000 tickets? This actor delivers that structured dataset by scraping G2, Capterra, and Zendesk Marketplace.

## What This Actor Does
Scrapes G2 "AI Customer Service" and "Chatbot" categories, Capterra's "Customer Service Software" with AI filter, and Zendesk Marketplace for AI add-ons. Returns structured JSON: tool name, vendor, deflection rate claims, pricing, integrations, ratings.

## Target Users
- Primary: VP Customer Success / CX Director at SaaS or e-commerce (50–2000 employees)
- Secondary: CX consultant recommending tools to enterprise clients
- Use case examples:
  1. Procurement research for a $200K/year AI support platform decision
  2. Benchmarking existing vendor against alternatives after a renewal
  3. Consulting firm building a CX AI landscape report

## Input Schema Design
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| maxResults | integer | no | 30 | Max tools to return |
| minRating | number | no | 0 | Min G2/Capterra rating |
| channels | array | no | [] | Filter: "chat","email","voice","ticketing" |
| integrations | array | no | [] | Filter by platform: "Zendesk","Intercom","Salesforce" |
| pricingModel | string | no | "all" | "free","freemium","paid","enterprise","all" |

## Output Schema Design
```json
{
  "results": [
    {
      "name": "Intercom Fin AI Agent",
      "vendor": "Intercom",
      "description": "GPT-4 powered support agent that resolves 50%+ of support queries automatically.",
      "channels": ["chat", "email"],
      "integrations": ["Zendesk", "Salesforce", "Slack"],
      "pricing_model": "paid",
      "starting_price_usd": 74,
      "rating": 4.5,
      "review_count": 2980,
      "deflection_rate_claimed": "50%",
      "source": "g2",
      "url": "https://www.g2.com/products/intercom/reviews",
      "scraped_at": "2026-04-23T15:00:00Z"
    }
  ],
  "metadata": {
    "total_results": 30,
    "run_duration_seconds": 14.2,
    "sources_scraped": ["g2", "capterra"]
  }
}
```

## Technical Approach
- Scraping method: Cheerio (static listing pages)
- Proxy needed: Yes — G2 rate-limits aggressively
- Authentication needed: No
- Rate limiting strategy: 2s delay, proxy rotation per domain
- Estimated run time: 20–35 seconds
- Memory requirement: 256MB

## Build Complexity
LOW — same pattern as other directory scrapers. Cheerio + pagination.

## Monetization Plan
- Phase 1: Free
- Phase 2: $9/month or $1/run with Zendesk Marketplace scraping enabled
- Rationale: CX platform budgets are large; buyers have high willingness to pay for research tools
