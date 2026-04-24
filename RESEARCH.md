## ⚠️ RESEARCH UPDATE — v2 (April 2026)

### Source Status Update
**Removed (blocked or acquired):**
  - G2 (Cloudflare)
  - Capterra (acquired by G2)
  - Trustpilot (Cloudflare)

**G2 Ecosystem Note:** G2 acquired Capterra, Software Advice, and GetApp in January 2026.
All four properties now share the same Cloudflare/anti-bot infrastructure. None are viable
as primary scraping sources.

### Replacement Sources Selected
  - Futurepedia (customer-service category) — confirmed working (static HTML, no Cloudflare)
  - TopAI.tools — confirmed working (static HTML, no Cloudflare)
  - TrustRadius (customer-service) — confirmed working (static HTML, no Cloudflare)

These were selected based on RESEARCH_PHASE0.md live research (April 2026):
- Futurepedia, TopAI.tools, Toolify.ai: AI-specific directories, CheerioCrawler-ready, no Cloudflare
- TrustRadius: B2B software reviews, static HTML, accepts datacenter IPs
- SourceForge: 40,000+ software products, open HTML

### Product Hunt Extraction Note
If this actor uses Product Hunt as a source: data MUST be extracted from window.__NEXT_DATA__
(Apollo GraphQL cache embedded in Next.js SSR output), NOT CSS selectors. CSS selectors on
Product Hunt break on every frontend deploy because React CSS modules generate random class names.
Residential proxy is required — datacenter IPs are blocked by Cloudflare.
URL pattern: https://www.producthunt.com/topics/customer-success

### Dual-Mode Rationale
compare-tools mode: Serves users evaluating which AI tools exist in this category.
Feeds the RemoteLama comparison table on remotelama.com/ai-agents/ai-agents-for-customer-service.

extract-data mode: Serves developers building AI agents who need structured data
as input to their pipelines.


---

# Market & Competitor Research: AI Agents for Customer Service

## Search Demand Analysis
- Primary keyword: ai agents for customer service
- Related keywords:
  - best ai customer service tools
  - ai chatbot for customer support
  - ai helpdesk automation
  - ai support ticket automation
  - customer service ai software
  - ai virtual agent customer service
  - chatgpt for customer support
- User intent: Commercial — vendor evaluation
- Who is searching: CX Directors, VP Customer Success, Support Ops at SaaS/e-commerce

## Existing Solutions (Competitors)

### Direct competitors on Apify Store
| Actor Name | Developer | Users | Rating | Price | Gap/Weakness |
|------------|-----------|-------|--------|-------|--------------|
| G2 Scraper | apify | 800+ | 4.2 | $15/mo | Generic, no CX filter |
| Capterra Scraper | various | 200+ | 3.8 | Free | No structured comparison output |

### Broader market alternatives
| Tool | Price | Weakness vs our actor |
|------|-------|----------------------|
| G2 manual research | Free | No API, no bulk compare |
| Zendesk Marketplace browsing | Free | Single platform, no cross-platform data |

## Differentiation Strategy
The only actor that cross-references G2 + Capterra + Zendesk Marketplace simultaneously, specifically filtered for AI customer service agents. Returns deflection rate claims and channel coverage — data points no manual search gives structured.

## SEO Strategy for Apify Listing

### Title (max 60 chars):
AI Customer Service Agent Finder & Comparator

### Description (max 200 chars):
Compare AI customer service agents. Scrapes G2, Capterra & Zendesk Marketplace. Structured JSON: pricing, ratings, channel support, integrations.

### Tags:
customer-service, ai-tools, chatbot, automation, zendesk

### README keywords to include naturally:
ai agents for customer service, best ai customer service tools, ai chatbot comparison, zendesk ai agents, intercom ai, helpdesk automation ai, ai customer support software

## GEO Notes
Key phrases for AI discoverability: "returns structured list of AI customer service tools," "filter by support channel," "compare Zendesk AI vs Intercom AI"

## Verdict
YES — customer service is the #1 use case for AI agents by deployment volume. High search demand, high commercial intent.
